#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parse } from '@babel/parser'
import {
  CRAP_MODULES,
  CRAP_THRESHOLD,
  CRAP_WARNING_THRESHOLD,
} from './crap-modules.mjs'

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bgRed: '\x1b[41m\x1b[37m',
  bgGreen: '\x1b[42m\x1b[30m',
}

export function normalizeCoveragePath(filePath, cwd = process.cwd()) {
  if (!filePath) return ''
  const relative = path.isAbsolute(filePath) ? path.relative(cwd, filePath) : filePath
  return path.normalize(relative).replace(/^\.\//, '')
}

/** Parse LCOV into file paths and executable-line hit counts. */
export function parseLcov(lcovText, cwd = process.cwd()) {
  const records = {}
  let currentFile = null

  for (const rawLine of lcovText.split('\n')) {
    const line = rawLine.trim()
    if (line.startsWith('SF:')) {
      currentFile = normalizeCoveragePath(line.slice(3).trim(), cwd)
      records[currentFile] = { lines: {} }
    } else if (line.startsWith('DA:') && currentFile) {
      const [lineNumber, count] = line.slice(3).split(',').map(Number)
      records[currentFile].lines[lineNumber] = count
    }
  }

  return records
}

/** Extract functions and a lightweight cyclomatic-complexity score from source. */
export function extractFunctionsWithComplexity(filePath) {
  const code = fs.readFileSync(filePath, 'utf8')
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx'],
  })
  const functions = []

  function walk(node, parent, currentFunction) {
    if (!node || typeof node !== 'object') return

    let functionContext = currentFunction
    const isFunction = [
      'FunctionDeclaration',
      'FunctionExpression',
      'ArrowFunctionExpression',
    ].includes(node.type)

    if (isFunction) {
      const name = node.id?.name
        || (parent?.type === 'VariableDeclarator' && parent.id?.name)
        || (parent?.type === 'Property' && parent.key?.name)
        || (parent?.type === 'AssignmentExpression' && parent.left?.name)
        || '<anonymous>'
      functionContext = {
        name,
        startLine: node.loc.start.line,
        endLine: node.loc.end.line,
        complexity: 1,
      }
      functions.push(functionContext)
    }

    if (currentFunction) {
      const branchNode = [
        'IfStatement',
        'ConditionalExpression',
        'ForStatement',
        'ForInStatement',
        'ForOfStatement',
        'WhileStatement',
        'DoWhileStatement',
        'CatchClause',
      ].includes(node.type)
      if (branchNode) currentFunction.complexity += 1
      if (node.type === 'LogicalExpression' && ['&&', '||', '??'].includes(node.operator)) {
        currentFunction.complexity += 1
      }
      if (node.type === 'SwitchCase' && node.test) currentFunction.complexity += 1
    }

    for (const [key, child] of Object.entries(node)) {
      if (key === 'loc') continue
      if (Array.isArray(child)) child.forEach((item) => walk(item, node, functionContext))
      else if (child && typeof child === 'object') walk(child, node, functionContext)
    }
  }

  walk(ast.program, null, null)
  return functions
}

export function calculateCrap(complexity, coverage) {
  return complexity ** 2 * (1 - coverage) ** 3 + complexity
}

export function evaluateFunctions(filePath, coverageRecord) {
  const functions = extractFunctionsWithComplexity(filePath)
  const lines = coverageRecord?.lines || {}
  const hasCoverageRecord = Boolean(coverageRecord)

  return functions.map((fn) => {
    let totalLines = 0
    let coveredLines = 0
    for (let line = fn.startLine; line <= fn.endLine; line += 1) {
      if (line in lines) {
        totalLines += 1
        if (lines[line] > 0) coveredLines += 1
      }
    }

    // A present record with no executable lines is harmless. A missing record is never coverage.
    const coverage = hasCoverageRecord ? (totalLines === 0 ? 1 : coveredLines / totalLines) : 0
    const crap = calculateCrap(fn.complexity, coverage)
    return {
      ...fn,
      coveredLines,
      totalLines,
      coverage,
      crap,
      isCrap: crap > CRAP_THRESHOLD,
      isModerate: crap > CRAP_WARNING_THRESHOLD && crap <= CRAP_THRESHOLD,
    }
  })
}

function pad(value, length, align = 'left') {
  const content = String(value)
  const amount = Math.max(0, length - content.length)
  return align === 'right' ? ' '.repeat(amount) + content : content + ' '.repeat(amount)
}

function runVitestCoverage(reportDirectory) {
  const vitestBin = fileURLToPath(new URL('../node_modules/vitest/vitest.mjs', import.meta.url))
  return spawnSync(process.execPath, [
    vitestBin,
    'run',
    '--coverage.enabled',
    '--coverage.provider', 'v8',
    '--coverage.reporter', 'lcov',
    '--coverage.reportsDirectory', reportDirectory,
  ], {
    cwd: process.cwd(),
    encoding: 'utf8',
  })
}

