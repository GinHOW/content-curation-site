export const LAYOUT_PRESETS = {
  desktop: {
    canvasAspect: 16 / 10,
    paddingX: 0,
    paddingY: 2.5,
    maxBleed: 2,
  },
  tablet: {
    canvasAspect: 4 / 3,
    paddingX: 0,
    paddingY: 2.5,
    maxBleed: 2,
  },
  mobile: {
    canvasAspect: 3 / 5,
    paddingX: 0,
    paddingY: 2.5,
    maxBleed: 1,
  },
}

const DEFAULT_GAP = 1.1
const CANDIDATES_PER_TEMPLATE = 24
const TOP_CANDIDATES = 3
const FALLBACK_ANGLES = [0, -4, 4, -7, 7]

const slot = (role, desktop, tablet, mobile, options = {}) => ({
  role,
  desktop,
  tablet,
  mobile,
  jitterX: options.jitterX ?? 3,
  jitterY: options.jitterY ?? 3,
  bleed: options.bleed ?? false,
})

export const STICKER_LAYOUT_TEMPLATES = [
  {
    id: 'ascending-diagonal',
    slots: [
      slot('ruler', [53, -5], [53, -5], [49, -4], { jitterX: 10, jitterY: 3, bleed: true }),
      slot('wide', [77, 75], [77, 73], [68, 66], { jitterX: 5, jitterY: 5 }),
      slot('mass', [17, 81], [17, 80], [18, 84], { jitterX: 5, jitterY: 4 }),
      slot('mass', [84, 15], [84, 14], [80, 12], { jitterX: 4, jitterY: 4 }),
      slot('envelope', [17, 18], [17, 18], [20, 27], { jitterX: 4, jitterY: 3 }),
      slot('medium', [20, 51], [20, 51], [21, 51], { jitterX: 5, jitterY: 5 }),
      slot('medium', [50, 46], [50, 46], [54, 39], { jitterX: 5, jitterY: 5 }),
      slot('medium', [44, 83], [44, 82], [50, 87], { jitterX: 5, jitterY: 3 }),
      slot('accent', [85, 52], [85, 52], [85, 54], { jitterX: 4, jitterY: 7 }),
    ],
  },
  {
    id: 'descending-diagonal',
    slots: [
      slot('ruler', [31, 15], [31, 15], [58, 21], { jitterX: 9, jitterY: 4 }),
      slot('wide', [23, 74], [23, 72], [34, 68], { jitterX: 5, jitterY: 5 }),
      slot('mass', [85, 78], [84, 78], [78, 85], { jitterX: 4, jitterY: 4 }),
      slot('mass', [81, 22], [81, 22], [80, 12], { jitterX: 4, jitterY: 4 }),
      slot('envelope', [17, 18], [17, 18], [22, 28], { jitterX: 4, jitterY: 3 }),
      slot('medium', [23, 49], [23, 49], [21, 52], { jitterX: 5, jitterY: 5 }),
      slot('medium', [52, 43], [52, 43], [60, 45], { jitterX: 5, jitterY: 5 }),
      slot('medium', [55, 84], [55, 83], [58, 88], { jitterX: 5, jitterY: 3 }),
      slot('accent', [14, 56], [14, 56], [15, 57], { jitterX: 3, jitterY: 7 }),
    ],
  },
  {
    id: 'perimeter-orbit',
    slots: [
      slot('ruler', [52, -4], [52, -4], [49, -4], { jitterX: 11, jitterY: 3, bleed: true }),
      slot('wide', [53, 76], [53, 75], [68, 68], { jitterX: 5, jitterY: 4 }),
      slot('mass', [15, 49], [15, 50], [18, 84], { jitterX: 4, jitterY: 5 }),
      slot('mass', [85, 45], [85, 46], [80, 13], { jitterX: 4, jitterY: 5 }),
      slot('envelope', [20, 17], [20, 17], [19, 28], { jitterX: 4, jitterY: 3 }),
      slot('medium', [27, 31], [27, 31], [21, 52], { jitterX: 5, jitterY: 4 }),
      slot('medium', [76, 28], [76, 28], [57, 41], { jitterX: 5, jitterY: 4 }),
      slot('medium', [23, 78], [23, 77], [49, 88], { jitterX: 4, jitterY: 3 }),
      slot('accent', [79, 76], [79, 75], [86, 54], { jitterX: 4, jitterY: 6 }),
    ],
  },
  {
    id: 'split-field',
    slots: [
      slot('ruler', [67, -4], [67, -4], [49, -4], { jitterX: 9, jitterY: 3, bleed: true }),
      slot('wide', [24, 75], [24, 74], [34, 68], { jitterX: 5, jitterY: 4 }),
      slot('mass', [80, 18], [80, 18], [80, 12], { jitterX: 4, jitterY: 4 }),
      slot('mass', [73, 72], [73, 72], [78, 85], { jitterX: 4, jitterY: 4 }),
      slot('envelope', [16, 19], [16, 19], [20, 28], { jitterX: 4, jitterY: 3 }),
      slot('medium', [20, 49], [20, 49], [21, 51], { jitterX: 5, jitterY: 5 }),
      slot('medium', [47, 43], [47, 43], [58, 43], { jitterX: 5, jitterY: 5 }),
      slot('medium', [48, 86], [48, 85], [51, 88], { jitterX: 5, jitterY: 3 }),
      slot('accent', [85, 48], [85, 48], [85, 55], { jitterX: 4, jitterY: 7 }),
    ],
  },
  {
    id: 'three-islands',
    slots: [
      slot('ruler', [47, 20], [47, 20], [58, 21], { jitterX: 11, jitterY: 4 }),
      slot('wide', [78, 76], [78, 74], [68, 68], { jitterX: 5, jitterY: 4 }),
      slot('mass', [15, 77], [15, 77], [18, 84], { jitterX: 4, jitterY: 4 }),
      slot('mass', [84, 15], [84, 15], [80, 12], { jitterX: 4, jitterY: 4 }),
      slot('envelope', [20, 19], [20, 19], [20, 28], { jitterX: 4, jitterY: 3 }),
      slot('medium', [30, 50], [30, 50], [21, 51], { jitterX: 5, jitterY: 5 }),
      slot('medium', [54, 55], [54, 55], [58, 44], { jitterX: 5, jitterY: 5 }),
      slot('medium', [55, 85], [55, 84], [50, 88], { jitterX: 5, jitterY: 3 }),
      slot('accent', [85, 47], [85, 47], [85, 55], { jitterX: 4, jitterY: 7 }),
    ],
  },
]

