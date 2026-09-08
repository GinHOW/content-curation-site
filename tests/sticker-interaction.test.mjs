// @vitest-environment jsdom

import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { stickers } from '../src/data/stickers.js'
import { useStickerInteraction } from '../src/composables/useStickerInteraction.js'

let frameCallbacks
let nextFrameId

function flushAnimationFrames(timestamp = 16) {
  const callbacks = [...frameCallbacks.values()]
  frameCallbacks.clear()
  callbacks.forEach((callback) => callback(timestamp))
}

function pointerEvent(overrides = {}) {
  const button = overrides.currentTarget || {
    hasPointerCapture: vi.fn(() => true),
    releasePointerCapture: vi.fn(),
    setPointerCapture: vi.fn(),
  }
  return {
    button: 0,
    clientX: 100,
    clientY: 100,
    currentTarget: button,
    pointerId: 1,
    pointerType: 'mouse',
    preventDefault: vi.fn(),
    ...overrides,
  }
}

function mountInteraction(onOpenWork = vi.fn()) {
  const showcaseElement = ref(document.createElement('div'))
  showcaseElement.value.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    width: 1000,
    height: 600,
  })
  let api
  const Harness = defineComponent({
    setup() {
      api = useStickerInteraction({ showcaseElement, onOpenWork })
      return api
    },
    render() {
      return h('div')
    },
  })
  const wrapper = mount(Harness)
  return { api, onOpenWork, wrapper }
}

beforeEach(() => {
  frameCallbacks = new Map()
  nextFrameId = 1
  vi.useFakeTimers()
  vi.stubGlobal('requestAnimationFrame', (callback) => {
    const frameId = nextFrameId
    nextFrameId += 1
    frameCallbacks.set(frameId, callback)
    return frameId
  })
  vi.stubGlobal('cancelAnimationFrame', (frameId) => frameCallbacks.delete(frameId))
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280, writable: true })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('useStickerInteraction', () => {
  test('tracks responsive presets and exposes complete sticker style variables', async () => {
    const { api, wrapper } = mountInteraction()
    expect(api.activePreset.value).toBe('desktop')
    const style = api.stickerStyle(stickers[0])
    expect(style['--sticker-desktop-x']).toMatch(/%$/)
    expect(style['--sticker-mobile-angle']).toMatch(/deg$/)
    expect(style['--sticker-desktop-title-top']).toBeDefined()

    window.innerWidth = 800
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect(api.activePreset.value).toBe('tablet')

    window.innerWidth = 700
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect(api.activePreset.value).toBe('mobile')
    wrapper.unmount()
  })

  test('starts mouse drags after the threshold, batches movement, and suppresses the following click', () => {
    const { api, onOpenWork, wrapper } = mountInteraction()
    const sticker = stickers.find((item) => item.id === 'threshold')
    const button = pointerEvent().currentTarget
    const initial = api.layouts.value.desktop[sticker.id]

    api.handlePointerDown(pointerEvent({ currentTarget: button }), sticker)
    api.handlePointerMove(pointerEvent({ clientX: 104, clientY: 100, currentTarget: button }))
    expect(api.isDragging(sticker)).toBe(false)

    api.handlePointerMove(pointerEvent({ clientX: 50, clientY: 82, currentTarget: button }))
    expect(api.isDragging(sticker)).toBe(true)
    expect(button.setPointerCapture).toHaveBeenCalledWith(1)
    expect(frameCallbacks.size).toBe(1)
    flushAnimationFrames()
    expect(api.layouts.value.desktop[sticker.id]).not.toEqual(initial)

    const finish = pointerEvent({ currentTarget: button, clientX: 50, clientY: 82 })
    api.finishPointer(finish)
    expect(finish.preventDefault).toHaveBeenCalled()
    expect(api.dragAnnouncement.value).toContain('已重新摆放')
    api.handleClick(sticker)
    expect(onOpenWork).not.toHaveBeenCalled()
    vi.runAllTimers()
    api.handleClick(sticker)
    expect(onOpenWork).toHaveBeenCalledWith(sticker.workId)
    wrapper.unmount()
  })

  test('handles touch cancellation, pointer ownership, keyboard movement, and cleanup', () => {
    const { api, wrapper } = mountInteraction()
    const sticker = stickers.find((item) => item.id === 'threshold')
    const button = pointerEvent().currentTarget

    api.handlePointerDown(pointerEvent({ currentTarget: button, pointerType: 'touch' }), sticker)
    api.handlePointerMove(pointerEvent({ currentTarget: button, pointerType: 'touch', clientX: 130 }))
    expect(api.dragState.value).toBeNull()
    vi.advanceTimersByTime(400)
    expect(api.isDragging(sticker)).toBe(false)

    api.handlePointerDown(pointerEvent({ currentTarget: button }), sticker)
    api.handlePointerMove(pointerEvent({ currentTarget: button, pointerId: 2, clientX: 180 }))
    expect(api.isDragging(sticker)).toBe(false)
    api.handlePointerMove(pointerEvent({ currentTarget: button, clientX: 180 }))
    expect(api.isDragging(sticker)).toBe(true)
    api.cancelPointer(pointerEvent({ currentTarget: button }))
    expect(api.dragState.value).toBeNull()
    expect(button.releasePointerCapture).toHaveBeenCalledWith(1)

    const before = api.layouts.value.desktop[sticker.id]
    const keyboard = { altKey: true, key: 'ArrowLeft', shiftKey: true, preventDefault: vi.fn() }
    api.handleKeydown(keyboard, sticker)
    expect(keyboard.preventDefault).toHaveBeenCalled()
    expect(api.dragAnnouncement.value).toContain('已向左侧移动')
    expect(api.layouts.value.desktop[sticker.id].x).toBeLessThan(before.x)

    api.handleKeydown({ altKey: false, key: 'ArrowLeft', preventDefault: vi.fn() }, sticker)
    wrapper.unmount()
    expect(frameCallbacks.size).toBe(0)
  })
})
