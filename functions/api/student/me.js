import { error, json, requireStudent } from '../_utils.js'

async function getGroupState(env, userId) {
  const membership = await env.DB.prepare(`
    SELECT g.id, g.code, g.sort_order AS sortOrder,
           a.topic_id AS topicId, t.label AS topicLabel
    FROM group_members gm
    JOIN course_groups g ON g.id = gm.group_id
    LEFT JOIN topic_assignments a ON a.group_id = g.id
    LEFT JOIN topics t ON t.id = a.topic_id
    WHERE gm.user_id = ?
  `).bind(userId).first()
  if (!membership) return null

  const members = await env.DB.prepare(`
    SELECT u.id, u.username AS studentNumber, u.display_name AS displayName
    FROM group_members gm
    JOIN users u ON u.id = gm.user_id
    WHERE gm.group_id = ? AND u.status = 'active'
    ORDER BY gm.joined_at, u.username
  `).bind(membership.id).all()

  return {
    id: membership.id,
    code: membership.code,
    sortOrder: membership.sortOrder,
    topicId: membership.topicId,
    topicLabel: membership.topicLabel,
    members: members.results || [],
  }
}

export async function onRequestGet(context) {
  const { request, env } = context
  const auth = await requireStudent(request, env, { allowPasswordChange: true })
  if (auth.response) return auth.response
  try {
    return json({
      authenticated: true,
      student: {
        id: auth.user.id,
        studentNumber: auth.user.username,
        displayName: auth.user.displayName,
        mustChangePassword: Number(auth.user.mustChangePassword) === 1,
      },
      group: await getGroupState(env, auth.user.id),
    })
  } catch (cause) {
    console.error('student me failed', cause)
    return error('学生数据暂时无法读取', 503)
  }
}

export { getGroupState }