// 固定默认布局种子：每次打开页面都呈现同一套贴纸位置，不再随机重算。
export const stickerPageSeed = 20250906

const createRandom = (seed) => {
  let state = seed >>> 0

  return () => {
    state += 0x6D2B79F5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const randomBetween = (random, minimum, maximum) => minimum + (maximum - minimum) * random()

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value))

const shuffled = (items, random) => {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[nextIndex]] = [result[nextIndex], result[index]]
  }

  return result
}

export const getStickerBounds = (candidate) => {
  const radians = (candidate.rotation * Math.PI) / 180
  const cosine = Math.abs(Math.cos(radians))
  const sine = Math.abs(Math.sin(radians))
  const width = candidate.width * cosine + candidate.height * sine
  const height = candidate.width * sine + candidate.height * cosine

  return {
    left: candidate.x - width / 2,
    right: candidate.x + width / 2,
    top: candidate.y - height / 2,
    bottom: candidate.y + height / 2,
  }
}

const intersects = (first, second, gap = DEFAULT_GAP) => (
  first.left < second.right + gap
  && first.right > second.left - gap
  && first.top < second.bottom + gap
  && first.bottom > second.top - gap
)

const itemDimensions = (item, presetName) => {
  const preset = LAYOUT_PRESETS[presetName]
  const width = item.widths[presetName]

  return {
    width,
    height: (width * preset.canvasAspect) / item.aspectRatio,
  }
}

const getTopBoundary = (item, presetName, allowBleed) => {
  if (allowBleed && item.bleedEligible) return item.topBoundary?.[presetName] ?? -12
  return LAYOUT_PRESETS[presetName].paddingY
}

export const constrainStickerPosition = (item, candidate, presetName, options = {}) => {
  const preset = LAYOUT_PRESETS[presetName]
  const bounds = getStickerBounds({ ...candidate, x: 0, y: 0 })
  const minimumX = preset.paddingX - bounds.left
  const maximumX = 100 - preset.paddingX - bounds.right
  const minimumY = getTopBoundary(item, presetName, options.allowBleed) - bounds.top
  const maximumY = 100 - preset.paddingY - bounds.bottom

  return {
    ...candidate,
    x: clamp(candidate.x, minimumX, maximumX),
    y: clamp(candidate.y, minimumY, maximumY),
  }
}

export const canPlaceSticker = (candidate, layouts, itemId, gap = DEFAULT_GAP) => {
  const candidateBounds = getStickerBounds(candidate)

  return Object.entries(layouts).every(([id, layout]) => (
    id === itemId || !intersects(candidateBounds, getStickerBounds(layout), gap)
  ))
}