export function runCrapEvaluation({
  modules = CRAP_MODULES,
  runCoverage = runVitestCoverage,
  cwd = process.cwd(),
  log = console.log,
  error = console.error,
} = {}) {
  log(`\n${colors.bold}${colors.cyan}========================================================================${colors.reset}`)
  log(`${colors.bold}${colors.cyan}         CRAP (Change Risk Anti-Patterns) 风险诊断与代码体检            ${colors.reset}`)
  log(`${colors.bold}${colors.cyan}========================================================================${colors.reset}`)
  log(`${colors.dim}公式: CRAP = C² × (1 - Cov)³ + C  |  安全阈值: ≤ ${CRAP_THRESHOLD}  |  理想健康值: ≤ ${CRAP_WARNING_THRESHOLD}${colors.reset}\n`)
  log(`${colors.dim}>> 正在运行 Vitest 并采集 V8 覆盖率数据...${colors.reset}`)

  const reportDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'crap-coverage-'))
  try {
    const result = runCoverage(reportDirectory)
    if (result.status !== 0 || result.error) {
      error(`${colors.red}单元测试执行失败，无法完成 CRAP 评估:${colors.reset}\n${result.stdout || result.stderr || result.error?.message || ''}`)
      return 1
    }

    const lcovPath = path.join(reportDirectory, 'lcov.info')
    if (!fs.existsSync(lcovPath)) {
      error(`${colors.red}未生成 LCOV 覆盖率报告，无法完成 CRAP 评估。${colors.reset}`)
      return 1
    }

    const coverageMap = parseLcov(fs.readFileSync(lcovPath, 'utf8'), cwd)
    let totalFunctions = 0
    let crapCount = 0
    let highestCrap = 0
    let highestFunction = ''
    let invalidModuleCount = 0

    for (const module of modules) {
      const sourcePath = module.src
      const normalizedPath = normalizeCoveragePath(sourcePath, cwd)
      log(`\n${colors.bold}📄 评估模块: ${colors.cyan}${sourcePath}${colors.reset}`)

      if (!fs.existsSync(sourcePath)) {
        invalidModuleCount += 1
        error(`  ${colors.red}文件不存在: ${sourcePath}${colors.reset}`)
        continue
      }

      const coverageRecord = coverageMap[normalizedPath]
      if (!coverageRecord) {
        invalidModuleCount += 1
        error(`  ${colors.red}没有覆盖率记录: ${sourcePath}（按 0% 覆盖处理）${colors.reset}`)
      }
      const results = evaluateFunctions(sourcePath, coverageRecord)
        .sort((first, second) => second.crap - first.crap)

      log('┌──────────────────────────────┬────────┬────────────┬──────────┬────────┬──────────┐')
      log('│ Function                     │ Line   │ Complexity │ Coverage │ CRAP   │ Status   │')
      log('├──────────────────────────────┼────────┼────────────┼──────────┼────────┼──────────┤')
      for (const item of results) {
        totalFunctions += 1
        if (item.crap > highestCrap) {
          highestCrap = item.crap
          highestFunction = `${module.name} -> ${item.name} (L${item.startLine})`
        }
        if (item.isCrap) crapCount += 1
        const status = item.isCrap ? '🔴 CRAP' : item.isModerate ? '🟡 WARN' : '🟢 OK'
        const statusColor = item.isCrap ? colors.red : item.isModerate ? colors.yellow : colors.green
        const displayName = item.name.length > 28 ? `${item.name.slice(0, 25)}...` : item.name
        log(`│ ${pad(displayName, 28)} │ ${pad(`L${item.startLine}`, 6)} │ ${pad(item.complexity, 10, 'right')} │ ${pad(`${(item.coverage * 100).toFixed(1)}%`, 8, 'right')} │ ${pad(item.crap.toFixed(1), 6, 'right')} │ ${statusColor}${pad(status, 8)}${colors.reset} │`)
      }
      log('└──────────────────────────────┴────────┴────────────┴──────────┴────────┴──────────┘')
    }

    log(`\n${colors.bold}📊 CRAP 体检综合报告:${colors.reset}`)
    log(`- 评估函数总数: ${colors.bold}${totalFunctions}${colors.reset}`)
    log(`- 最高 CRAP 指数: ${highestCrap > CRAP_THRESHOLD ? colors.red : colors.green}${highestCrap.toFixed(1)}${colors.reset} (${highestFunction})`)
    log(`- CRAP 高危函数数 (CRAP > ${CRAP_THRESHOLD}): ${crapCount > 0 ? colors.red : colors.green}${crapCount}${colors.reset}`)
    log(`- 缺失模块或覆盖记录数: ${invalidModuleCount > 0 ? colors.red : colors.green}${invalidModuleCount}${colors.reset}`)

    if (crapCount > 0 || invalidModuleCount > 0) {
      error(`\n${colors.bgRed} ❌ CRAP 门禁未通过：请补充测试、覆盖率记录或降低复杂度。 ${colors.reset}\n`)
      return 1
    }
    log(`\n${colors.bgGreen} ✅ 所有监控函数均低于 ${CRAP_THRESHOLD}，覆盖率记录完整。 ${colors.reset}\n`)
    return 0
  } finally {
    fs.rmSync(reportDirectory, { recursive: true, force: true })
  }
}

const isDirectExecution = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href

if (isDirectExecution) process.exitCode = runCrapEvaluation()
