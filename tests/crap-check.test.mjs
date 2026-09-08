import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'vitest'
import {
  calculateCrap,
  evaluateFunctions,
  normalizeCoveragePath,
  parseLcov,
  runCrapEvaluation,
} from '../scripts/run-crap-check.mjs'

test('CRAP formula and LCOV paths use the documented threshold semantics', () => {
  assert.equal(calculateCrap(18, 0), 342)
  assert.equal(calculateCrap(18, 1), 18)
  const cwd = process.cwd()
  const source = path.join(cwd, 'src/utils/markdown/articleMarkdown.js')
  const coverage = parseLcov(`SF:${source}\nDA:3,1\nend_of_record\n`, cwd)
  assert.deepEqual(coverage['src/utils/markdown/articleMarkdown.js'].lines, { 3: 1 })
  assert.equal(normalizeCoveragePath('./src/utils/markdown/articleMarkdown.js', cwd), 'src/utils/markdown/articleMarkdown.js')
})

test('missing coverage records are scored as zero coverage rather than a false green', () => {
  const results = evaluateFunctions('src/composables/useScreenUniverseScene.js')
  const renderUniverse = results.find((item) => item.name === 'renderUniverse')
  assert.equal(renderUniverse.coverage, 0)
  assert.equal(renderUniverse.crap, 342)
})

test('the gate fails for coverage test failures, absent reports, and missing sources', () => {
  const silent = () => {}
  assert.equal(runCrapEvaluation({
    runCoverage: () => ({ status: 1, stdout: 'failed test' }),
    log: silent,
    error: silent,
  }), 1)

  assert.equal(runCrapEvaluation({
    runCoverage: () => ({ status: 0 }),
    log: silent,
    error: silent,
  }), 1)

  assert.equal(runCrapEvaluation({
    modules: [{ name: 'missing', src: 'src/not-present.js' }],
    runCoverage: (directory) => {
      fs.writeFileSync(path.join(directory, 'lcov.info'), '')
      return { status: 0 }
    },
    log: silent,
    error: silent,
  }), 1)
})
