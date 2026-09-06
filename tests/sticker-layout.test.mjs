import assert from 'node:assert/strict'
import test from 'node:test'
import {
  canPlaceSticker,
  constrainStickerPosition,
  createFixedStickerLayouts,
  createStickerLayouts,
  getStickerBounds,
  getStickerLayoutDiagnostics,
} from '../src/utils/stickerLayout.js'

const anchors = {
  desktop: { x: 50, y: 50, jitterX: 4, jitterY: 4 },
  tablet: { x: 50, y: 50, jitterX: 4, jitterY: 4 },
  mobile: { x: 50, y: 50, jitterX: 4, jitterY: 4 },
}

const items = [
  ['rope', 'medium', 1200 / 509, { desktop: 20, tablet: 20, mobile: 28 }, 8],
  ['wig', 'mass', 1200 / 1190, { desktop: 19, tablet: 19, mobile: 27 }, 6],
  ['ruler', 'ruler', 1200 / 162, { desktop: 38, tablet: 37, mobile: 56 }, 3, true],
  ['chess', 'medium', 1200 / 618, { desktop: 24, tablet: 24, mobile: 34 }, 6],
  ['key', 'accent', 570 / 1200, { desktop: 4, tablet: 4, mobile: 6 }, 9],
  ['hat', 'mass', 1189 / 1141, { desktop: 19, tablet: 19, mobile: 27 }, 6, true],
  ['gloves', 'medium', 1200 / 889, { desktop: 23, tablet: 23, mobile: 32 }, 6],
  ['eyes', 'wide', 1200 / 781, { desktop: 38, tablet: 37, mobile: 56 }, 3],
  ['envelope', 'envelope', 1200 / 823, { desktop: 18, tablet: 18, mobile: 26 }, 6, true],
].map(([id, layoutRole, aspectRatio, widths, rotationRange, bleedEligible]) => ({
  id,
  layoutRole,
  aspectRatio,
  widths,
  rotationRange,
  bleedEligible,
  anchors,
  // 与组件真实数据保持一致：只有允许出血的条目才携带 topBoundary
  ...(bleedEligible ? { topBoundary: { desktop: -14, tablet: -14, mobile: -10 } } : {}),
}))

const overlap = (first, second) => (
  first.left < second.right + 1.1
  && first.right > second.left - 1.1
  && first.top < second.bottom + 1.1
  && first.bottom > second.top - 1.1
)

const EPSILON = 1e-9

const assertValidLayout = (layouts, presetName) => {
  const entries = Object.entries(layouts)
  assert.equal(entries.length, 9)

  for (const [id, layout] of entries) {
    const bounds = getStickerBounds(layout)
    const item = items.find((entry) => entry.id === id)
    const topBoundary = item.bleedEligible ? item.topBoundary[presetName] : 2.5
    assert.ok(bounds.left >= -EPSILON, `${presetName}:${id} is outside the left boundary`)
    assert.ok(bounds.right <= 100 + EPSILON, `${presetName}:${id} is outside the right boundary`)
    assert.ok(bounds.top >= topBoundary - EPSILON, `${presetName}:${id} is above its allowed boundary`)
    assert.ok(bounds.bottom <= 97.5 + EPSILON, `${presetName}:${id} is outside the bottom boundary`)
  }

  for (let index = 0; index < entries.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < entries.length; nextIndex += 1) {
      const [firstId, first] = entries[index]
      const [secondId, second] = entries[nextIndex]
      assert.equal(overlap(getStickerBounds(first), getStickerBounds(second)), false, `${presetName}:${firstId} overlaps ${secondId}`)
    }
  }
}

test('same seed produces an identical sticker composition', () => {
  assert.deepEqual(createStickerLayouts(items, 202501), createStickerLayouts(items, 202501))
})

test('different seeds produce different sticker compositions', () => {
  assert.notDeepEqual(createStickerLayouts(items, 202501), createStickerLayouts(items, 202502))
})

test('all presets stay within their allowed bounds without overlaps', () => {
  for (let seed = 1; seed <= 40; seed += 1) {
    const layouts = createStickerLayouts(items, seed)
    assertValidLayout(layouts.desktop, 'desktop')
    assertValidLayout(layouts.tablet, 'tablet')
    assertValidLayout(layouts.mobile, 'mobile')
  }
})

test('multiple composition skeletons are selected across deterministic seeds', () => {
  const found = new Set()

  for (let seed = 1; seed <= 300; seed += 1) {
    const diagnostics = getStickerLayoutDiagnostics(items, seed)
    Object.values(diagnostics).forEach(({ templateId }) => found.add(templateId))
  }

  // 版式骨架由种子驱动的评分挑选；当前锚点配置下 300 个种子内稳定出现至少 3 种骨架
  assert.ok(
    [...found].filter((templateId) => templateId !== 'fallback').length >= 3,
    `expected at least 3 distinct skeletons, got ${[...found].join(', ')}`,
  )
})

test('constrained drag positions reject collisions and clamp boundaries', () => {
  const layouts = createStickerLayouts(items, 202503).desktop
  const ruler = items.find((item) => item.id === 'ruler')
  const current = layouts.ruler
  const constrained = constrainStickerPosition(ruler, {
    ...current,
    x: -100,
    y: -100,
  }, 'desktop', { allowBleed: true })

  assert.ok(getStickerBounds(constrained).left >= 0)
  assert.ok(getStickerBounds(constrained).top >= -14)
  assert.equal(canPlaceSticker(layouts.eyes, layouts, 'ruler'), false)
})

test('fixed layouts keep anchor positions and vary only rotation per load', () => {
  const neutral = createFixedStickerLayouts(items, () => 0.5)
  const extreme = createFixedStickerLayouts(items, () => 0)

  for (const presetName of Object.keys(neutral)) {
    for (const item of items) {
      assert.equal(neutral[presetName][item.id].x, 50)
      assert.equal(neutral[presetName][item.id].y, 50)
      assert.equal(neutral[presetName][item.id].rotation, 0)
      assert.equal(extreme[presetName][item.id].rotation, -item.rotationRange)
    }
  }
})
