import { error, json, requireAdmin } from '../_utils.js'
import { listResourceMedia, validateMediaKey } from '../_resourceMedia.js'

export async function onRequestGet(context) {
  const { request, env } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  const media = await listResourceMedia(env)
  if (media.error) return media.error
  return json({ media: media.value })
}

export async function onRequestDelete(context) {
  const { request, env } = context
  const auth = await requireAdmin(request, env)
  if (auth.response) return auth.response
  const key = validateMediaKey(new URL(request.url).searchParams.get('key'))
  if (!key) return error('图片对象无效', 400)
  const reference = await env.DB.prepare(`SELECT id FROM resource_submissions WHERE image_key = ? LIMIT 1`).bind(key).first()
  if (reference) return error('已关联资源的封面请先在资源编辑中移除', 409)
  await env.RESOURCE_IMAGES.delete(key)
  return json({ deleted: key })
}
