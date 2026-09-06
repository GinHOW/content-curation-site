export const SCREEN_UNIVERSE_STAGE_ASPECT = 1446 / 639.36
export const SCREEN_UNIVERSE_MAX_VISIBLE = 48

export const SCREEN_UNIVERSE_CENTER = Object.freeze({
  top: 33.5938,
  left: 31.68,
  width: 36.37,
  height: 46.7969,
})

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value))

export function hashString(value = '') {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function deterministicShuffle(items, seed = '') {
  const result = [...items]
  let state = hashString(seed) || 1

  const random = () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }

  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[result[index], result[target]] = [result[target], result[index]]
  }

  return result
}

export const SCREEN_UNIVERSE_MIN_ACTIVE = 16

export function createScreenItems({ keyword = '', keywords = [], imageLibrary = {}, textLibrary = {} } = {}) {
  if (!keyword) {
    return deterministicShuffle([...new Set(keywords)], 'screen-universe-topics').map((label) => ({
      id: `topic-${label}`,
      type: 'topic',
      label,
      alt: '',
      src: '',
    }))
  }

  const seenSources = new Set()
  const images = (imageLibrary[keyword] || []).flatMap((item) => {
    const src = typeof item === 'string' ? item : item?.src
    if (!src || seenSources.has(src)) return []
    seenSources.add(src)
    return [{
      id: `image-${src}`,
      type: 'image',
      label: keyword,
      src,
      alt: typeof item === 'string' ? `${keyword}选题图片` : item.alt || `${keyword}选题图片`,
    }]
  })

  // 屏幕数量不足时补齐：有文字素材的选题用文字标签屏，否则用空白卡片。
  const texts = deterministicShuffle(
    [...new Set(textLibrary[keyword] || [])].filter((label) => typeof label === 'string' && label.trim()),
    `screen-universe-texts-${keyword}`,
  )

  const screens = [...images]
  for (let index = screens.length; index < SCREEN_UNIVERSE_MIN_ACTIVE; index += 1) {
    const label = texts.length ? texts[index % texts.length] : ''
    screens.push({
      id: `${label ? 'text' : 'blank'}-${keyword}-${index}`,
      type: label ? 'text' : 'blank',
      label,
      alt: '',
      src: '',
    })
  }

  return deterministicShuffle(screens, `screen-universe-images-${keyword}`)
}

// 选中态的圆柱面：屏幕贴在 270° 弧的圆柱上，正面即一堵内容墙，左右拖拽沿柱面环顾。
export const SCREEN_UNIVERSE_ARC_DEGREES = 270

