import { onBeforeUnmount, onMounted, ref } from 'vue'
import { stickers, stickersById } from '../data/stickers.js'
import {
  canPlaceSticker,
  constrainStickerPosition,
  createFixedStickerLayouts,
} from '../utils/stickerLayout.js'

const cloneLayouts = (source) => Object.fromEntries(
  Object.entries(source).map(([presetName, layout]) => [
    presetName,
    Object.fromEntries(Object.entries(layout).map(([id, position]) => [id, { ...position }])),
  ]),
)

let sessionLayouts = null

export function useStickerInteraction({ showcaseElement, onOpenWork }) {
  let resizeListener = null
  let longPressTimer = null
  let dragFrame = null
  let pendingPointer = null
  let suppressNextClick = false

  const layouts = ref(sessionLayouts ? cloneLayouts(sessionLayouts) : createFixedStickerLayouts(stickers))
  const activePreset = ref('desktop')
  const dragState = ref(null)
  const dragAnnouncement = ref('')

  const getPresetName = () => {
    if (typeof window === 'undefined') return 'desktop'
    if (window.innerWidth < 768) return 'mobile'
    if (window.innerWidth < 1024) return 'tablet'
    return 'desktop'
  }

  const titleVariables = (presetName, layout) => {
    const below = layout.y < 22
    const alignEnd = layout.x > 72
    const prefix = `--sticker-${presetName}-title`

    return {
      [`${prefix}-top`]: below ? '100%' : '0',
      [`${prefix}-offset`]: below ? '0.45rem' : 'calc(-100% - 0.45rem)',
      [`${prefix}-left`]: alignEnd ? 'auto' : '0',
      [`${prefix}-right`]: alignEnd ? '0' : 'auto',
    }
  }

  const stickerStyle = (sticker) => {
    const desktop = layouts.value.desktop[sticker.id]
    const tablet = layouts.value.tablet[sticker.id]
    const mobile = layouts.value.mobile[sticker.id]
    const imageScale = sticker.imageScale ?? 1

    return {
      '--sticker-desktop-x': `${desktop.x}%`,
      '--sticker-desktop-y': `${desktop.y}%`,
      '--sticker-desktop-width': `${desktop.width}%`,
      '--sticker-desktop-angle': `${desktop.rotation}deg`,
      '--sticker-tablet-x': `${tablet.x}%`,
      '--sticker-tablet-y': `${tablet.y}%`,
      '--sticker-tablet-width': `${tablet.width}%`,
      '--sticker-tablet-angle': `${tablet.rotation}deg`,
      '--sticker-mobile-x': `${mobile.x}%`,
      '--sticker-mobile-y': `${mobile.y}%`,
      '--sticker-mobile-width': `${mobile.width}%`,
      '--sticker-mobile-angle': `${mobile.rotation}deg`,
      '--sticker-order': Number(sticker.number),
      '--sticker-image-scale': imageScale,
      '--sticker-image-hover-scale': sticker.imageScale ? imageScale + 0.02 : 1.025,
      '--sticker-image-press-scale': imageScale * 0.985,
      ...titleVariables('desktop', desktop),
      ...titleVariables('tablet', tablet),
      ...titleVariables('mobile', mobile),
    }
  }

  const persistLayouts = () => {
    sessionLayouts = cloneLayouts(layouts.value)
  }

  const updateStickerLayout = (presetName, stickerId, nextLayout, persist = false) => {
    layouts.value = {
      ...layouts.value,
      [presetName]: {
        ...layouts.value[presetName],
        [stickerId]: nextLayout,
      },
    }

    if (persist) persistLayouts()
  }

  const clearLongPress = () => {
    if (longPressTimer) window.clearTimeout(longPressTimer)
    longPressTimer = null
  }

  const releasePointer = (state) => {
    if (state.button?.hasPointerCapture?.(state.pointerId)) {
      state.button.releasePointerCapture(state.pointerId)
    }
  }

  const startDragging = (state) => {
    if (dragState.value !== state || state.dragging) return
    clearLongPress()
    state.dragging = true
    state.button.setPointerCapture?.(state.pointerId)
    dragState.value = { ...state }
    dragAnnouncement.value = `正在移动${stickersById[state.stickerId].title}`
  }

  const applyPendingPointer = () => {
    dragFrame = null
    const state = dragState.value
    const point = pendingPointer
    pendingPointer = null

    if (!state?.dragging || !point || !showcaseElement.value) return
    const sticker = stickersById[state.stickerId]
    const rect = showcaseElement.value.getBoundingClientRect()
    if (!rect.width || !rect.height) return

    const candidate = constrainStickerPosition(sticker, {
      ...state.startLayout,
      x: state.startLayout.x + ((point.clientX - state.startX) / rect.width) * 100,
      y: state.startLayout.y + ((point.clientY - state.startY) / rect.height) * 100,
    }, state.preset, {
      allowBleed: Boolean(sticker.bleedEligible),
    })

    if (canPlaceSticker(candidate, layouts.value[state.preset], sticker.id)) {
      state.lastValid = candidate
      updateStickerLayout(state.preset, sticker.id, candidate)
    }
  }

  const handlePointerDown = (event, sticker) => {
    if (event.pointerType !== 'touch' && event.button !== 0) return
    const preset = activePreset.value
    const startLayout = layouts.value[preset][sticker.id]
    const state = {
      stickerId: sticker.id,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      preset,
      startX: event.clientX,
      startY: event.clientY,
      startLayout: { ...startLayout },
      lastValid: { ...startLayout },
      button: event.currentTarget,
      dragging: false,
    }

    dragState.value = state

    if (event.pointerType === 'touch') {
      longPressTimer = window.setTimeout(() => startDragging(state), 350)
    } else {
      state.button.setPointerCapture?.(event.pointerId)
    }
  }

  const handlePointerMove = (event) => {
    const state = dragState.value
    if (!state || state.pointerId !== event.pointerId) return

    const distance = Math.hypot(event.clientX - state.startX, event.clientY - state.startY)

    if (!state.dragging) {
      if (state.pointerType === 'touch') {
        if (distance > 10) {
          clearLongPress()
          dragState.value = null
        }
        return
      }

      if (distance > 6) startDragging(state)
      else return
    }

    event.preventDefault()
    pendingPointer = { clientX: event.clientX, clientY: event.clientY }
    if (!dragFrame) dragFrame = window.requestAnimationFrame(applyPendingPointer)
  }

  const finishPointer = (event) => {
    const state = dragState.value
    if (!state || state.pointerId !== event.pointerId) return

    clearLongPress()
    if (dragFrame) {
      window.cancelAnimationFrame(dragFrame)
      dragFrame = null
      applyPendingPointer()
    }

    if (state.dragging) {
      event.preventDefault()
      releasePointer(state)
      persistLayouts()
      suppressNextClick = true
      window.setTimeout(() => { suppressNextClick = false }, 0)
      dragAnnouncement.value = `${stickersById[state.stickerId].title}已重新摆放`
    } else {
      releasePointer(state)
    }

    pendingPointer = null
    dragState.value = null
  }

  const cancelPointer = (event) => {
    const state = dragState.value
    if (!state || state.pointerId !== event.pointerId) return

    clearLongPress()
    if (dragFrame) window.cancelAnimationFrame(dragFrame)
    dragFrame = null
    pendingPointer = null
    releasePointer(state)
    if (state.dragging) persistLayouts()
    dragState.value = null
  }

  const handleClick = (sticker) => {
    if (suppressNextClick) return
    onOpenWork?.(sticker.workId)
  }

  const handleKeydown = (event, sticker) => {
    if (!event.altKey) return

    const directions = {
      ArrowUp: { x: 0, y: -1, label: '上方' },
      ArrowDown: { x: 0, y: 1, label: '下方' },
      ArrowLeft: { x: -1, y: 0, label: '左侧' },
      ArrowRight: { x: 1, y: 0, label: '右侧' },
    }
    const direction = directions[event.key]
    if (!direction) return

    event.preventDefault()
    const step = event.shiftKey ? 4 : 1
    const preset = activePreset.value
    const current = layouts.value[preset][sticker.id]
    const candidate = constrainStickerPosition(sticker, {
      ...current,
      x: current.x + direction.x * step,
      y: current.y + direction.y * step,
    }, preset, {
      allowBleed: Boolean(sticker.bleedEligible),
    })

    if (candidate.x === current.x && candidate.y === current.y) {
      dragAnnouncement.value = `${sticker.title}已到达画布边界`
      return
    }

    if (!canPlaceSticker(candidate, layouts.value[preset], sticker.id)) {
      dragAnnouncement.value = `${sticker.title}与其他贴纸相邻，无法继续移动`
      return
    }

    updateStickerLayout(preset, sticker.id, candidate, true)
    dragAnnouncement.value = `${sticker.title}已向${direction.label}移动`
  }

  const isDragging = (sticker) => (
    Boolean(dragState.value?.dragging && dragState.value.stickerId === sticker.id)
  )

  onMounted(() => {
    activePreset.value = getPresetName()
    resizeListener = () => { activePreset.value = getPresetName() }
    window.addEventListener('resize', resizeListener, { passive: true })
  })

  onBeforeUnmount(() => {
    clearLongPress()
    if (dragFrame) window.cancelAnimationFrame(dragFrame)
    if (resizeListener) window.removeEventListener('resize', resizeListener)
  })

  return {
    layouts,
    activePreset,
    dragState,
    dragAnnouncement,
    isDragging,
    stickerStyle,
    handlePointerDown,
    handlePointerMove,
    finishPointer,
    cancelPointer,
    handleClick,
    handleKeydown,
  }
}
