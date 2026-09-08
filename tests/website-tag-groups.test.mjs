import assert from 'node:assert/strict'
import test from 'node:test'
import { createServer } from 'vite'
import { publicResource, validateResourcePayload } from '../functions/api/_resourceUtils.js'

test('网页静态资源具有可展开的四维标签与无重复扁平标签', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { resourceWebsites } = await server.ssrLoadModule('/src/data/resources/websites.js')
    assert.equal(resourceWebsites.length, 142)
    for (const item of resourceWebsites) {
      const grouped = Object.values(item.tagGroups).flat()
      assert.deepEqual(item.tags, grouped)
      assert.equal(new Set(grouped).size, grouped.length)
      assert.deepEqual(Object.keys(item.tagGroups), ['content', 'format', 'experience', 'context'])
    }
  } finally {
    await server.close()
  }
})

test('网页标签分组统一去重并保持旧扁平标签兼容', () => {
  const result = validateResourcePayload({
    type: 'website', category: 'case', title: '示例', url: 'https://example.com', contentOverview: '用于测试网页标签分组。',
    tagGroups: { content: ['展览'], format: ['个人网站'], experience: ['展览'], context: [] },
  }, { allowStatus: true })
  assert.ok(result.value)
  assert.deepEqual(result.value.tags, ['展览', '个人网站'])
  const legacy = publicResource({ id: 'legacy', type: 'website', tags_json: '["展览"]', title: '旧资源', url: '', content_overview: '', image_key: '', is_featured: 0, created_at: '' })
  assert.deepEqual(legacy.tags, ['展览'])
  assert.equal('tagGroups' in legacy, false)
})
