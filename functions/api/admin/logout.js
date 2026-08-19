import { assertSameOrigin, clearedSessionCookie, digestHex, error, getCookie, json } from '../_utils.js'

export async function onRequestPost(context) {
  const { request, env } = context
  if (!env.DB) return error('D1 数据库尚未绑定', 503)
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)
  const token = getCookie(request, 'cc_admin_session')
  if (token) {
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ? AND kind = ?')
      .bind(await digestHex(token), 'admin').run()
  }
  return new Response(JSON.stringify({ authenticated: false }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': clearedSessionCookie(),
    },
  })
}
