import { assertSameOrigin, error, json, requireAdmin } from '../../_utils.js'
import {
  adminResource,
  parseResourceRequest,
  prepareResourceImage,
  validateResourcePayload,
} from '../../_resourceUtils.js'

const rowSelect = `
  SELECT id, type, resource_category, title, url, normalized_url, content_overview, tags_json,
         image_key, image_content_type,
         submitter_name, submission_source, status, is_featured, source_ip_hash,
         created_at, updated_at, reviewed_at
  FROM resource_submissions
`

export async function onRequestPatch(context) {
  const { request, env, params } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)

  const current = await env.DB.prepare(`${rowSelect} WHERE id = ?`).bind(params.id).first()
  if (!current) return error('资源记录不存在', 404)
  const { body, imageFile, removeImage } = await parseResourceRequest(request)
  const currentTags = (() => {
    try { return JSON.parse(current.tags_json || '[]') } catch { return [] }
  })()
  const nextType = body?.type ?? current.type
  const validated = validateResourcePayload({
    type: nextType,
    category: body?.category ?? (nextType === current.type ? current.resource_category : ''),
    title: body?.title ?? current.title,
    url: body?.url ?? current.url,
    contentOverview: body?.contentOverview ?? current.content_overview,
    tags: body?.tags ?? currentTags,
    submitterName: body?.submitterName ?? current.submitter_name ?? '',
    status: body?.status ?? current.status,
    isFeatured: body?.isFeatured ?? Boolean(current.is_featured),
  }, { allowStatus: true })
  if (validated.error) return validated.error
  const value = validated.value
  const duplicate = await env.DB.prepare(
    `SELECT id FROM resource_submissions WHERE normalized_url = ? AND status IN ('pending', 'approved') AND id <> ? LIMIT 1`,
  ).bind(value.normalizedUrl, params.id).first()
  if (duplicate) return error('这条链接已经在资源审核队列或资源库中', 409)

  const image = await prepareResourceImage(imageFile, env, params.id, {
    imageWidth: body?.imageWidth,
    imageHeight: body?.imageHeight,
    imageOriginalBytes: body?.imageOriginalBytes,
    imageOriginalName: body?.imageOriginalName,
  })
  if (image.error) return image.error
  const imageKey = image.value?.key || (removeImage ? null : current.image_key)
  const imageContentType = image.value?.contentType || (removeImage ? null : current.image_content_type)
  const reviewedAt = value.status === 'pending' ? null : (current.reviewed_at || new Date().toISOString())
  let result
  try {
    result = await env.DB.prepare(`
      UPDATE resource_submissions
      SET type = ?, resource_category = ?, title = ?, url = ?, normalized_url = ?, content_overview = ?,
          tags_json = ?, image_key = ?, image_content_type = ?, submitter_name = ?,
          status = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP, reviewed_at = ?
      WHERE id = ?
    `).bind(
      value.type,
      value.category,
      value.title,
      value.url,
      value.normalizedUrl,
      value.contentOverview,
      JSON.stringify(value.tags),
      imageKey,
      imageContentType,
      value.submitterName,
      value.status,
      value.isFeatured ? 1 : 0,
      reviewedAt,
      params.id,
    ).run()
  } catch (cause) {
    if (image.value?.key) await env.RESOURCE_IMAGES.delete(image.value.key).catch(() => {})
    if (String(cause?.message || cause).includes('UNIQUE')) return error('这条链接已经在资源审核队列或资源库中', 409)
    console.error('teacher resource update failed', cause)
    return error('资源更新失败，请重试', 503)
  }
  if (!result.success) {
    if (image.value?.key) await env.RESOURCE_IMAGES.delete(image.value.key).catch(() => {})
    return error('资源更新失败，请重试', 503)
  }
  if (current.image_key && current.image_key !== imageKey && env.RESOURCE_IMAGES) {
    await env.RESOURCE_IMAGES.delete(current.image_key).catch(() => {})
  }
  const updated = await env.DB.prepare(`${rowSelect} WHERE id = ?`).bind(params.id).first()
  return json({ resource: adminResource(updated) })
}