const rotationFor = (item, random) => {
  const range = item.rotationRange ?? 5
  return randomBetween(random, -range, range)
}

const assignSlots = (items, template, random) => {
  const remaining = [...items]
  const assignments = []

  for (const slotDefinition of template.slots) {
    const compatible = remaining.filter((item) => (
      item.layoutRole === slotDefinition.role
      && (!slotDefinition.bleed || item.bleedEligible)
    ))

    if (!compatible.length) return null
    const item = compatible[Math.floor(random() * compatible.length)]
    remaining.splice(remaining.indexOf(item), 1)
    assignments.push({ item, slot: slotDefinition })
  }

  return assignments
}

const makeSlotCandidate = (item, slotDefinition, presetName, random) => {
  const [anchorX, anchorY] = slotDefinition[presetName]
  const dimensions = itemDimensions(item, presetName)
  const candidate = {
    ...dimensions,
    x: anchorX + randomBetween(random, -slotDefinition.jitterX, slotDefinition.jitterX),
    y: anchorY + randomBetween(random, -slotDefinition.jitterY, slotDefinition.jitterY),
    rotation: rotationFor(item, random),
  }

  return constrainStickerPosition(item, candidate, presetName, {
    allowBleed: slotDefinition.bleed,
  })
}

const occupancyScore = (layouts) => {
  const cells = new Set()

  for (const layout of Object.values(layouts)) {
    const column = clamp(Math.floor(layout.x / (100 / 3)), 0, 2)
    const row = clamp(Math.floor(layout.y / (100 / 3)), 0, 2)
    cells.add(`${column}:${row}`)
  }

  return cells.size
}

const scoreCandidate = (layouts) => {
  const entries = Object.values(layouts)
  const bounds = entries.map((layout) => getStickerBounds(layout))
  const left = Math.min(...bounds.map((entry) => entry.left))
  const right = Math.max(...bounds.map((entry) => entry.right))
  const top = Math.min(...bounds.map((entry) => entry.top))
  const bottom = Math.max(...bounds.map((entry) => entry.bottom))
  const totalArea = entries.reduce((total, entry) => total + entry.width * entry.height, 0)
  const centerX = entries.reduce((total, entry) => total + entry.x * entry.width * entry.height, 0) / totalArea
  const centerY = entries.reduce((total, entry) => total + entry.y * entry.width * entry.height, 0) / totalArea
  const coverageX = (right - left) / 100
  const coverageY = (bottom - Math.max(top, 0)) / 100
  const balance = 1 - Math.min(1, Math.hypot((centerX - 50) / 50, (centerY - 50) / 50))
  const edgeUse = [left <= 15, right >= 85, top <= 15, bottom >= 85].filter(Boolean).length / 4
  const occupancy = occupancyScore(layouts) / 9

  const valid = coverageX >= 0.82
    && coverageY >= 0.72
    && occupancy >= (5 / 9)
    && centerX >= 40
    && centerX <= 60
    && centerY >= 35
    && centerY <= 65

  return {
    valid,
    score: (coverageX * 3) + (coverageY * 2.5) + (balance * 2) + (occupancy * 1.5) + edgeUse,
  }
}

const createTemplateCandidate = (items, template, presetName, random) => {
  const assignments = assignSlots(items, template, random)
  if (!assignments) return null

  const sortedAssignments = [...assignments].sort((first, second) => {
    const firstArea = first.item.widths[presetName] ** 2 / first.item.aspectRatio
    const secondArea = second.item.widths[presetName] ** 2 / second.item.aspectRatio
    return secondArea - firstArea
  })
  const layouts = {}

  for (const assignment of sortedAssignments) {
    let candidate = null

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const next = makeSlotCandidate(assignment.item, assignment.slot, presetName, random)
      if (canPlaceSticker(next, layouts, assignment.item.id)) {
        candidate = next
        break
      }
    }

    if (!candidate) return null
    layouts[assignment.item.id] = candidate
  }

  const score = scoreCandidate(layouts)
  if (!score.valid) return null

  return {
    templateId: template.id,
    layouts,
    score: score.score,
  }
}

const makeFallbackCandidate = (item, presetName, random, rotation = null, position = null) => {
  const dimensions = itemDimensions(item, presetName)
  const anchor = item.anchors?.[presetName]
  const candidate = {
    ...dimensions,
    x: position?.x ?? anchor?.x ?? 50,
    y: position?.y ?? anchor?.y ?? 50,
    rotation: rotation ?? rotationFor(item, random),
  }

  return constrainStickerPosition(item, candidate, presetName, {
    allowBleed: Boolean(item.topBoundary?.[presetName]),
  })
}

