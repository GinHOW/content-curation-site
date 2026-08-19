import {
  assertSameOrigin,
  digestHex,
  error,
  json,
  randomToken,
  readJson,
  sessionCookie,
  SESSION_TTL_SECONDS,
} from '../_utils.js'

export async function onRequestPost(context) {
  const { request, env } = context
  if (!env.DB) return error('D1 数据库尚未绑定', 503)
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)

  const body = await readJson(request)
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!password || !env.ADMIN_PASSWORD) return error('教师口令不正确', 401)

  const [expected, received] = await Promise.all([
    digestHex(env.ADMIN_PASSWORD),
    digestHex(password),
  ])
  if (expected !== received) return error('教师口令不正确', 401)

  const token = randomToken()
  const tokenHash = await digestHex(token)
  await env.DB.prepare(
    `INSERT INTO sessions (token_hash, kind, expires_at) VALUES (?, 'admin', datetime('now', ?))`,
  ).bind(tokenHash, `+${SESSION_TTL_SECONDS} seconds`).run()

  return new Response(JSON.stringify({ authenticated: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': sessionCookie(token),
    },
  })
}
