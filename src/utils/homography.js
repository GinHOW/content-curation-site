/**
 * 控制器 3D 透视变换与单应性矩阵（Homography Matrix）数学工具
 */

export function polygonToQuad(clip) {
  if (!clip) return null
  const values = [...clip.matchAll(/(-?\d*\.?\d+)%\s+(-?\d*\.?\d+)%/g)]
    .map((match) => ({ x: Number(match[1]), y: Number(match[2]) }))
  if (values.length !== 4) return null

  const byY = [...values].sort((a, b) => a.y - b.y)
  const top = byY.slice(0, 2).sort((a, b) => a.x - b.x)
  const bottom = byY.slice(2).sort((a, b) => a.x - b.x)
  return [top[0], top[1], bottom[1], bottom[0]]
}

export function homographyMatrix(sourceWidth, sourceHeight, targetPoints) {
  const [topLeft, topRight, bottomRight, bottomLeft] = targetPoints
  const x1 = topRight.x - bottomRight.x
  const x2 = bottomLeft.x - bottomRight.x
  const x3 = topLeft.x - topRight.x + bottomRight.x - bottomLeft.x
  const y1 = topRight.y - bottomRight.y
  const y2 = bottomLeft.y - bottomRight.y
  const y3 = topLeft.y - topRight.y + bottomRight.y - bottomLeft.y
  const denominator = x1 * y2 - x2 * y1

  if (Math.abs(denominator) < 0.0001) return 'none'

  let g = 0
  let h = 0
  if (Math.abs(x3) > 0.0001 || Math.abs(y3) > 0.0001) {
    g = (x3 * y2 - x2 * y3) / denominator
    h = (x1 * y3 - x3 * y1) / denominator
  }

  const a = topRight.x - topLeft.x + g * topRight.x
  const b = bottomLeft.x - topLeft.x + h * bottomLeft.x
  const c = topLeft.x
  const d = topRight.y - topLeft.y + g * topRight.y
  const e = bottomLeft.y - topLeft.y + h * bottomLeft.y
  const f = topLeft.y

  const values = [
    a / sourceWidth, d / sourceWidth, 0, g / sourceWidth,
    b / sourceHeight, e / sourceHeight, 0, h / sourceHeight,
    0, 0, 1, 0,
    c, f, 0, 1,
  ]
  return `matrix3d(${values.map((value) => Number(value.toFixed(6))).join(',')})`
}

export function perspectiveForZone(zone, width, height, bleedPercentage = 0) {
  if (!width || !height || !zone.quad || !zone.content) return 'none'

  const left = Number.parseFloat(zone.content.left)
  const top = Number.parseFloat(zone.content.top)
  const contentWidth = Number.parseFloat(zone.content.width)
  const contentHeight = Number.parseFloat(zone.content.height)
  const sourceWidth = (width * contentWidth) / 100
  const sourceHeight = (height * contentHeight) / 100
  const targetPoints = zone.quad.map((point) => ({
    x: ((point.x - left) * width) / 100,
    y: ((point.y - top) * height) / 100,
  }))
  const center = targetPoints.reduce(
    (result, point) => ({ x: result.x + point.x / targetPoints.length, y: result.y + point.y / targetPoints.length }),
    { x: 0, y: 0 },
  )
  const bleedX = (width * bleedPercentage) / 100
  const bleedY = (height * bleedPercentage) / 100
  const expandedTargetPoints = targetPoints.map((point) => ({
    x: point.x + (point.x >= center.x ? bleedX : -bleedX),
    y: point.y + (point.y >= center.y ? bleedY : -bleedY),
  }))

  return homographyMatrix(sourceWidth, sourceHeight, expandedTargetPoints)
}
