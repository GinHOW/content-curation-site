/**
 * 三维交互控制器与键盘漫游输入 Composable
 * 负责 PointerLock、第一人称视角拖拽/锁定旋转、键盘移动物理碰撞以及全局快捷键
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { applyPointerRotation, stepFreeFlight, rebuildCollisionMeshes } from '../../../utils/spatial-model/roamingPhysics.js'

export function useSpatialModelControls({
  props,
  emit,
  getTHREE,
  getRenderer,
  getPerspectiveCamera,
  getActiveCamera,
  getLights,
  internal3DMode,
  mobileViewport,
  immersiveReady,
  calibrationOpen,
  spacesDrawerOpen,
  layersPanelOpen,
  roomMeshes,
  requestRender,
  enterActiveMotionDpr,
  scheduleRestoreStaticDpr,
  leaveImmersive,
  toggleCalibration,
  onPositionChanged,
}) {
  const roamingActive = ref(false)
  const pointerLocked = ref(false)
  const pressedKeys = new Set()

  let pointerDownPosition = undefined
  let dragLookPosition = undefined
  let pointerLockWasActive = false
  let collisionRaycaster = null
  let collisionMeshes = []
  let raycaster = null
  let pointer = null

  function initRaycasters(THREE) {
    raycaster = new THREE.Raycaster()
    collisionRaycaster = new THREE.Raycaster()
    pointer = new THREE.Vector2()
  }

  function updateCollisionMeshes(model) {
    if (!model || !collisionRaycaster) return
    collisionMeshes = rebuildCollisionMeshes(model, collisionRaycaster)
  }

  function releasePointerLock() {
    pointerLockWasActive = false
    roamingActive.value = false
    dragLookPosition = undefined
    pressedKeys.clear()
    const renderer = getRenderer()
    if (renderer && document.pointerLockElement === renderer.domElement) {
      document.exitPointerLock?.()
    }
    pointerLocked.value = false
    emit('pointer-lock-change', false)
  }

  const isImmersiveMode = () => internal3DMode.value === 'immersive' && !mobileViewport.value

  function startRoaming(options = {}) {
    const renderer = getRenderer()
    if (!renderer?.domElement || !isImmersiveMode()) return
    const requestLock = typeof options === 'object' && options !== null && 'requestLock' in options
      ? options.requestLock
      : !calibrationOpen.value
    roamingActive.value = true
    spacesDrawerOpen.value = false
    layersPanelOpen.value = false
    renderer.domElement.focus({ preventScroll: true })
    requestRender()
    if (!requestLock) return
    try {
      const lockRequest = renderer.domElement.requestPointerLock?.()
      lockRequest?.catch?.(() => {})
    } catch {
      // Embedded previews can block Pointer Lock
    }
  }

  function updatePointerLockState() {
    const renderer = getRenderer()
    const locked = document.pointerLockElement === renderer?.domElement
    pointerLocked.value = locked
    emit('pointer-lock-change', locked)
    if (!locked) {
      pointerLockWasActive = false
      roamingActive.value = false
      dragLookPosition = undefined
      pressedKeys.clear()
      scheduleRestoreStaticDpr(false)
      requestRender()
    } else {
      pointerLockWasActive = true
    }
  }

  function handlePointerDown(event) {
    pointerDownPosition = { x: event.clientX, y: event.clientY }
    if (!isImmersiveMode() || pointerLocked.value) return
    if (!roamingActive.value) {
      startRoaming({ requestLock: false })
    }
    dragLookPosition = { x: event.clientX, y: event.clientY }
    const renderer = getRenderer()
    renderer?.domElement.setPointerCapture?.(event.pointerId)
    renderer?.domElement.focus({ preventScroll: true })
  }

  function handlePointerUp(event) {
    if (isImmersiveMode()) {
      dragLookPosition = undefined
      const renderer = getRenderer()
      renderer?.domElement.releasePointerCapture?.(event.pointerId)
      pointerDownPosition = undefined
      scheduleRestoreStaticDpr(pressedKeys.size > 0)
      return
    }
    if (!pointerDownPosition) return
    const activeCamera = getActiveCamera()
    const renderer = getRenderer()
    if (!activeCamera || !renderer || !raycaster) return
    const moved = Math.hypot(event.clientX - pointerDownPosition.x, event.clientY - pointerDownPosition.y)
    pointerDownPosition = undefined
    if (moved > 5) return

    const bounds = renderer.domElement.getBoundingClientRect()
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    raycaster.setFromCamera(pointer, activeCamera)
    const hit = raycaster.intersectObjects(roomMeshes, true)[0]
    const roomName = hit?.object.userData.navigationRoom
    const room = roomName ? props.rooms.find((r) => r.id === `room${roomName.slice(1)}`) : null
    if (!room) return
    const keyword = room.keywords.includes(props.activeKeyword) ? props.activeKeyword : room.keywords[0]
    emit('activate-space', {
      roomId: room.id,
      keyword,
      source: 'model-hotspot',
    })
  }

  function handlePointerMove(event) {
    const perspectiveCamera = getPerspectiveCamera()
    const THREE = getTHREE()
    if (!isImmersiveMode() || !perspectiveCamera || !THREE) return
    if (!roamingActive.value && !pointerLocked.value && !dragLookPosition) return
    const movementX = pointerLocked.value
      ? event.movementX
      : dragLookPosition ? event.clientX - dragLookPosition.x : 0
    const movementY = pointerLocked.value
      ? event.movementY
      : dragLookPosition ? event.clientY - dragLookPosition.y : 0
    if (!pointerLocked.value && dragLookPosition) dragLookPosition = { x: event.clientX, y: event.clientY }
    if (!movementX && !movementY) return

    enterActiveMotionDpr()
    applyPointerRotation({ perspectiveCamera, movementX, movementY, THREE })
    if (calibrationOpen.value && onPositionChanged) onPositionChanged()
    scheduleRestoreStaticDpr(pressedKeys.size > 0)
    requestRender()
  }

  function handleKeyDown(event) {
    if (event.target?.matches?.('input, textarea, select, [contenteditable="true"]')) return

    const isFullscreenShortcut = event.code === 'KeyF'
      || event.code === 'F'
      || event.key?.toLowerCase() === 'f'
    if (isFullscreenShortcut && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault()
      emit('toggle-expand')
      return
    }

    if (event.code === 'Escape' || event.key === 'Escape') {
      event.preventDefault()
      if (pointerLocked.value || roamingActive.value) {
        releasePointerLock()
        return
      }
      if (calibrationOpen.value) {
        calibrationOpen.value = false
        return
      }
      if (spacesDrawerOpen.value) {
        spacesDrawerOpen.value = false
        return
      }
      if (layersPanelOpen.value) {
        layersPanelOpen.value = false
        return
      }
      if (props.isExpanded) {
        emit('toggle-expand')
        return
      }
      leaveImmersive('escape')
      return
    }

    const isCalibrationShortcut = event.code === 'KeyC'
      || event.code === 'C'
      || event.key?.toLowerCase() === 'c'
    if (isCalibrationShortcut && isImmersiveMode()) {
      event.preventDefault()
      toggleCalibration()
      return
    }

    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyQ', 'KeyE'].includes(event.code)) {
      if (!isImmersiveMode()) return
      event.preventDefault()
      if (immersiveReady.value && !roamingActive.value) {
        startRoaming({ requestLock: !calibrationOpen.value })
      }
      pressedKeys.add(event.code)
      enterActiveMotionDpr()
      requestRender()
    }
  }

  function handleKeyUp(event) {
    pressedKeys.delete(event.code)
    if (pressedKeys.size === 0) {
      scheduleRestoreStaticDpr(false)
    }
    requestRender()
  }

  function clearPressedKeys() {
    pressedKeys.clear()
    scheduleRestoreStaticDpr(false)
  }

  function stepPhysics(delta) {
    const perspectiveCamera = getPerspectiveCamera()
    const THREE = getTHREE()
    const lights = getLights()
    if (roamingActive.value && isImmersiveMode() && perspectiveCamera && THREE) {
      if (pressedKeys.size > 0) {
        stepFreeFlight({
          delta,
          perspectiveCamera,
          pressedKeys,
          collisionRaycaster,
          collisionMeshes,
          arcticGround: lights?.arcticGround,
          THREE,
          onPositionChanged: () => {
            if (calibrationOpen.value && onPositionChanged) onPositionChanged()
          },
        })
        enterActiveMotionDpr()
        return true
      }
    }
    return false
  }

  onMounted(() => {
    document.addEventListener('pointerlockchange', updatePointerLockState)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', clearPressedKeys)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('pointerlockchange', updatePointerLockState)
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    window.removeEventListener('blur', clearPressedKeys)
  })

  return {
    roamingActive,
    pointerLocked,
    pressedKeys,
    initRaycasters,
    updateCollisionMeshes,
    releasePointerLock,
    startRoaming,
    handlePointerDown,
    handlePointerUp,
    handlePointerMove,
    stepPhysics,
  }
}
