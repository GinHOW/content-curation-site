import http from 'node:http'
import { createHash, randomUUID } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

import * as authSession from '../functions/api/auth/session.js'
import * as adminLogin from '../functions/api/admin/login.js'
import * as adminLogout from '../functions/api/admin/logout.js'
import * as adminMe from '../functions/api/admin/me.js'
import * as adminGroups from '../functions/api/admin/groups.js'
import * as adminStudents from '../functions/api/admin/students.js'
import * as adminTopics from '../functions/api/admin/topics.js'
import * as adminResources from '../functions/api/admin/resource-submissions.js'
import * as adminResource from '../functions/api/admin/resource-submissions/[id].js'
import * as adminStaticResourceOverrides from '../functions/api/admin/resource-static-overrides.js'
import * as adminStaticResourceOverride from '../functions/api/admin/resource-static-overrides/[id].js'
import * as adminResourceMedia from '../functions/api/admin/resource-media.js'
import * as courseState from '../functions/api/course-state.js'
import * as publicResources from '../functions/api/resources.js'
import * as publicResourceSubmissions from '../functions/api/resource-submissions.js'
import * as staticResourceOverrides from '../functions/api/resource-static-overrides.js'
import * as resourceImages from '../functions/api/resource-images/[key].js'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distRoot = path.join(projectRoot, 'dist')
const migrationRoot = path.join(projectRoot, 'migrations')
const port = Number(process.env.PORT || 8788)

class D1Statement {
  constructor(db, sql) {
    this.db = db
    this.sql = sql
    this.args = []
  }

  bind(...args) {
    this.args = args
    return this
  }

  async first() {
    return this.db.prepare(this.sql).get(...this.args) || null
  }

  async all() {
    return { results: this.db.prepare(this.sql).all(...this.args) }
  }

  async run() {
    const result = this.db.prepare(this.sql).run(...this.args)
    return {
      success: true,
      meta: { changes: result.changes, last_row_id: result.lastInsertRowid },
    }
  }
}

class LocalD1 {
  constructor(db) {
    this.db = db
  }

  prepare(sql) {
    return new D1Statement(this.db, sql)
  }

  async batch(statements) {
    return Promise.all(statements.map((statement) => {
      const sql = statement.sql.trim().toUpperCase()
      if (sql.startsWith('SELECT')) return statement.all()
      if (sql.includes('RETURNING')) return statement.first()
      return statement.run()
    }))
  }
}

class LocalR2Object {
  constructor(buffer, metadata) {
    this.body = buffer
    this.size = buffer.byteLength
    this.uploaded = new Date()
    this.customMetadata = metadata?.customMetadata || {}
    this.httpEtag = `"${createHash('sha1').update(buffer).digest('hex')}"`
    this.httpMetadata = metadata?.httpMetadata || {}
  }

  writeHttpMetadata(headers) {
    if (this.httpMetadata.contentType) headers.set('Content-Type', this.httpMetadata.contentType)
    if (this.httpMetadata.contentLanguage) headers.set('Content-Language', this.httpMetadata.contentLanguage)
    if (this.httpMetadata.contentDisposition) headers.set('Content-Disposition', this.httpMetadata.contentDisposition)
    if (this.httpMetadata.contentEncoding) headers.set('Content-Encoding', this.httpMetadata.contentEncoding)
    if (this.httpMetadata.cacheControl) headers.set('Cache-Control', this.httpMetadata.cacheControl)
    if (this.httpMetadata.cacheExpiry) headers.set('Expires', new Date(this.httpMetadata.cacheExpiry).toUTCString())
  }
}

class LocalR2 {
  constructor() {
    this.objects = new Map()
  }

  async put(key, value, options = {}) {
    const buffer = Buffer.from(await new Response(value).arrayBuffer())
    const object = new LocalR2Object(buffer, options)
    object.key = key
    this.objects.set(key, object)
  }

  async get(key) {
    return this.objects.get(key) || null
  }

