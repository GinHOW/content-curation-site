import { error } from './_utils.js'
import { resourceImageUrl } from './_resourceUtils.js'

export const RESOURCE_IMAGE_PREFIX = 'resource-submissions/'
const LEGACY_IMAGE_PATTERN = /^resource-image-[a-f0-9-]+\.(jpg|png|webp|gif|avif)$/i

const mediaRow = (object, resource) => {
  const metadata = object?.customMetadata || {}
  const key = object?.key || resource?.image_key || ''
  return {
    key,
    url: resourceImageUrl(key),
    resourceId: resource?.id || metadata.resourceId || null,
    resourceTitle: resource?.title || null,
    resourceType: resource?.type || null,
    resourceStatus: resource?.status || null,
    kind: resource ? 'linked' : 'orphan',
    size: Number(object?.size || 0),
    uploadedAt: object?.uploaded ? new Date(object.uploaded).toISOString() : null,
    width: Number(metadata.imageWidth || 0) || null,
    height: Number(metadata.imageHeight || 0) || null,
    originalBytes: Number(metadata.originalBytes || 0) || null,
    originalName: metadata.originalName || null,
  }
}

async function listAllObjects(bucket) {
  const objects = []
  let cursor
  for (let page = 0; page < 20; page += 1) {
    const result = await bucket.list({ prefix: RESOURCE_IMAGE_PREFIX, limit: 1000, ...(cursor ? { cursor } : {}) })
    objects.push(...(result.objects || []))
    if (!result.truncated || !result.cursor) break
    cursor = result.cursor
  }
  return objects
}

export async function listResourceMedia(env) {
  if (!env.DB || !env.RESOURCE_IMAGES) return { error: error('图片存储尚未配置', 503) }
  const result = await env.DB.prepare(`
    SELECT id, type, title, image_key, status
    FROM resource_submissions
    WHERE image_key IS NOT NULL AND image_key <> ''
    ORDER BY created_at DESC
  `).all()
  const resources = result.results || []
  const byKey = new Map(resources.map((resource) => [resource.image_key, resource]))
  const objects = await listAllObjects(env.RESOURCE_IMAGES)
  const media = objects.map((object) => mediaRow(object, byKey.get(object.key)))
  for (const resource of resources) {
    if (LEGACY_IMAGE_PATTERN.test(resource.image_key) && !media.some((item) => item.key === resource.image_key)) {
      media.push(mediaRow(null, resource))
    }
  }
  media.sort((a, b) => (a.kind === b.kind ? String(b.uploadedAt || '').localeCompare(String(a.uploadedAt || '')) : a.kind === 'linked' ? -1 : 1))
  return { value: media }
}

export function validateMediaKey(value) {
  if (typeof value !== 'string' || !value || value.length > 240) return ''
  if (value.startsWith(RESOURCE_IMAGE_PREFIX) && /^resource-submissions\/resource-[a-f0-9-]+\/[a-f0-9]+\.webp$/i.test(value)) return value
  if (LEGACY_IMAGE_PATTERN.test(value)) return value
  return ''
}
