import { error, json } from './_utils.js'
import { cleanResourceType, publicResource } from './_resourceUtils.js'

export async function onRequestGet(context) {
  const { request, env } = context
  if (!env.DB) return error('D1 数据库尚未绑定', 503)
  const type = new URL(request.url).searchParams.get('type') || ''
  if (type && !cleanResourceType(type)) return error('资源类型无效', 400)

  const result = await env.DB.prepare(`
    SELECT id, type, resource_category, title, url, content_overview, tags_json, image_key, is_featured, created_at
    FROM resource_submissions
    WHERE status = 'approved' ${type ? 'AND type = ?' : ''}
    ORDER BY is_featured DESC, created_at DESC
  `).bind(...(type ? [type] : [])).all()
  return json({ resources: (result.results || []).map(publicResource) })
}
