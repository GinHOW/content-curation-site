import { error, json, requireAdmin } from '../_utils.js'
import { staticResourceOverride } from '../_staticResourceOverrides.js'

export async function onRequestGet(context) {
  const { request, env } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  try {
    const result = await env.DB.prepare(`
      SELECT static_id, featured_override, is_hidden, updated_at
      FROM resource_static_overrides
      ORDER BY static_id
    `).all()
    return json({ overrides: (result.results || []).map(staticResourceOverride) })
  } catch (cause) {
    console.error('admin static resource overrides failed', cause)
    return error('资源展示设置暂时无法读取', 503)
  }
}
