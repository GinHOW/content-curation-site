const RESOURCE_TYPES = new Set(['website', 'repository', 'video'])

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const normalizeUrl = (value) => {
  try {
    const parsed = new URL(value)
    parsed.hash = ''
    parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, '')
    parsed.pathname = parsed.pathname.replace(/\/$/, '') || '/'
    return parsed.toString()
  } catch {
    return ''
  }
}

const parseResourceFields = (body) => {
  const fields = {}
  body.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([a-z][\w-]*)\s*:\s*(.*?)\s*$/i)
    if (!match) return
    const key = match[1].toLowerCase()
    const value = match[2].trim()
    if (value) fields[key] = value
  })
  return fields
}

const flattenResources = (resources = []) => resources.flatMap((resource) => {
  const entries = []
  if (resource.url) entries.push(resource)
  if (resource.fallbackUrl) entries.push({ ...resource, url: resource.fallbackUrl })
  for (const link of resource.links || []) {
    if (link.url) {
      entries.push({
        ...resource,
        ...link,
        title: link.label || resource.title,
        summary: link.desc || resource.summary,
        url: link.url,
      })
    }
  }
  return entries
})

const findMatchedResource = (url, resources) => {
  const normalizedUrl = normalizeUrl(url)
  if (!normalizedUrl) return null
  return flattenResources(resources).find((resource) => normalizeUrl(resource.url) === normalizedUrl) || null
}

const normalizedType = (type = '') => {
  const value = type.trim().toLowerCase()
  if (value === 'web' || value === 'site') return 'website'
  if (value === 'repo' || value === 'github') return 'repository'
  if (value === 'youtube' || value === 'bilibili') return 'video'
  return value
}

export const getVideoEmbed = (url) => {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase()
    let youtubeId = ''

    if (hostname === 'youtu.be') youtubeId = parsed.pathname.slice(1)
    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      youtubeId = parsed.searchParams.get('v') || parsed.pathname.match(/^\/(?:shorts|embed)\/([^/?]+)/)?.[1] || ''
    }
    if (youtubeId) {
      return {
        platform: 'YouTube',
        src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?autoplay=0`,
      }
    }

    if (hostname === 'bilibili.com' || hostname === 'm.bilibili.com') {
      const bvid = parsed.pathname.match(/\/video\/(BV[\w-]+)/i)?.[1]
      if (bvid) {
        return {
          platform: 'Bilibili',
          src: `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bvid)}&page=1&high_quality=1&danmaku=0&autoplay=0`,
        }
      }
    }
  } catch {
    return null
  }
  return null
}

const resolvePreview = (value, articleId) => {
  if (!value) return ''
  if (/^(?:https?:)?\/\//i.test(value) || value.startsWith('/')) return value
  return `/articles/${articleId}/${value.replace(/^\.\//, '')}`
}

const isSafeResourceUrl = (value) => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const warnInvalidResource = (fields) => {
  if (import.meta.env?.DEV) {
    console.warn('Invalid Markdown resource block:', fields)
  }
}

const renderPreview = (preview, alt) => preview
  ? `<figure class="link-card-preview"><img src="${escapeHtml(preview)}" alt="${escapeHtml(alt)}" loading="lazy" referrerpolicy="no-referrer" /></figure>`
  : ''

const getResourceLabel = (type, language = 'zh') => {
  if (language === 'en') {
    return type === 'video' ? 'VIDEO' : type === 'repository' ? 'GITHUB' : 'WEBSITE'
  }
  return type === 'video' ? '视频' : type === 'repository' ? '仓库' : '网站'
}

const renderExternalVideoCard = ({ url, title, preview, alt, description }, language) => `<section class="article-video-card article-video-card-external">
  <div class="article-video-frame article-video-placeholder">
    ${preview ? `<img src="${escapeHtml(preview)}" alt="${escapeHtml(alt)}" loading="lazy" />` : ''}
    <span>${language === 'en' ? 'VIDEO LINK' : '视频链接'}</span>
  </div>
  <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="article-video-link"><strong>${escapeHtml(title)}</strong><span class="link-card-tag tag-video">${getResourceLabel('video', language)}</span></a>
  ${description ? `<p class="article-video-description">${escapeHtml(description)}</p>` : ''}
</section>`

const renderEmbeddedVideoCard = ({ url, title, description }, video, language) => `<section class="article-video-card">
  <div class="article-video-frame">
    <iframe src="${escapeHtml(video.src)}" title="${escapeHtml(title)} · ${escapeHtml(video.platform)} 视频播放器" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
  </div>
  <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="article-video-link"><strong>${escapeHtml(title)}</strong><span class="link-card-tag tag-video">${getResourceLabel('video', language)}</span></a>
  ${description ? `<p class="article-video-description">${escapeHtml(description)}</p>` : ''}
</section>`

const renderWebsiteCard = ({ type, url, title, preview, alt, description }, language) => {
  const isRepository = type === 'repository'
  const badge = getResourceLabel(type, language)
  const tagClass = isRepository ? 'tag-github' : 'tag-web'
  const descriptionHtml = description ? `<div class="link-card-description">${escapeHtml(description)}</div>` : ''
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="article-link-card-item${preview ? ' has-preview' : ''}">
    ${renderPreview(preview, alt)}
    <div class="link-card-content">
      <div class="link-card-top">
        <span class="link-card-tag ${tagClass}">${badge}</span>
      </div>
      <div class="link-card-title">${escapeHtml(title)}</div>
      ${descriptionHtml}
      <div class="link-card-url">${escapeHtml(url.replace(/^https?:\/\//, ''))}</div>
    </div>
  </a>`
}

export const renderResourceBlock = (body, { articleId = '', resources = [], language = 'zh' } = {}) => {
  const fields = parseResourceFields(body)
  const type = normalizedType(fields.type)
  const url = fields.url || ''

  if (!RESOURCE_TYPES.has(type) || !isSafeResourceUrl(url)) {
    warnInvalidResource(fields)
    return ''
  }

  const matched = findMatchedResource(url, resources) || {}
  const title = fields.title || matched.title || matched.label || new URL(url).hostname.replace(/^www\./, '')
  const preview = resolvePreview(fields.preview || matched.previewImage || matched.poster || matched.image || '', articleId)
  const description = fields.description || matched.summary || matched.desc || ''
  const alt = fields.alt || matched.previewAlt || `${title} 预览`

  if (type === 'video') {
    const video = getVideoEmbed(url)
    return video
      ? renderEmbeddedVideoCard({ url, title, description }, video, language)
      : renderExternalVideoCard({ url, title, preview, alt, description }, language)
  }

  return `<div class="article-link-cards-grid">${renderWebsiteCard({ type, url, title, preview, alt, description }, language)}</div>`
}

export const transformResourceBlocks = (text, context = {}) => text.replace(
  /```resource\s*\n([\s\S]*?)```/gi,
  (match, body) => {
    const rendered = renderResourceBlock(body, context)
    const fallback = rendered || `<pre class="article-code-block article-code-block-resource"><code>${escapeHtml(match)}</code></pre>`
    if (context.blockStore) {
      const token = `\u0000RESOURCE_BLOCK_${context.blockStore.length}\u0000`
      context.blockStore.push(fallback)
      return `${token}\n\n`
    }
    return `${fallback}\n\n`
  }
)