  async delete(key) {
    this.objects.delete(key)
  }

  async list(options = {}) {
    const prefix = options.prefix || ''
    const objects = [...this.objects.entries()]
      .filter(([key]) => key.startsWith(prefix))
      .map(([, object]) => object)
    return { objects, truncated: false, cursor: undefined }
  }
}

const env = {
  DB: null,
  RESOURCE_IMAGES: new LocalR2(),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || randomUUID().slice(0, 8),
  STUDENT_PASSWORD_PEPPER: process.env.STUDENT_PASSWORD_PEPPER || 'local-student-password-pepper',
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY || 'local-sim',
  SUBMISSION_RATE_LIMIT_SECRET: process.env.SUBMISSION_RATE_LIMIT_SECRET || 'local-resource-rate-limit-secret',
}

const createDatabase = async () => {
  const db = new DatabaseSync(':memory:')
  const migrations = (await readdir(migrationRoot))
    .filter((name) => name.endsWith('.sql'))
    .sort()
  for (const name of migrations) {
    db.exec(await readFile(path.join(migrationRoot, name), 'utf8'))
  }
  env.DB = new LocalD1(db)

  // 放入一条仅供本地预览的待审核样例，方便直接查看审核列表。
  db.prepare(`
    INSERT INTO resource_submissions (
      id, type, title, url, normalized_url, content_overview, tags_json,
      submitter_name, submission_source, status, is_featured
    ) VALUES (?, 'article', ?, ?, ?, ?, '[]', '本地模拟', 'visitor', 'pending', 0)
  `).run(
    `sim-${randomUUID()}`,
    '本地模拟：待审核资源',
    'https://example.com/local-resource-demo',
    'https://example.com/local-resource-demo',
    '用于检查教师审核、编辑与发布流程的本地样例。',
  )
}

const jsonResponse = (message, status = 404) => new Response(JSON.stringify({ error: message }), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
})

const routeApi = async (request, url) => {
  const pathname = url.pathname
  if (pathname === '/api/auth/session' && request.method === 'GET') return authSession.onRequestGet({ request, env })
  if (pathname === '/api/admin/login' && request.method === 'POST') return adminLogin.onRequestPost({ request, env })
  if (pathname === '/api/admin/logout' && request.method === 'POST') return adminLogout.onRequestPost({ request, env })
  if (pathname === '/api/admin/me' && request.method === 'GET') return adminMe.onRequestGet({ request, env })
  if (pathname === '/api/course-state' && request.method === 'GET') return courseState.onRequestGet({ request, env })
  if (pathname === '/api/admin/groups' && request.method === 'GET') return adminGroups.onRequestGet({ request, env })
  if (pathname === '/api/admin/students' && (request.method === 'GET' || request.method === 'POST')) {
    return request.method === 'GET'
      ? adminStudents.onRequestGet({ request, env })
      : adminStudents.onRequestPost({ request, env })
  }
  if (pathname === '/api/admin/topics' && request.method === 'POST') return adminTopics.onRequestPost({ request, env })
  if (pathname === '/api/admin/resource-submissions') {
    if (request.method === 'GET') return adminResources.onRequestGet({ request, env })
    if (request.method === 'POST') return adminResources.onRequestPost({ request, env })
  }
  if (pathname === '/api/admin/resource-static-overrides' && request.method === 'GET') {
    return adminStaticResourceOverrides.onRequestGet({ request, env })
  }
  if (pathname === '/api/admin/resource-media') {
    if (request.method === 'GET') return adminResourceMedia.onRequestGet({ request, env })
    if (request.method === 'DELETE') return adminResourceMedia.onRequestDelete({ request, env })
  }
  const staticOverrideMatch = pathname.match(/^\/api\/admin\/resource-static-overrides\/([^/]+)$/)
  if (staticOverrideMatch && request.method === 'PATCH') {
    return adminStaticResourceOverride.onRequestPatch({ request, env, params: { id: decodeURIComponent(staticOverrideMatch[1]) } })
  }
  const resourceMatch = pathname.match(/^\/api\/admin\/resource-submissions\/([^/]+)$/)
  if (resourceMatch && request.method === 'PATCH') {
    return adminResource.onRequestPatch({ request, env, params: { id: decodeURIComponent(resourceMatch[1]) } })
  }
  if (pathname === '/api/resources' && request.method === 'GET') return publicResources.onRequestGet({ request, env })
  if (pathname === '/api/resource-submissions' && request.method === 'POST') return publicResourceSubmissions.onRequestPost({ request, env })
  if (pathname === '/api/resource-static-overrides' && request.method === 'GET') return staticResourceOverrides.onRequestGet({ request, env })
  const imageMatch = pathname.match(/^\/api\/resource-images\/(.+)$/)
  if (imageMatch && request.method === 'GET') {
    return resourceImages.onRequestGet({ request, env, params: { key: decodeURIComponent(imageMatch[1]) } })
  }
  return null
}

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const serveStatic = async (request, url) => {
  if (!['GET', 'HEAD'].includes(request.method)) return jsonResponse('方法不支持', 405)
  let relativePath
  try {
    relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, '')
  } catch {
    return jsonResponse('文件不存在', 404)
  }
  let filePath = path.resolve(distRoot, relativePath || 'index.html')
  if (!filePath.startsWith(`${distRoot}${path.sep}`) || !existsSync(filePath)) filePath = path.join(distRoot, 'index.html')
  try {
    const body = await readFile(filePath)
    const headers = {
      'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'text/html; charset=utf-8',
      'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
    }
    if (request.method === 'HEAD') return new Response(null, { headers })
    return new Response(body, { headers })
  } catch {
    return jsonResponse('文件不存在', 404)
  }
}

