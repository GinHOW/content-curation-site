// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { useScreenUniverseScene } from '../src/composables/useScreenUniverseScene.js'

let frameCallbacks
let nextFrameId

function flushAnimationFrames(timestamp = 16, maximumPasses = 1) {
  for (let pass = 0; pass < maximumPasses; pass += 1) {
    const callbacks = [...frameCallbacks.values()]
    frameCallbacks.clear()
    if (!callbacks.length) return
    callbacks.forEach((callback) => callback(timestamp + pass * 16))
  }
}

function createSceneHarness() {
  const state = {
    activeTopic: '客厅',
    dragging: false,
    expanded: false,
    portrait: false,
    reduced: false,
  }
  const onSelectTopic = vi.fn()
  const onImageLoadError = vi.fn()
  const manager = useScreenUniverseScene({
    getActiveTopic: () => state.activeTopic,
    getIsDragging: () => state.dragging,
    getTopicColor: () => '#d22',
    isPortraitPhone: () => state.portrait,
    isReducedMotion: () => state.reduced,
    isScreenExpanded: () => state.expanded,
    onImageLoadError,
    onSelectTopic,
  })
  const host = document.createElement('div')
  const stage = document.createElement('div')
  stage.getBoundingClientRect = () => ({ left: 10, top: 20, width: 1200, height: 600 })
  document.body.append(host, stage)
  return { host, manager, onImageLoadError, onSelectTopic, stage, state }
}

beforeEach(() => {
  frameCallbacks = new Map()
  nextFrameId = 1
  vi.stubGlobal('requestAnimationFrame', (callback) => {
    const frameId = nextFrameId
    nextFrameId += 1
    frameCallbacks.set(frameId, callback)
    return frameId
  })
  vi.stubGlobal('cancelAnimationFrame', (frameId) => frameCallbacks.delete(frameId))
})

afterEach(() => {
  document.body.replaceChildren()
  vi.unstubAllGlobals()
})

describe('useScreenUniverseScene', () => {
  test('initializes a CSS3D panel pool, renders an active layout, and cleans up safely', async () => {
    const { host, manager, onImageLoadError, stage } = createSceneHarness()
    await manager.initialize(host, stage, document.createElement('button'))
    expect(host.querySelector('.screen-universe-css3d')).not.toBeNull()

    manager.rebuildSphereLayout({
      keyword: '客厅',
      keywords: ['客厅', '厨房'],
      imageLibrary: { 客厅: [{ src: '/living-room.webp', alt: '客厅图像' }] },
      textLibrary: { 客厅: ['电视即火塘'] },
    })
    flushAnimationFrames(16, 4)
    const image = host.querySelector('img')
    expect(image).not.toBeNull()
    expect(host.querySelectorAll('.screen-universe-satellite').length).toBeGreaterThan(0)

    Object.defineProperties(image, {
      naturalHeight: { configurable: true, value: 400 },
      naturalWidth: { configurable: true, value: 200 },
    })
    image.dispatchEvent(new Event('load'))
    host.querySelector('.screen-universe-satellite').dispatchEvent(new Event('pointerenter'))
    flushAnimationFrames(48, 2)
    host.querySelector('.screen-universe-satellite').dispatchEvent(new Event('pointerleave'))

    image.dispatchEvent(new Event('error'))
    flushAnimationFrames(80, 2)
    expect(onImageLoadError).toHaveBeenCalledTimes(1)
    expect(host.querySelector('img')).toBeNull()

    manager.resizeUniverse()
    manager.destroy()
    expect(host.querySelector('.screen-universe-css3d')).toBeNull()
    expect(frameCallbacks.size).toBe(0)
  })

  test('drives keyboard, inertia, sway, visibility guards, click suppression, and empty-state reset', async () => {
    const { host, manager, stage, state } = createSceneHarness()
    await manager.initialize(host, stage, document.createElement('button'))
    manager.rebuildSphereLayout({
      keyword: '客厅',
      keywords: ['客厅'],
      imageLibrary: { 客厅: [] },
      textLibrary: { 客厅: ['电视即火塘', '一盏灯'] },
    })
    flushAnimationFrames(16, 3)

    manager.setVelocities(0.02, -0.02)
    manager.rotateBy(0.1, -0.1)
    manager.requestUniverseRender()
    flushAnimationFrames(64, 3)
    manager.stepKeyboard('ArrowLeft')
    manager.stepKeyboard('ArrowRight')
    manager.stepKeyboard('ArrowUp')
    manager.stepKeyboard('ArrowDown')
    manager.updateSwayTarget(1210, 20)
    flushAnimationFrames(128, 2)
    expect(host.style.getPropertyValue('--drag-skew')).toMatch(/deg/)
    manager.resetSwayTarget()

    manager.setSuppressClickUntil(performance.now() + 1000)
    expect(manager.isClickSuppressed()).toBe(true)
    manager.setSuppressClickUntil(0)
    expect(manager.isClickSuppressed()).toBe(false)

    state.reduced = true
    state.portrait = true
    manager.updateSwayTarget(500, 300)
    manager.requestUniverseRender()
    flushAnimationFrames(180, 2)
    expect(host.querySelectorAll('.screen-universe-satellite').length).toBe(0)

    state.portrait = false
    state.expanded = true
    manager.requestUniverseRender()
    flushAnimationFrames(220, 2)
    manager.rebuildSphereLayout({ keyword: '', keywords: [], imageLibrary: {}, textLibrary: {} })
    flushAnimationFrames(260, 1)
    manager.destroy()
  })
})