export function createScreenLayout(items, seed = '') {
  const count = items.length
  if (!count) return []

  const phase = (hashString(seed) / 4294967296) * Math.PI * 2
  // 卡片整体收小，避免遮挡中央屏与彼此。
  const baseWidth = clamp(186 - Math.max(0, count - 17) * 1.3, 148, 186)
  // 屏幕比例不锁死 16:9：图片屏与文字屏各有宽窄不一的比例池，按 id 哈希稳定取用；
  // 图片屏入场后还会按原始图片宽高比校正（见组件内的 handleImageLoad）。
  const imageAspects = [1.24, 1.42, 1.6, 1.78, 2.0]
  // 文字卡只允许 1:1 或 4:3，避免细长条。
  const textAspects = [1, 4 / 3]

  const arc = (SCREEN_UNIVERSE_ARC_DEGREES * Math.PI) / 180
  const rows = clamp(Math.round(count / 7), 2, 4)
  const cols = Math.ceil(count / rows)
  // 柱半径放大：屏幕墙离中央屏更远（Z 方向），弧面 chord 变长，排布更松散。
  const cylinderRadius = clamp(720 + count * 5, 720, 1080)
  // 行高随半径收敛：最近一层的顶行也不超出舞台上缘（ndcY ≈ 0.85 以内）。
  const rowHeight = clamp(cylinderRadius * 0.19, 148, 208)

  return items.map((item, index) => {
    const hash = hashString(item.id)
    // 圆柱面：行内沿 270° 弧均匀排布，奇偶行错开半格，位置带稳定的哈希抖动。
    const row = index % rows
    const col = Math.floor(index / rows)
    const step = arc / cols
    const phaseShift = (phase / (Math.PI * 2)) * Math.min(step, Math.PI / 6)
    const rowOffset = (row % 2) * Math.min(step * 0.5, Math.PI / 12) + phaseShift
    const thetaJitter = (((hash >>> 2) % 7) - 3) * Math.min(step * 0.06, 0.02)
    const theta = clamp(-arc / 2 + (col + 0.5) * step + rowOffset + thetaJitter, -arc / 2, arc / 2)
    const yBase = (row - (rows - 1) / 2) * rowHeight
    const yJitter = (((hash >>> 5) % 9) - 4) * 8
    const vector = {
      x: Math.sin(theta) * cylinderRadius,
      y: yBase + yJitter,
      z: -Math.cos(theta) * cylinderRadius,
    }
    const length = Math.hypot(vector.x, vector.y, vector.z) || 1
    const direction = { x: vector.x / length, y: vector.y / length, z: vector.z / length }
    // 纵深差拉大：沿各自方向前后错位 0.80–1.35 倍柱半径，避免相邻屏幕在同一深度穿模，
    // 也给悬停前移留出安全余量。
    const itemRadius = length * (0.8 + (hash % 11) * 0.055)
    let width = baseWidth

    let aspect
    if (item.type === 'topic') {
      aspect = textAspects[hash % textAspects.length]
      width *= 0.9 + ((hash >>> 3) % 4) * 0.07
    } else if (item.type === 'image') {
      aspect = imageAspects[hash % imageAspects.length]
      width *= 0.85 + ((hash >>> 3) % 6) * 0.07
    } else if (item.type === 'text') {
      aspect = textAspects[hash % textAspects.length]
      width *= clamp(0.62 + item.label.length * 0.05, 0.68, 1.15) * (0.9 + ((hash >>> 5) % 4) * 0.07)
    } else if (item.type === 'blank') {
      // 占位卡没有内容约束，长宽比放开到横竖都有，宽度差异也更大，视觉上更随机。
      const blankAspects = [0.75, 0.88, 1, 1.18, 1.33, 1.55, 1.85]
      aspect = blankAspects[(hash + 2) % blankAspects.length]
      width *= 0.5 + ((hash >>> 3) % 6) * 0.13
    } else {
      aspect = textAspects[(hash + 1) % textAspects.length]
      width *= 0.94
    }

    return {
      ...item,
      direction,
      radius: itemRadius,
      width,
      height: width / aspect,
    }
  })
}

export function projectPoint(point, { fov = 50, aspect = 1 } = {}) {
  if (!point || point.z >= -0.001) return null
  const tangent = Math.tan((fov * Math.PI) / 360)
  return {
    x: point.x / (-point.z * tangent * aspect),
    y: point.y / (-point.z * tangent),
  }
}

export function projectScreenHalfSize(screen, point, { fov = 50, aspect = 1 } = {}) {
  const tangent = Math.tan((fov * Math.PI) / 360)
  const depth = Math.max(1, -point.z)
  return {
    x: (screen.width / 2) / (depth * tangent * aspect),
    y: (screen.height / 2) / (depth * tangent),
  }
}

export function unprojectToSphere(projected, radius, { fov = 50, aspect = 1 } = {}) {
  const tangent = Math.tan((fov * Math.PI) / 360)
  const vector = {
    x: projected.x * tangent * aspect,
    y: projected.y * tangent,
    z: -1,
  }
  const length = Math.hypot(vector.x, vector.y, vector.z) || 1
  return {
    x: (vector.x / length) * radius,
    y: (vector.y / length) * radius,
    z: (vector.z / length) * radius,
  }
}

