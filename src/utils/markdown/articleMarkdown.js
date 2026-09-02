import { transformResourceBlocks } from './resourceBlocks.js'

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const fallbackSlug = (title, usedIds = new Map()) => {
  const base = String(title)
    .trim()
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'section'
  const nextCount = (usedIds.get(base) || 0) + 1
  usedIds.set(base, nextCount)
  return nextCount === 1 ? base : `${base}-${nextCount}`
}

const protectFencedCodeBlocks = (text, codeBlocks) => {
  const lines = String(text).split(/\r?\n/)
  const output = []

  for (let index = 0; index < lines.length; index += 1) {
    const opener = lines[index].match(/^\s*(`{3,}|~{3,})([a-z0-9_-]*)\s*$/i)
    if (!opener) {
      output.push(lines[index])
      continue
    }

    const fence = opener[1]
    const language = opener[2]
    const body = []
    index += 1
    while (index < lines.length) {
      const closingFence = new RegExp(`^\\s*${fence[0]}{${fence.length},}\\s*$`)
      if (closingFence.test(lines[index])) break
      body.push(lines[index])
      index += 1
    }

    const escaped = escapeHtml(body.join('\n'))
    const variantClass = language ? ` article-code-block-${language}` : ''
    const label = language === 'prompt' ? '<span class="article-code-block-label">Prompt</span>' : ''
    const token = `\u0000CODE_BLOCK_${codeBlocks.length}\u0000`
    codeBlocks.push(`<pre class="article-code-block${variantClass}">${label}<code>${escaped}</code></pre>`)
    output.push(token)
  }

  return output.join('\n')
}

export const renderArticleMarkdown = (md, {
  articleId = '',
  outline = { sections: [], headings: [] },
  resources = [],
  language = 'zh',
} = {}) => {
  if (!md) return ''

  let text = md
  text = text.replace(/^\s*\[\[[^\]\n]+\]\]\s*$/gm, '')

  const resourceBlocks = []
  text = transformResourceBlocks(text, { articleId, resources, language, blockStore: resourceBlocks })

  // Protect fenced code before converting headings, so code examples containing
  // Markdown-looking lines never become part of the article outline.
  const codeBlocks = []
  text = protectFencedCodeBlocks(text, codeBlocks)

  let html = text.replace(
    /!\[(.*?)\]\(images\/(.*?)\)/g,
    `<figure class="article-figure">
      <img src="/articles/${articleId}/images/$2" alt="$1" loading="lazy" />
      <figcaption>$1</figcaption>
    </figure>`
  )

  const usedFallbackIds = new Map()
  let headingIndex = 0
  html = html.replace(/^(#{1,6})[ \t]+(.+)$/gm, (match, marks, title) => {
    const level = marks.length
    const parsedHeading = outline.headings?.[headingIndex]
    headingIndex += 1
    const id = parsedHeading?.id || fallbackSlug(title, usedFallbackIds)
    const className = level <= 2 ? ' class="section-heading"' : ''
    return `<h${level} id="${id}"${className}>${title.trim()}</h${level}>`
  })

  const footnotesDict = {}
  html.replace(/^\[\^(\d+)\]:\s+(.+)$/gm, (match, fnId, fnText) => {
    let cleanFn = fnText.trim()
    cleanFn = cleanFn.replace(/\*\*([^*]+)\*\*/g, '$1')
    cleanFn = cleanFn.replace(/\*([^*]+)\*/g, '$1')
    cleanFn = cleanFn.replace(/"/g, '&quot;')
    footnotesDict[fnId] = cleanFn
    return match
  })

  html = html.replace(
    /^\[\^(\d+)\]:\s+(.+)$/gm,
    (match, fnId, fnContent) => {
      let formatted = fnContent.trim()
      formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>')
      return `<div class="footnote-item" id="fn-${fnId}">
        <span class="fn-num">[${fnId}]</span>
        <span class="fn-text">${formatted}</span>
        <a href="#fnref-${fnId}" class="fn-backref" aria-label="跳回正文出处" title="跳回正文出处">↩</a>
      </div>`
    }
  )

  html = html.replace(/\[\^(\d+)\](?!:)/g, (match, fnId) => {
    const previewText = footnotesDict[fnId] || ''
    return `<sup class="footnote-ref">
      <a id="fnref-${fnId}" href="#fn-${fnId}" title="点击跳转至注脚 [${fnId}]">
        [${fnId}]
      </a>
      <span class="footnote-popover" role="tooltip">
        <span class="popover-num">[${fnId}]</span> ${previewText}
      </span>
    </sup>`
  })

  html = html.replace(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|EXAMPLE)\]\s*([^\n]*)\n((?:>[^\n]*(?:\n|$))*)/gim, (match, kind, title, body) => {
    const lines = body
      .trim()
      .split('\n')
      .map((line) => line.replace(/^>\s?/, '').trim())
      .filter(Boolean)
    const hasOrderedItems = lines.length > 0 && lines.every((line) => /^\d+[.)]\s+/.test(line))
    const content = hasOrderedItems
      ? `<ol>${lines.map((line) => `<li>${line.replace(/^\d+[.)]\s+/, '')}</li>`).join('')}</ol>`
      : `<p>${lines.join(' ')}</p>`
    return `<aside class="article-callout article-callout-${kind.toLowerCase()}"><div class="article-callout-label">${title || kind}</div>${content}</aside>`
  })

  html = html.replace(/(?:^>\s*.+(?:\n|$))+/gm, (match) => {
    const content = match
      .trim()
      .split('\n')
      .map((line) => line.replace(/^>\s?/, '').trim())
      .join(' ')
    return `<blockquote class="article-quote">${content}</blockquote>`
  })

  html = html.replace(/(?:^\d+[.)]\s+.+(?:\n|$))+/gm, (match) => {
    const items = match.trim().split('\n').map((line) => line.replace(/^\d+[.)]\s+/, ''))
    return `<ol>${items.map((item) => `<li>${item}</li>`).join('')}</ol>`
  })

  html = html.replace(/(?:^[-*+]\s+.+(?:\n|$))+/gm, (match) => {
    const items = match.trim().split('\n').map((line) => line.replace(/^[-*+]\s+/, ''))
    return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`
  })

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  html = html.replace(/(^|[^\w])_([^_\n]+)_(?=$|[^\w])/g, '$1<em>$2</em>')
  html = html.replace(/`([^`]+)`/g, (match, code) => `<code>${escapeHtml(code)}</code>`)
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (match, label, url) => (
    `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
  ))

  const paragraphs = html.split(/\n\n+/)
  const rendered = paragraphs
    .map((paragraph) => {
      const trimmed = paragraph.trim()
      if (!trimmed) return ''
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<figure') ||
        trimmed.startsWith('<div') ||
        trimmed.startsWith('<aside') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<section') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<ol') ||
        trimmed.startsWith('\u0000RESOURCE_BLOCK_') ||
        trimmed.startsWith('\u0000CODE_BLOCK_') ||
        trimmed.startsWith('<a class="article-link-card-item')
      ) {
        return trimmed
      }
      return `<p>${trimmed.replace(/\n/g, ' ')}</p>`
    })
    .join('\n')

  return rendered
    .replace(/\u0000RESOURCE_BLOCK_(\d+)\u0000/g, (match, index) => resourceBlocks[Number(index)] || '')
    .replace(/\u0000CODE_BLOCK_(\d+)\u0000/g, (match, index) => codeBlocks[Number(index)] || '')
}
