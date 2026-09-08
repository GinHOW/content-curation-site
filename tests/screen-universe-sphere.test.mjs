import assert from 'node:assert/strict'
import { test } from 'vitest'
import {
  SCREEN_UNIVERSE_ARC_DEGREES,
  SCREEN_UNIVERSE_MAX_VISIBLE,
  SCREEN_UNIVERSE_MIN_ACTIVE,
  avoidProtectedRect,
  createScreenItems,
  createScreenLayout,
  projectPoint,
  projectScreenHalfSize,
  projectedRect,
  rectsOverlap,
  resolveProjectedScreens,
  selectVisibleScreens,
  unprojectToSphere,
} from '../src/utils/screenUniverseSphere.js'

function imageItems(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `image-${index}`,
    type: 'image',
    label: '测试',
    src: `/image-${index}.webp`,
    alt: `测试图片${index}`,
  }))
}

test('圆柱面布局支持任意数量、单位方向且铺满 270° 弧', () => {
  const halfArc = ((SCREEN_UNIVERSE_ARC_DEGREES / 2) * Math.PI) / 180
  for (const count of [0, 1, 5, 17, 32, 100]) {
    const layout = createScreenLayout(imageItems(count), `count-${count}`)
    assert.equal(layout.length, count)
    layout.forEach((screen) => {
      const length = Math.hypot(screen.direction.x, screen.direction.y, screen.direction.z)
      assert.ok(Math.abs(length - 1) < 1e-10)
      assert.ok(screen.radius > 0)
      assert.ok(screen.width > 0)
      assert.ok(screen.height > 0)
      // 柱面方位角（0 = 正前方）不超出 270° 弧的半角
      const azimuth = Math.atan2(screen.direction.x, -screen.direction.z)
      assert.ok(Math.abs(azimuth) <= halfArc + 0.05, `方位角超出弧面：${azimuth}`)
    })
  }
})

test('相同数据和种子生成稳定位置', () => {
  const items = imageItems(32)
  assert.deepEqual(
    createScreenLayout(items, '监控室'),
    createScreenLayout(items, '监控室'),
  )
})

test('图片集合去重且不再限制为十八张', () => {
  const library = {
    监控室: [
      ...imageItems(32).map(({ src, alt }) => ({ src, alt })),
      { src: '/image-0.webp', alt: '重复图片' },
    ],
  }
  const items = createScreenItems({ keyword: '监控室', imageLibrary: library })
  assert.equal(items.length, 32)
  assert.equal(new Set(items.map((item) => item.src)).size, 32)
})

test('无文字素材的选题用空白卡片补齐屏幕墙', () => {
  const items = createScreenItems({ keyword: '暗房', imageLibrary: { 暗房: [] } })
  assert.equal(items.length, SCREEN_UNIVERSE_MIN_ACTIVE)
  assert.ok(items.every((item) => item.type === 'blank' && item.label === ''))
  assert.equal(new Set(items.map((item) => item.id)).size, SCREEN_UNIVERSE_MIN_ACTIVE)
})

test('图片不足的选题保留全部图片并用文字标签屏补齐', () => {
  const textLibrary = { 客厅: ['《情书》｜维米尔', '荣国府正厅｜曹雪芹《红楼梦》', '电视即火塘｜形式转译'] }
  const library = { 客厅: imageItems(5).map(({ src, alt }) => ({ src, alt })) }
  const items = createScreenItems({ keyword: '客厅', imageLibrary: library, textLibrary })
  assert.equal(items.length, SCREEN_UNIVERSE_MIN_ACTIVE)
  assert.equal(items.filter((item) => item.type === 'image').length, 5)
  const textScreens = items.filter((item) => item.type === 'text')
  assert.equal(textScreens.length, SCREEN_UNIVERSE_MIN_ACTIVE - 5)
  textScreens.forEach((item) => assert.ok(textLibrary.客厅.includes(item.label)))
})

test('圆柱面纵深拉开，相邻屏幕不在同一深度穿模', () => {
  const layout = createScreenLayout(imageItems(32), '监控室')
  const radii = new Set(layout.map((screen) => screen.radius))
  assert.ok(radii.size > 1, '屏幕应分布在多个纵深层级上')
  const values = [...radii]
  const spread = Math.max(...values) - Math.min(...values)
  assert.ok(spread > 100, `纵深差异过小：${spread}`)
})

test('中央保护区将屏幕推向最近边缘', () => {
  const protectedRect = { left: -0.35, right: 0.35, bottom: -0.28, top: 0.28 }
  const halfSize = { x: 0.08, y: 0.06 }
  const moved = avoidProtectedRect({ x: 0, y: 0 }, halfSize, protectedRect)
  assert.equal(rectsOverlap(projectedRect(moved, halfSize), protectedRect), false)

  const resolved = resolveProjectedScreens([
    { index: 0, projected: { x: 0, y: 0 }, halfSize },
    { index: 1, projected: { x: 0.02, y: 0.01 }, halfSize },
  ], protectedRect)
  resolved.forEach((screen) => {
    assert.equal(rectsOverlap(projectedRect(screen.projected, halfSize), protectedRect), false)
  })
})

test('可见屏幕池严格遵守节点预算', () => {
  const screens = Array.from({ length: 100 }, (_, index) => ({
    index,
    projected: { x: (index % 10) / 20, y: Math.floor(index / 10) / 20 },
    halfSize: { x: 0.03, y: 0.03 },
    frontness: 1 - index / 100,
  }))
  assert.equal(selectVisibleScreens(screens).length, SCREEN_UNIVERSE_MAX_VISIBLE)
})

test('三维投影与球体反投影计算符合透视几何', () => {
  // 位于相机后方或正前平面的点应被剔除
  assert.equal(projectPoint(null), null)
  assert.equal(projectPoint({ x: 0, y: 0, z: 0 }), null)
  assert.equal(projectPoint({ x: 0, y: 0, z: 1 }), null)

  // 正常前方点投影
  const projected = projectPoint({ x: 0, y: 0, z: -10 }, { fov: 60, aspect: 1 })
  assert.ok(projected)
  assert.equal(Math.round(projected.x), 0)
  assert.equal(Math.round(projected.y), 0)

  // 尺寸半高宽投影
  const halfSize = projectScreenHalfSize({ width: 2, height: 1 }, { x: 0, y: 0, z: -10 })
  assert.ok(halfSize.x > 0)
  assert.ok(halfSize.y > 0)

  // 反投影到球体表面，其半径应等于指定 radius
  const spherePoint = unprojectToSphere({ x: 0, y: 0 }, 100)
  const radius = Math.hypot(spherePoint.x, spherePoint.y, spherePoint.z)
  assert.ok(Math.abs(radius - 100) < 1e-4)
})
