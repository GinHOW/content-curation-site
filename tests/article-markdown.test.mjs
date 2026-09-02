import assert from 'node:assert/strict'
import test from 'node:test'
import { parseArticleOutline } from '../src/utils/markdown/articleOutline.js'
import { renderArticleMarkdown } from '../src/utils/markdown/articleMarkdown.js'
import { renderResourceBlock } from '../src/utils/markdown/resourceBlocks.js'

test('article outline is generated from H1/H2 headings and ignores fenced examples', () => {
  const markdown = [
    '# 第一章：开始',
    '',
    '## 认识页面',
    '',
    '### 仅供正文内部使用',
    '',
    '```markdown',
    '# 代码中的标题',
    '## 另一个伪标题',
    '```',
    '',
    '# 第一章：开始',
  ].join('\n')

  const outline = parseArticleOutline(markdown)
  assert.deepEqual(outline.sections.map((section) => ({
    id: section.id,
    label: section.label,
    children: section.children.map((child) => child.label),
  })), [
    { id: '第一章-开始', label: '第一章：开始', children: ['认识页面'] },
    { id: '第一章-开始-2', label: '第一章：开始', children: [] },
  ])
  assert.equal(outline.headings.length, 4)
})

test('renderer shares generated heading ids with the outline', () => {
  const markdown = '# 第一章\n\n## 子章节\n\n### 内部标题'
  const outline = parseArticleOutline(markdown)
  const html = renderArticleMarkdown(markdown, { outline })

  assert.match(html, /<h1 id="第一章" class="section-heading">第一章<\/h1>/)
  assert.match(html, /<h2 id="子章节" class="section-heading">子章节<\/h2>/)
  assert.match(html, /<h3 id="内部标题">内部标题<\/h3>/)
})

test('resource blocks render website previews and escape authored fields', () => {
  const html = renderResourceBlock(`
type: website
title: <示例网站>
url: https://example.com/
preview: images/example.jpg
`, { articleId: 'demo', resources: [] })

  assert.match(html, /article-link-card-item/)
  assert.match(html, /\/articles\/demo\/images\/example\.jpg/)
  assert.match(html, /&lt;示例网站&gt;/)
  assert.doesNotMatch(html, /<示例网站>/)
  assert.doesNotMatch(html, /↗/)
})

test('resource data fills omitted title, preview and description', () => {
  const html = renderResourceBlock(`
type: website
url: https://matched.example/
`, {
    articleId: 'demo',
    resources: [{
      type: 'website',
      title: 'Matched website',
      url: 'https://matched.example/',
      previewImage: '/matched.jpg',
      summary: 'Matched summary',
    }],
  })

  assert.match(html, /Matched website/)
  assert.match(html, /\/matched\.jpg/)
  assert.match(html, /Matched summary/)
})

test('known video platforms render embeds without autoplay', () => {
  const html = renderResourceBlock(`
type: video
title: Bilibili 视频
url: https://www.bilibili.com/video/BV1KM4y1G7EF/
`, { articleId: 'demo', resources: [] })

  assert.match(html, /article-video-card/)
  assert.match(html, /autoplay=0/)
  assert.match(html, /Bilibili 视频/)
  assert.match(html, /class="link-card-tag tag-video"/)
  assert.doesNotMatch(html, /↗/)
})

test('resource labels follow the article language', () => {
  const block = `
type: website
title: Example
url: https://example.com/
`

  const zh = renderResourceBlock(block, { language: 'zh' })
  const en = renderResourceBlock(block, { language: 'en' })

  assert.match(zh, />网站</)
  assert.match(en, />WEBSITE</)
})

test('resource HTML is restored after inline markdown formatting', () => {
  const html = renderArticleMarkdown('```resource\ntype: website\ntitle: A_B *resource*\nurl: https://example.com/\n```')

  assert.match(html, /A_B \*resource\*/)
  assert.doesNotMatch(html, /A<em>B|<em>resource<\/em>/)
})

test('ordinary markdown links remain links and are not promoted to cards', () => {
  const html = renderArticleMarkdown('[普通链接](https://example.com/)')

  assert.match(html, /href="https:\/\/example\.com\/"/)
  assert.doesNotMatch(html, /article-link-card-item/)
})

test('invalid resource blocks remain readable code blocks', () => {
  const html = renderArticleMarkdown('```resource\ntype: website\nurl: javascript:alert(1)\n```')

  assert.match(html, /article-code-block-resource/)
  assert.match(html, /javascript:alert\(1\)/)
  assert.doesNotMatch(html, /href=/)
})

test('malformed resource URLs do not throw during rendering', () => {
  const html = renderArticleMarkdown('```resource\ntype: website\nurl: https://\n```')

  assert.match(html, /article-code-block-resource/)
})
