import { assertSameOrigin, error, json, requireAdmin } from '../_utils.js'
import {
  adminResource,
  newResourceId,
  parseResourceRequest,
  prepareResourceImage,
  validateResourcePayload,
} from '../_resourceUtils.js'

const rowSelect = `
  SELECT id, type, resource_category, title, url, normalized_url, content_overview, tags_json,
         image_key, image_content_type,
         submitter_name, submission_source, status, is_featured, source_ip_hash,
         created_at, updated_at, reviewed_at
  FROM resource_submissions
`

export async function onRequestGet(context) {
  const { request, env } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  const status = new URL(request.url).searchParams.get('status') || 'pending'
  if (!['all', 'pending', 'approved', 'rejected'].includes(status)) return error('审核状态无效', 400)
  const result = await env.DB.prepare(`${rowSelect}${status === 'all' ? '' : 'WHERE status = ?'} ORDER BY created_at DESC LIMIT 500`)
    .bind(...(status === 'all' ? [] : [status]))
    .all()
  return json({ resources: (result.results || []).map(adminResource) })
}

export async function onRequestPost(context) {
  const { request, env } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)
  const { body, imageFile } = await parseResourceRequest(request)
  const validated = validateResourcePayload({ ...body, submitterName: body?.submitterName || '教师' }, { allowStatus: true })
  if (validated.error) return validated.error
  const value = validated.value
  const duplicate = await env.DB.prepare(
    `SELECT id FROM resource_submissions WHERE normalized_url = ? AND status IN ('pending', 'approved') LIMIT 1`,
  ).bind(value.normalizedUrl).first()
  if (duplicate) return error('这条链接已经在资源审核队列或资源库中', 409)

  const id = newResourceId()
  const image = await prepareResourceImage(imageFile, env, id, {
    imageWidth: body?.imageWidth,
    imageHeight: body?.imageHeight,
    imageOriginalBytes: body?.imageOriginalBytes,
    imageOriginalName: body?.imageOriginalName,
  })
  if (image.error) return image.error
  try {
    await env.DB.prepare(`
      INSERT INTO resource_submissions (
        id, type, resource_category, title, url, normalized_url, content_overview, tags_json,
        image_key, image_content_type, submitter_name, submission_source, status, is_featured, reviewed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'teacher', ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      id,
      value.type,
      value.category,
      value.title,
      value.url,
      value.normalizedUrl,
      value.contentOverview,
      JSON.stringify(value.tags),
      image.value?.key || null,
      image.value?.contentType || null,
      value.submitterName,
      value.status,
      value.isFeatured ? 1 : 0,
    ).run()
  } catch (cause) {
    if (image.value?.key) await env.RESOURCE_IMAGES.delete(image.value.key).catch(() => {})
    if (String(cause?.message || cause).includes('UNIQUE')) return error('这条链接已经在资源审核队列或资源库中', 409)
    console.error('teacher resource create failed', cause)
    return error('资源保存失败，请稍后重试', 503)
  }
  const created = await env.DB.prepare(`${rowSelect} WHERE id = ?`).bind(id).first()
  return json({ resource: adminResource(created) }, 201)
}
