import { assertSameOrigin, clearedStudentSessionCookie, digestHex, error, getCookie, json } from '../_utils.js'

export async function onRequestPost(context) {
  const { request, env } = context
  if (!env.DB) return error('D1 数据库尚未绑定', 503)
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)
  const token = getCookie(request, 'cc_student_session')
  if (token) {
    await env.DB.prepare(`DELETE FROM sessions WHERE token_hash = ? AND kind = 'student'`)
      .bind(await digestHex(token)).run()
  }
  const response = json({ authenticated: false })
  response.headers.set('Set-Cookie', clearedStudentSessionCookie())
  return response
}