export function rectsOverlap(first, second, gap = 0) {
  return first.left < second.right + gap
    && first.right > second.left - gap
    && first.bottom < second.top + gap
    && first.top > second.bottom - gap
}

export function projectedRect(projected, halfSize) {
  return {
    left: projected.x - halfSize.x,
    right: projected.x + halfSize.x,
    bottom: projected.y - halfSize.y,
    top: projected.y + halfSize.y,
  }
}

export function avoidProtectedRect(projected, halfSize, protectedRect) {
  const sourceRect = projectedRect(projected, halfSize)
  if (!rectsOverlap(sourceRect, protectedRect)) return { ...projected }

  const candidates = [
    { x: protectedRect.left - halfSize.x, y: projected.y },
    { x: protectedRect.right + halfSize.x, y: projected.y },
    { x: projected.x, y: protectedRect.bottom - halfSize.y },
    { x: projected.x, y: protectedRect.top + halfSize.y },
  ]

  return candidates.reduce((nearest, candidate) => {
    const distance = Math.hypot(candidate.x - projected.x, candidate.y - projected.y)
    return distance < nearest.distance ? { ...candidate, distance } : nearest
  }, { ...candidates[0], distance: Number.POSITIVE_INFINITY })
}

export function resolveProjectedScreens(screens, protectedRect, gap = 0.018, iterations = 4, bounds = null) {
  const constrain = (projected, halfSize) => {
    // protectedRect 为 null 时不做中央避让：屏幕可自然从中央屏后方滑过，交互更顺滑。
    const resolved = protectedRect ? avoidProtectedRect(projected, halfSize, protectedRect) : { ...projected }
    if (!bounds) return resolved
    return {
      x: clamp(resolved.x, -bounds.x + halfSize.x * 0.35, bounds.x - halfSize.x * 0.35),
      y: clamp(resolved.y, -bounds.y + halfSize.y * 0.35, bounds.y - halfSize.y * 0.35),
    }
  }

  const resolved = screens.map((screen) => ({
    ...screen,
    projected: constrain(screen.projected, screen.halfSize),
  }))

  for (let pass = 0; pass < iterations; pass += 1) {
    for (let index = 0; index < resolved.length; index += 1) {
      for (let otherIndex = index + 1; otherIndex < resolved.length; otherIndex += 1) {
        const fixed = resolved[index]
        const moving = resolved[otherIndex]
        const fixedRect = projectedRect(fixed.projected, fixed.halfSize)
        const movingRect = projectedRect(moving.projected, moving.halfSize)
        if (!rectsOverlap(fixedRect, movingRect, gap)) continue

        const overlapX = Math.min(fixedRect.right, movingRect.right) - Math.max(fixedRect.left, movingRect.left) + gap
        const overlapY = Math.min(fixedRect.top, movingRect.top) - Math.max(fixedRect.bottom, movingRect.bottom) + gap
        if (overlapX <= overlapY) {
          const direction = moving.projected.x >= fixed.projected.x ? 1 : -1
          moving.projected.x += overlapX * direction
        } else {
          const direction = moving.projected.y >= fixed.projected.y ? 1 : -1
          moving.projected.y += overlapY * direction
        }

        moving.projected = constrain(moving.projected, moving.halfSize)
      }
    }
  }

  return resolved
}

export function selectVisibleScreens(screens, maximum = SCREEN_UNIVERSE_MAX_VISIBLE) {
  return screens
    .filter((screen) => screen.projected
      && Math.abs(screen.projected.x) <= 1.3 + screen.halfSize.x
      // 纵向阈值收紧：顶/底行在越出舞台前先退出屏幕池，避免被舞台边缘截断。
      && Math.abs(screen.projected.y) <= 1.08 + screen.halfSize.y * 0.4)
    .sort((first, second) => second.frontness - first.frontness || first.index - second.index)
    .slice(0, maximum)
}
