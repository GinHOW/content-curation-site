const stripInlineMarkdown = (value = '') => String(value)
  .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/[*_~`]/g, '')
  .replace(/<[^>]*>/g, '')
  .trim()

export const slugifyHeading = (value, usedIds = new Map()) => {
  const cleanValue = stripInlineMarkdown(value)
  const base = cleanValue
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'section'

  const nextCount = (usedIds.get(base) || 0) + 1
  usedIds.set(base, nextCount)
  return nextCount === 1 ? base : `${base}-${nextCount}`
}

const isFenceStart = (line) => line.match(/^\s*(`{3,}|~{3,})/)

const isFenceEnd = (line, fence) => {
  if (!fence) return false
  const marker = fence[0]
  const minimumLength = fence.length
  return new RegExp(`^\\s*${marker}{${minimumLength},}\\s*$`).test(line)
}

/**
 * Parse the document headings once for both the reader TOC and HTML renderer.
 * Only H1 and H2 become navigable outline entries; deeper headings remain
 * available to the renderer but are intentionally omitted from the TOC.
 */
export const parseArticleOutline = (markdown = '') => {
  const sections = []
  const headings = []
  const usedIds = new Map()
  let currentSection = null
  let activeFence = ''

  String(markdown).split(/\r?\n/).forEach((line) => {
    const fence = isFenceStart(line)
    if (fence) {
      if (!activeFence) activeFence = fence[1]
      else if (isFenceEnd(line, activeFence)) activeFence = ''
      return
    }
    if (activeFence) return

    const match = line.match(/^(#{1,6})[ \t]+(.+?)\s*$/)
    if (!match) return

    const level = match[1].length
    const label = stripInlineMarkdown(match[2])
    const id = slugifyHeading(label, usedIds)
    const heading = { level, label, id }
    headings.push(heading)

    if (level === 1) {
      currentSection = { id, label, children: [] }
      sections.push(currentSection)
    } else if (level === 2 && currentSection) {
      currentSection.children.push({ id, label, children: [] })
    }
  })

  return { sections, headings }
}