const toWebRequest = async (incoming, url) => {
  const headers = new Headers()
  for (const [key, value] of Object.entries(incoming.headers)) {
    if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value)
  }
  const chunks = []
  for await (const chunk of incoming) chunks.push(chunk)
  const body = Buffer.concat(chunks)
  const init = { method: incoming.method, headers }
  if (!['GET', 'HEAD'].includes(incoming.method)) {
    init.body = body
    init.duplex = 'half'
  }
  return new Request(url, init)
}

const sendResponse = async (serverResponse, response) => {
  serverResponse.statusCode = response.status
  for (const [key, value] of response.headers) {
    if (key.toLowerCase() === 'set-cookie') {
      const cookies = typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [value]
      serverResponse.setHeader('Set-Cookie', cookies.map((cookie) => cookie.replace(/; Secure/gi, '')))
    } else {
      serverResponse.setHeader(key, value)
    }
  }
  if (serverResponse.req.method === 'HEAD' || !response.body) {
    serverResponse.end()
    return
  }
  serverResponse.end(Buffer.from(await response.arrayBuffer()))
}

await createDatabase()
const server = http.createServer(async (incoming, serverResponse) => {
  const url = new URL(incoming.url || '/', `http://${incoming.headers.host || `localhost:${port}`}`)
  try {
    if (url.pathname.startsWith('/api/')) {
      const request = await toWebRequest(incoming, url)
      const response = await routeApi(request, url)
      await sendResponse(serverResponse, response || jsonResponse('接口不存在', 404))
      return
    }
    const request = { method: incoming.method }
    await sendResponse(serverResponse, await serveStatic(request, url))
  } catch (cause) {
    console.error('[local-sim]', cause)
    await sendResponse(serverResponse, jsonResponse('本地模拟服务发生错误', 500))
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`LOCAL_SIM_READY http://localhost:${port}/manage/resources`)
  console.log(`LOCAL_SIM_ADMIN_PASSWORD ${env.ADMIN_PASSWORD}`)
  console.log('本地模拟使用内存 D1/R2，重启进程后数据会清空。')
})

const shutdown = () => server.close(() => process.exit(0))
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
