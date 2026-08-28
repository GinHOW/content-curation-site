import { assertSameOrigin, error, json, readJson, requireAdmin } from '../../_utils.js'
import { cleanStaticResourceId, staticOverrideError, staticResourceOverride } from '../../_staticResourceOverrides.js'

const asBoolean = (value) => typeof value === 'boolean' ? value : null

export async function onRequestPatch(context) {
  const { request, env, params } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)

  const staticId = cleanStaticResourceId(params.id)
  if (!staticId) return staticOverrideError()
  const body = await readJson(request)
  const featured = asBoolean(body?.isFeatured)
  const hidden = asBoolean(body?.isHidden)
  if (featured === null && hidden === null) return error('请提供精选或隐藏状态', 400)

  const current = await env.DB.prepare(`
    SELECT static_id, featured_override, is_hidden, updated_at
    FROM resource_static_overrides
    WHERE static_id = ?
  `).bind(staticId).first()
  const featuredOverride = featured === null ? current?.featured_override ?? null : (featured ? 1 : 0)
  const isHidden = hidden === null ? Number(current?.is_hidden || 0) : (hidden ? 1 : 0)

  try {
    await env.DB.prepare(`
      INSERT INTO resource_static_overrides (static_id, featured_override, is_hidden, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(static_id) DO UPDATE SET
        featured_override = excluded.featured_override,
        is_hidden = excluded.is_hidden,
        updated_at = CURRENT_TIMESTAMP
    `).bind(staticId, featuredOverride, isHidden).run()
    const updated = await env.DB.prepare(`
      SELECT static_id, featured_override, is_hidden, updated_at
      FROM resource_static_overrides
      WHERE static_id = ?
    `).bind(staticId).first()
    return json({ override: staticResourceOverride(updated) })
  } catch (cause) {
    console.error('static resource override update failed', cause)
    return error('资源展示设置保存失败，请重试', 503)
  }
}
