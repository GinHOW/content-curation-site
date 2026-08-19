import {
  assertSameOrigin,
  error,
  hashStudentPassword,
  initialStudentPassword,
  isValidStudentNumber,
  json,
  normalizeStudentNumber,
  randomToken,
  readJson,
  requireAdmin,
} from '../_utils.js'

export async function onRequestGet(context) {
  const { request, env } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  try {
    const result = await env.DB.prepare(`
      SELECT u.id, u.username AS studentNumber, u.display_name AS displayName,
             u.status, u.must_change_password AS mustChangePassword,
             gm.group_id AS groupId, g.code AS groupCode,
             (SELECT COUNT(*) FROM group_members size_members WHERE size_members.group_id = gm.group_id) AS groupSize
      FROM users u
      LEFT JOIN group_members gm ON gm.user_id = u.id
      LEFT JOIN course_groups g ON g.id = gm.group_id
      WHERE u.role = 'student'
      ORDER BY lower(u.username), u.id
    `).all()
    return json({ students: result.results || [] })
  } catch (cause) {
    console.error('admin students list failed', cause)
    return error('学生名单暂时无法读取', 503)
  }
}

export async function onRequestPost(context) {
  const { request, env } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)
  if (!env.STUDENT_PASSWORD_PEPPER) return error('学生登录尚未配置', 503)

  const body = await readJson(request)
  if (!Array.isArray(body?.students) || body.students.length < 1 || body.students.length > 200) {
    return error('请提供 1–200 名学生', 400)
  }

  const normalized = []
  const seen = new Set()
  for (const item of body.students) {
    const studentNumber = normalizeStudentNumber(item?.studentNumber)
    const displayName = typeof item?.displayName === 'string' ? item.displayName.trim() : ''
    if (!isValidStudentNumber(studentNumber) || !displayName || displayName.length > 64) {
      return error('每行都需要有效的学号和姓名', 400)
    }
    if (seen.has(studentNumber)) return error(`名单中有重复学号：${studentNumber}`, 400)
    seen.add(studentNumber)
    normalized.push({ studentNumber, displayName })
  }

  const placeholders = normalized.map(() => '?').join(', ')
  const existingResult = await env.DB.prepare(
    `SELECT id, username FROM users WHERE role = 'student' AND lower(username) IN (${placeholders})`,
  ).bind(...normalized.map((item) => item.studentNumber)).all()
  const existing = new Map((existingResult.results || []).map((row) => [String(row.username).toLowerCase(), row]))
  const statements = []
  const credentials = []
  for (const item of normalized) {
    const current = existing.get(item.studentNumber)
    if (current) {
      statements.push(env.DB.prepare(
        `UPDATE users SET display_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role = 'student'`,
      ).bind(item.displayName, current.id))
      continue
    }

    const password = initialStudentPassword(item.studentNumber)
    const passwordHash = await hashStudentPassword(password, env.STUDENT_PASSWORD_PEPPER)
    const id = `student-${randomToken().slice(0, 24)}`
    statements.push(env.DB.prepare(`
      INSERT INTO users (id, username, display_name, password_hash, role, status, must_change_password)
      VALUES (?, ?, ?, ?, 'student', 'active', 1)
    `).bind(id, item.studentNumber, item.displayName, passwordHash))
    credentials.push({ studentNumber: item.studentNumber, displayName: item.displayName, initialPassword: password })
  }

  try {
    await env.DB.batch(statements)
  } catch (cause) {
    if (String(cause?.message || cause).includes('UNIQUE')) return error('名单中有账号已被其他操作创建，请刷新后重试', 409)
    console.error('admin students import failed', cause)
    return error('学生名单导入失败', 503)
  }

  return json({ created: credentials.length, updated: normalized.length - credentials.length, credentials }, 201)
}
