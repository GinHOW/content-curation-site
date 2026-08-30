import { digestHex, error, randomToken, readJson } from './_utils.js'

export const RESOURCE_TYPES = new Set(['article', 'video', 'website', 'tool'])
export const RESOURCE_STATUSES = new Set(['pending', 'approved', 'rejected'])
export const RESOURCE_CATEGORY_VALUES = {
  article: new Set(['course', 'classic']),
  video: new Set(['ai-coding', 'course']),
  website: new Set(['case', 'exhibition', 'news']),
  tool: new Set(['skill', 'external']),
}
export const MAX_RESOURCE_URL_LENGTH = 2048
export const MAX_RESOURCE_IMAGE_BYTES = 1024 * 1024
export const RESOURCE_IMAGE_TYPES = new Map([
  ['image/webp', 'webp'],
])

export function cleanResourceType(value) {
  const type = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return RESOURCE_TYPES.has(type) ? type : ''
}

export function cleanResourceCategory(type, value) {
  const category = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return RESOURCE_CATEGORY_VALUES[type]?.has(category) ? category : ''
}

export function normalizeResourceUrl(value) {
  if (typeof value !== 'string') return ''
  const raw = value.trim()
  if (!raw || raw.length > MAX_RESOURCE_URL_LENGTH) return ''
  try {
    const parsed = new URL(raw)
    if (!['http:', 'https:'].includes(parsed.protocol)) return ''
    parsed.hash = ''
    parsed.hostname = parsed.hostname.toLowerCase()
    if ((parsed.protocol === 'http:' && parsed.port === '80') || (parsed.protocol === 'https:' && parsed.port === '443')) {
      parsed.port = ''
    }
    if (parsed.pathname === '/') parsed.pathname = ''
    return parsed.toString()
  } catch {
    return ''
  }
}

function cleanTags(value) {
  const values = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[,，\n]/)
      : []
  const tags = []
  for (const item of values) {
    const tag = typeof item === 'string' ? item.trim() : ''
    if (!tag || tags.includes(tag)) continue
    if (tag.length > 20 || tags.length >= 5) return null
    tags.push(tag)
  }
  return tags
}

export function validateResourcePayload(body, { allowStatus = false } = {}) {
  const type = cleanResourceType(body?.type)
  const category = cleanResourceCategory(type, body?.category)
  const rawCategory = typeof body?.category === 'string' ? body.category.trim() : ''
  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  const url = typeof body?.url === 'string' ? body.url.trim() : ''
  const overview = typeof body?.contentOverview === 'string'
    ? body.contentOverview.trim()
    : typeof body?.overview === 'string'
      ? body.overview.trim()
      : ''
  const submitterName = typeof body?.submitterName === 'string' ? body.submitterName.trim() : ''
  const tags = cleanTags(body?.tags)
  const normalizedUrl = normalizeResourceUrl(url)

  if (!type) return { error: error('请选择资源类型', 400) }
  if (rawCategory && !category) return { error: error('资源分类无效', 400) }
  if (allowStatus && type === 'website' && !category) return { error: error('请选择网页分类：案例网站、展览网站或资讯网站', 400) }
  if (!title || title.length > 120) return { error: error('标题需要为 1–120 个字符', 400) }
  if (!normalizedUrl) return { error: error('请输入有效的 HTTP 或 HTTPS 链接', 400) }
  if (!overview || overview.length > 600) return { error: error('内容概述需要为 1–600 个字符', 400) }
  if (submitterName.length > 40) return { error: error('姓名不能超过 40 个字符', 400) }
  if (!tags) return { error: error('标签最多 5 个，每个不能超过 20 个字符', 400) }

  let status = 'pending'
  if (allowStatus && typeof body?.status === 'string' && RESOURCE_STATUSES.has(body.status)) status = body.status
  const isFeatured = [true, 1, '1', 'true', 'on'].includes(body?.isFeatured) && status === 'approved'

  return {
    value: {
      type,
      category: category || null,
      title,
      url,
      normalizedUrl,
      contentOverview: overview,
      tags,
      submitterName: submitterName || null,
      status,
      isFeatured,
    },
  }
}

