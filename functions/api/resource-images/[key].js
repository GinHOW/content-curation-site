import { error, requireAdmin } from '../_utils.js'

const IMAGE_KEY_PATTERN = /^(?:resource-image-[a-f0-9-]+\.(jpg|png|webp|gif|avif)|resource-submissions\/resource-[a-f0-9-]+\/[a-f0-9]+\.webp)$/i

export async function onRequestGet(context) {
  const { request, env, params } = context
  if (!env.DB || !env.RESOURCE_IMAGES) return error('图片存储尚未配置', 503)

  const key = typeof params.key === 'string' ? params.key : ''
  if (!IMAGE_KEY_PATTERN.test(key)) return error('图片不存在', 404)

  const resource = await env.DB.prepare(
    `SELECT status FROM resource_submissions WHERE image_key = ? LIMIT 1`,
  ).bind(key).first()
  if (!resource) return error('图片不存在', 404)
  if (resource.status !== 'approved') {
    const auth = await requireAdmin(request, env)
    if (auth.response) return error('图片不存在', 404)
  }

  const object = await env.RESOURCE_IMAGES.get(key)
  if (!object) return error('图片不存在', 404)
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('ETag', object.httpEtag)
  return new Response(object.body, { headers })
}
