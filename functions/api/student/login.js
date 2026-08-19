import {
  assertSameOrigin,
  digestHex,
  error,
  normalizeStudentNumber,
  randomToken,
  readJson,
  studentSessionCookie,
  verifyStudentPassword,
  STUDENT_SESSION_TTL_SECONDS,
} from '../_utils.js'

function lockTimeMs(value) {
  if (!value) return 0
  const parsed = Date.parse(`${String(value).replace(' ', 'T')}Z`)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function onRequestPost(context) {
  const { request, env } = context
  if (!env.DB) return error('D1 数据库尚未绑定', 503)
  if (!env.STUDENT_PASSWORD_PEPPER) return error('学生登录尚未配置', 503)
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)

  const body = await readJson(request)
  const username = normalizeStudentNumber(body?.studentNumber || body?.username)
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!username || !password) return error('请输入学号和密码', 400)

  const user = await env.DB.prepare(`
    SELECT id, username, display_name AS displayName, password_hash AS passwordHash,
           status, must_change_password AS mustChangePassword, locked_until AS lockedUntil
    FROM users
    WHERE lower(username) = ? AND role = 'student'
  `).bind(username).first()
  if (!user) return error('学号或密码不正确', 401)
  if (user.status !== 'active') return error('学生账号已停用', 403)

  if (lockTimeMs(user.lockedUntil) > Date.now()) {
    return error('登录失败次数过多，请 15 分钟后重试', 429)
  }
  if (user.lockedUntil) {
    await env.DB.prepare(
      `UPDATE users SET failed_login_count = 0, locked_until = NULL WHERE id = ?`,
    ).bind(user.id).run()
  }

  const valid = await verifyStudentPassword(password, user.passwordHash, env.STUDENT_PASSWORD_PEPPER)
  if (!valid) {
    const result = await env.DB.prepare(`
      UPDATE users
      SET failed_login_count = failed_login_count + 1,
          locked_until = CASE WHEN failed_login_count + 1 >= 5 THEN datetime('now', '+15 minutes') ELSE NULL END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING failed_login_count AS failedLoginCount, locked_until AS lockedUntil
    `).bind(user.id).first()
    if (Number(result?.failedLoginCount) >= 5) return error('登录失败次数过多，请 15 分钟后重试', 429)
    return error('学号或密码不正确', 401)
  }

  const token = randomToken()
  const tokenHash = await digestHex(token)
  await env.DB.prepare(
    `INSERT INTO sessions (user_id, token_hash, kind, expires_at) VALUES (?, ?, 'student', datetime('now', ?))`,
  ).bind(user.id, tokenHash, `+${STUDENT_SESSION_TTL_SECONDS} seconds`).run()
  await env.DB.prepare(`
    UPDATE users
    SET failed_login_count = 0, locked_until = NULL, last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(user.id).run()

  return new Response(JSON.stringify({
    authenticated: true,
    studentNumber: user.username,
    displayName: user.displayName,
    mustChangePassword: Number(user.mustChangePassword) === 1,
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': studentSessionCookie(token),
    },
  })
}
