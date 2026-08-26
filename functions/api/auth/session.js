import { digestHex, error, getCookie, json } from '../_utils.js'

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.DB) return error('D1 数据库尚未绑定', 503)

  try {
    const adminToken = getCookie(request, 'cc_admin_session')
    const studentToken = getCookie(request, 'cc_student_session')

    let teacher = false
    let student = null

    if (adminToken) {
      const adminTokenHash = await digestHex(adminToken)
      const adminSession = await env.DB.prepare(
        `SELECT id FROM sessions WHERE token_hash = ? AND kind = 'admin' AND expires_at > datetime('now')`,
      ).bind(adminTokenHash).first()
      teacher = Boolean(adminSession)
    }

    if (studentToken) {
      const studentTokenHash = await digestHex(studentToken)
      const studentSession = await env.DB.prepare(`
        SELECT u.id, u.username AS studentNumber, u.display_name AS displayName
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ?
          AND s.kind = 'student'
          AND s.expires_at > datetime('now')
          AND u.role = 'student'
          AND u.status = 'active'
      `).bind(studentTokenHash).first()

      if (studentSession) {
        student = {
          id: studentSession.id,
          studentNumber: studentSession.studentNumber,
          displayName: studentSession.displayName,
        }
      }
    }

    return json({
      authenticated: teacher || Boolean(student),
      roles: { student: Boolean(student), teacher },
      student,
    })
  } catch (cause) {
    console.error('auth session failed', cause)
    return error('登录状态暂时无法读取', 503)
  }
}