export async function parseResourceRequest(request) {
  const contentType = request.headers.get('Content-Type') || ''
  if (!contentType.toLowerCase().includes('multipart/form-data')) {
    return { body: await readJson(request), imageFile: null, removeImage: false }
  }

  try {
    const form = await request.formData()
    const body = {}
    for (const field of ['type', 'category', 'title', 'url', 'contentOverview', 'tags', 'submitterName', 'status', 'isFeatured', 'turnstileToken', 'imageWidth', 'imageHeight', 'imageOriginalBytes', 'imageOriginalName']) {
      const value = form.get(field)
      if (typeof value === 'string') body[field] = value
    }
    const imageFile = form.get('image')
    const removeImage = ['1', 'true', 'on'].includes(String(form.get('removeImage') || '').toLowerCase())
    return {
      body,
      imageFile: imageFile && typeof imageFile.arrayBuffer === 'function' && Number(imageFile.size || 0) > 0 ? imageFile : null,
      removeImage,
    }
  } catch {
    return { body: null, imageFile: null, removeImage: false }
  }
}

export async function prepareResourceImage(file, env, resourceId, metadata = {}) {
  if (!file) return { value: null }
  if (!env.RESOURCE_IMAGES) return { error: error('图片存储尚未配置，请联系教师', 503) }

  const contentType = String(file.type || '').toLowerCase()
  const extension = RESOURCE_IMAGE_TYPES.get(contentType)
  const size = Number(file.size || 0)
  if (!extension || !Number.isFinite(size) || size < 1 || size > MAX_RESOURCE_IMAGE_BYTES) {
    return { error: error('图片需为浏览器压缩后的 WebP，且不超过 1MB', 400) }
  }

  let data
  try {
    data = await file.arrayBuffer()
  } catch {
    return { error: error('图片读取失败，请重新选择文件', 400) }
  }
  if (!data || data.byteLength < 1 || data.byteLength > MAX_RESOURCE_IMAGE_BYTES) {
    return { error: error('图片需为浏览器压缩后的 WebP，且不超过 1MB', 400) }
  }

  const key = `resource-submissions/${resourceId}/${randomToken().slice(0, 24)}.${extension}`
  try {
    await env.RESOURCE_IMAGES.put(key, data, {
      httpMetadata: {
        contentType,
        cacheControl: 'public, max-age=31536000, immutable',
      },
      customMetadata: {
        resourceId,
        imageWidth: String(metadata.imageWidth || ''),
        imageHeight: String(metadata.imageHeight || ''),
        originalBytes: String(metadata.imageOriginalBytes || ''),
        originalName: String(metadata.imageOriginalName || '').slice(0, 180),
      },
    })
  } catch (cause) {
    console.error('resource image upload failed', cause)
    return { error: error('图片保存失败，请稍后重试', 503) }
  }
  return { value: { key, contentType } }
}

export function resourceImageUrl(key) {
  return key ? `/api/resource-images/${encodeURIComponent(key)}` : ''
}

export function parseTags(value) {
  try {
    const parsed = JSON.parse(value || '[]')
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function publicResource(row) {
  return {
    id: row.id,
    type: row.type,
    category: row.resource_category || '',
    title: row.title,
    url: row.url,
    summary: row.content_overview,
    tags: parseTags(row.tags_json),
    imageUrl: resourceImageUrl(row.image_key),
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at,
  }
}

export function adminResource(row) {
  return {
    ...publicResource(row),
    normalizedUrl: row.normalized_url,
    contentOverview: row.content_overview,
    imageContentType: row.image_content_type,
    submitterName: row.submitter_name,
    submissionSource: row.submission_source,
    status: row.status,
    sourceIpHash: row.source_ip_hash,
    updatedAt: row.updated_at,
    reviewedAt: row.reviewed_at,
  }
}

export function newResourceId() {
  return `resource-${randomToken().slice(0, 24)}`
}

export async function rateLimitHash(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || 'unknown'
  const secret = env.SUBMISSION_RATE_LIMIT_SECRET || env.TURNSTILE_SECRET_KEY || 'local-resource-submission-rate-limit'
  return digestHex(`${secret}:${ip}`)
}