// 策展定型布局：位置固定取自各预设锚点，仅旋转角度随每次页面加载随机变化
export const createFixedStickerLayouts = (items, random = Math.random) => Object.fromEntries(
  Object.keys(LAYOUT_PRESETS).map((presetName) => [
    presetName,
    Object.fromEntries(items.map((item) => [
      item.id,
      makeFallbackCandidate(item, presetName, random),
    ])),
  ]),
)

const createFallbackLayout = (items, presetName, seed) => {
  const sortedItems = [...items].sort((first, second) => {
    const firstArea = first.widths[presetName] ** 2 / first.aspectRatio
    const secondArea = second.widths[presetName] ** 2 / second.aspectRatio
    return secondArea - firstArea
  })

  for (let restart = 0; restart < 80; restart += 1) {
    const random = createRandom(seed ^ (restart * 0x9E3779B9))
    const layouts = {}
    let failed = false

    for (const item of sortedItems) {
      let candidate = null

      for (let attempt = 0; attempt < 900; attempt += 1) {
        const anchor = item.anchors?.[presetName]
        const position = anchor
          ? {
            x: anchor.x + randomBetween(random, -anchor.jitterX, anchor.jitterX),
            y: anchor.y + randomBetween(random, -anchor.jitterY, anchor.jitterY),
          }
          : null
        const next = makeFallbackCandidate(item, presetName, random, null, position)
        if (canPlaceSticker(next, layouts, item.id)) {
          candidate = next
          break
        }
      }

      if (!candidate) {
        failed = true
        break
      }

      layouts[item.id] = candidate
    }

    if (!failed) return layouts
  }

  for (const rotation of FALLBACK_ANGLES) {
    const layouts = {}
    let failed = false

    for (const item of sortedItems) {
      const sample = makeFallbackCandidate(item, presetName, () => 0.5, rotation, { x: 0, y: 0 })
      const bounds = getStickerBounds(sample)
      const preset = LAYOUT_PRESETS[presetName]
      const minimumX = preset.paddingX - bounds.left
      const maximumX = 100 - preset.paddingX - bounds.right
      const minimumY = getTopBoundary(item, presetName, Boolean(item.topBoundary?.[presetName])) - bounds.top
      const maximumY = 100 - preset.paddingY - bounds.bottom
      let candidate = null

      for (let y = minimumY; y <= maximumY; y += 1.5) {
        for (let x = minimumX; x <= maximumX; x += 1.5) {
          const next = { ...sample, x, y }
          if (canPlaceSticker(next, layouts, item.id)) {
            candidate = next
            break
          }
        }
        if (candidate) break
      }

      if (!candidate) {
        failed = true
        break
      }
      layouts[item.id] = candidate
    }

    if (!failed) return layouts
  }

  throw new Error(`Unable to place stickers for ${presetName}`)
}

const createPresetLayout = (items, presetName, seed) => {
  const candidates = []

  STICKER_LAYOUT_TEMPLATES.forEach((template, templateIndex) => {
    for (let candidateIndex = 0; candidateIndex < CANDIDATES_PER_TEMPLATE; candidateIndex += 1) {
      const random = createRandom(
        seed
        ^ ((templateIndex + 1) * 0x45D9F3B)
        ^ ((candidateIndex + 1) * 0x9E3779B9)
        ^ (presetName.length * 0x27D4EB2D),
      )
      const candidate = createTemplateCandidate(items, template, presetName, random)
      if (candidate) candidates.push(candidate)
    }
  })

  if (!candidates.length) {
    return {
      templateId: 'fallback',
      layouts: createFallbackLayout(items, presetName, seed),
    }
  }

  const topCandidates = candidates
    .sort((first, second) => second.score - first.score)
    .slice(0, TOP_CANDIDATES)
  const random = createRandom(seed ^ (presetName.length * 0x7FEB352D))
  const chosen = topCandidates[Math.floor(random() * topCandidates.length)]

  return chosen
}

const createLayoutDiagnostics = (items, seed) => Object.fromEntries(
  Object.keys(LAYOUT_PRESETS).map((presetName) => [
    presetName,
    createPresetLayout(shuffled(items, createRandom(seed ^ presetName.length)), presetName, seed),
  ]),
)

export const createStickerLayouts = (items, seed = stickerPageSeed) => Object.fromEntries(
  Object.entries(createLayoutDiagnostics(items, seed)).map(([presetName, result]) => [
    presetName,
    result.layouts,
  ]),
)

export const getStickerLayoutDiagnostics = (items, seed = stickerPageSeed) => createLayoutDiagnostics(items, seed)
