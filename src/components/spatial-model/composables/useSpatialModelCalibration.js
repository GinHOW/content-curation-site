/**
 * 三维镜头机位标定 Composable
 * 负责透视相机的 FOV 动态调节、机位快照计算、数据格式化与剪贴板复制
 */
import { computed, ref } from 'vue'
import { MODEL_FILE_LABEL, clampImmersiveFov, vectorSnapshot } from '../../../data/spatial/modelConfig.js'

export function useSpatialModelCalibration({
  props,
  selectedRoom,
  getTHREE,
  getPerspectiveCamera,
  requestRender,
  startRoaming,
  releasePointerLock,
}) {
  const calibrationOpen = ref(false)
  const calibrationFov = ref(50)
  const calibrationSnapshot = ref(null)
  const calibrationNotice = ref('')
  const copyFallbackVisible = ref(false)

  const calibrationData = computed(() => {
    const snapshot = calibrationSnapshot.value
    if (!snapshot || !props.activeRoomId) return null
    return {
      schema: 'spatial-camera-v1',
      model: MODEL_FILE_LABEL,
      roomId: props.activeRoomId,
      room: selectedRoom.value?.number || '',
      position: snapshot.position,
      target: snapshot.target,
      fov: snapshot.fov,
    }
  })

  const calibrationDataText = computed(() => (
    calibrationData.value ? JSON.stringify(calibrationData.value, null, 2) : ''
  ))

  function applyPerspectiveFov(value) {
    const perspectiveCamera = getPerspectiveCamera()
    if (!perspectiveCamera) return
    const nextFov = clampImmersiveFov(value)
    perspectiveCamera.fov = nextFov
    perspectiveCamera.updateProjectionMatrix()
    calibrationFov.value = nextFov
    requestRender()
  }

  function refreshCalibrationSnapshot() {
    const perspectiveCamera = getPerspectiveCamera()
    const THREE = getTHREE()
    if (!perspectiveCamera || !THREE) {
      calibrationSnapshot.value = null
      return
    }
    const direction = perspectiveCamera.getWorldDirection(new THREE.Vector3()).normalize()
    calibrationSnapshot.value = {
      position: vectorSnapshot(perspectiveCamera.position),
      target: vectorSnapshot(perspectiveCamera.position.clone().add(direction)),
      fov: Math.round(perspectiveCamera.fov),
    }
  }

  function handleFovUpdate(val) {
    applyPerspectiveFov(val)
    refreshCalibrationSnapshot()
  }

  function toggleCalibration(mobileViewport, immersiveReady) {
    if (props.viewMode !== 'immersive' || mobileViewport?.value || !immersiveReady?.value) return
    if (calibrationOpen.value) {
      closeCalibration()
      return
    }
    calibrationOpen.value = true
    calibrationNotice.value = ''
    copyFallbackVisible.value = false
    releasePointerLock()
    refreshCalibrationSnapshot()
    requestRender()
  }

  function closeCalibration() {
    calibrationOpen.value = false
    calibrationNotice.value = ''
    copyFallbackVisible.value = false
    refreshCalibrationSnapshot()
    requestRender()
  }

  async function copyCameraData() {
    refreshCalibrationSnapshot()
    const text = calibrationDataText.value
    if (!text) return
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(text)
      copyFallbackVisible.value = false
      calibrationNotice.value = '镜头数据已复制，请连同当前画面截图发给我。'
    } catch {
      copyFallbackVisible.value = true
      calibrationNotice.value = '浏览器未授权自动复制，请在下方文本框中手动复制。'
    }
  }

  return {
    calibrationOpen,
    calibrationFov,
    calibrationSnapshot,
    calibrationNotice,
    copyFallbackVisible,
    calibrationData,
    calibrationDataText,
    applyPerspectiveFov,
    refreshCalibrationSnapshot,
    handleFovUpdate,
    toggleCalibration,
    closeCalibration,
    copyCameraData,
  }
}
