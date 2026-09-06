import {
  SCREEN_UNIVERSE_ARC_DEGREES,
  SCREEN_UNIVERSE_MAX_VISIBLE,
  createScreenItems,
  createScreenLayout,
  projectPoint,
  projectScreenHalfSize,
  resolveProjectedScreens,
  selectVisibleScreens,
  unprojectToSphere,
} from '../utils/screenUniverseSphere.js'

const CAMERA_FOV = 50
// 圆柱面内容铺满 270° 弧，拖拽限位让视野边缘始终有屏幕，不会转进空背面。
const ACTIVE_YAW_LIMIT = ((SCREEN_UNIVERSE_ARC_DEGREES / 2 - 50) * Math.PI) / 180
const ACTIVE_PITCH_LIMIT = (14 * Math.PI) / 180
// 鼠标跟随的摆动幅度比拖拽限位小，浏览更平稳。
const SWAY_YAW_LIMIT = (60 * Math.PI) / 180
const PANEL_GAP_NDC = 0.03

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}

function signalFontSize(label = '') {
  if (label.length > 12) return '17px'
  if (label.length > 7) return '20px'
  return '24px'
}

/**
 * 屏幕宇宙 Three.js CSS3D 场景与对象池管理 Composable
 */
export function useScreenUniverseScene(options = {}) {
  const {
    getActiveTopic,
    getTopicColor,
    isReducedMotion,
    isPortraitPhone,
    isScreenExpanded,
    getIsDragging,
    onSelectTopic,
    onImageLoadError,
  } = options

  let THREE
  let CSS3DObject
  let scene
  let camera
  let renderer
  let rendererHost = null
  let stageElement = null
  let centralScreenElement = null
  let disposed = false

  let sphereLayout = []
  let panelPool = []
  let panelByItemId = new Map()
  let animationFrame = 0
  let lastFrameTime = 0

  let yaw = 0
  let pitch = 0
  let yawVelocity = 0
  let pitchVelocity = 0
  let swayYaw = 0
  let swayPitch = 0
  let swayTargetYaw = 0
  let swayTargetPitch = 0
  let suppressClickUntil = 0

  let lookTarget
  let rotationEuler
  let rotationQuaternion

  function rotationLimits() {
    return { yaw: ACTIVE_YAW_LIMIT, pitch: ACTIVE_PITCH_LIMIT }
  }

  function releasePanel(entry) {
    if (entry.itemId) panelByItemId.delete(entry.itemId)
    entry.itemId = ''
    entry.screen = null
    entry.panel = null
    entry.raised = false
    entry.currentPosition = null
    entry.targetPosition = null
    entry.object.visible = false
    entry.wrapper.replaceChildren()
  }

  function releaseAllPanels() {
    panelPool.forEach(releasePanel)
    panelByItemId = new Map()
  }

  function setPanelRaised(entry, raised) {
    if (entry.raised === raised) return
    entry.raised = raised
    requestUniverseRender()
  }

  function handleImageError(entry, screen) {
    if (entry.itemId !== screen.id) return
    screen.type = 'signal'
    screen.src = ''
    bindPanel(entry, screen)
    if (onImageLoadError) {
      onImageLoadError(screen)
    }
    requestUniverseRender()
  }

  function handleImageLoad(entry, screen, image) {
    if (entry.itemId !== screen.id || !image.naturalWidth || !image.naturalHeight) return
    // 图片屏尊重原始宽高比：竖图保持竖卡片，只在极端比例处收口。
    const naturalAspect = clamp(image.naturalWidth / image.naturalHeight, 0.72, 2.1)
    const currentAspect = screen.width / screen.height
    if (Math.abs(naturalAspect - currentAspect) < 0.12) return
    screen.height = screen.width / naturalAspect
    entry.wrapper.style.height = `${screen.height}px`
    requestUniverseRender()
  }

  function createSignalContent(label) {
    const signal = document.createElement('span')
    signal.className = 'screen-universe-signal'
    const word = document.createElement('span')
    word.className = 'screen-universe-signal-word'
    word.textContent = label
    word.style.setProperty('--screen-signal-font-size', signalFontSize(label))
    signal.appendChild(word)
    return signal
  }

  function bindPanel(entry, screen) {
    if (entry.itemId) panelByItemId.delete(entry.itemId)
    entry.wrapper.replaceChildren()
    entry.wrapper.style.width = `${screen.width}px`
    entry.wrapper.style.height = `${screen.height}px`

    const interactive = screen.type === 'topic'
    const panel = document.createElement(interactive ? 'button' : 'article')
    panel.className = `screen-universe-satellite is-${screen.type}`
    if (interactive) {
      const topicColor = getTopicColor ? getTopicColor(screen.label) : 'var(--home-ink)'
      panel.style.setProperty('--topic-color', topicColor)
    }
    panel.setAttribute(
      'aria-label',
      screen.type === 'image'
        ? `图片：${screen.alt}`
        : interactive
          ? `${screen.label}，点击选择该选题`
          : screen.label
            ? `文字屏：${screen.label}`
            : '空白屏幕',
    )

    if (interactive) {
      panel.type = 'button'
      panel.setAttribute('aria-pressed', String(getActiveTopic?.() === screen.label))
      panel.addEventListener('click', (event) => {
        event.stopPropagation()
        if (performance.now() < suppressClickUntil) {
          event.preventDefault()
          return
        }
        if (onSelectTopic) onSelectTopic(screen.label)
      })
    }

    const frame = document.createElement('span')
    frame.className = 'screen-universe-frame'
    if (screen.type === 'image') {
      const image = document.createElement('img')
      image.src = screen.src
      image.alt = screen.alt
      image.loading = 'lazy'
      image.decoding = 'async'
      image.draggable = false
      image.addEventListener('error', () => handleImageError(entry, screen), { once: true })
      image.addEventListener('load', () => handleImageLoad(entry, screen, image), { once: true })
      frame.appendChild(image)
    } else if (screen.label) {
      frame.appendChild(createSignalContent(screen.label))
    }

    panel.appendChild(frame)
    panel.addEventListener('pointerenter', () => setPanelRaised(entry, true))
    panel.addEventListener('pointerleave', () => setPanelRaised(entry, false))
    panel.addEventListener('focusin', () => setPanelRaised(entry, true))
    panel.addEventListener('focusout', () => setPanelRaised(entry, false))
    entry.wrapper.appendChild(panel)
    entry.itemId = screen.id
    entry.screen = screen
    entry.panel = panel
    entry.object.visible = true
    panelByItemId.set(screen.id, entry)
  }

  function createPanelPool() {
    if (!scene || !CSS3DObject) return
    panelPool = Array.from({ length: SCREEN_UNIVERSE_MAX_VISIBLE }, () => {
      const wrapper = document.createElement('div')
      wrapper.className = 'screen-universe-object'
      const object = new CSS3DObject(wrapper)
      object.visible = false
      scene.add(object)
      return {
        wrapper,
        object,
        itemId: '',
        screen: null,
        panel: null,
        raised: false,
        currentPosition: null,
        targetPosition: null,
      }
    })
  }

  function sceneProjection() {
    return {
      fov: CAMERA_FOV,
      aspect: camera?.aspect || 1,
    }
  }

  function visibleScreenTargets() {
    if (!THREE || !camera || isPortraitPhone?.() || isScreenExpanded?.()) return []
    rotationEuler.set(pitch + swayPitch, yaw + swayYaw, 0, 'YXZ')
    rotationQuaternion.setFromEuler(rotationEuler)
    const projection = sceneProjection()

    const candidates = sphereLayout.flatMap((screen, index) => {
      const existingEntry = panelByItemId.get(screen.id)
      const radius = screen.radius - (existingEntry?.raised ? 26 : 0)
      const point = new THREE.Vector3(
        screen.direction.x,
        screen.direction.y,
        screen.direction.z,
      ).applyQuaternion(rotationQuaternion).multiplyScalar(radius)
      // 只保留面向观看者的前半圈（约 ±87°）：柱面后半圈会在投影里折返，堆叠在舞台边缘。
      const frontness = -point.z / radius
      if (frontness < 0.06) return []
      const projected = projectPoint(point, projection)
      if (!projected) return []
      const halfSize = projectScreenHalfSize(screen, point, projection)
      return [{
        index,
        screen,
        point,
        projected,
        halfSize,
        radius,
        frontness,
      }]
    })

    const visible = selectVisibleScreens(candidates)
    // 不做中央避让：屏幕可自然从中央屏后方滑过，交互更顺滑。
    return resolveProjectedScreens(visible, null, PANEL_GAP_NDC, 8)
      .map((candidate) => ({
        ...candidate,
        target: unprojectToSphere(candidate.projected, candidate.radius, projection),
      }))
  }

  function acquirePanel(screen) {
    const existing = panelByItemId.get(screen.id)
    if (existing) return existing
    const available = panelPool.find((entry) => !entry.itemId)
    if (!available) return null
    bindPanel(available, screen)
    return available
  }

  function syncVisiblePanels(deltaTime) {
    const targets = visibleScreenTargets()
    const visibleIds = new Set(targets.map((target) => target.screen.id))
    panelPool.forEach((entry) => {
      if (entry.itemId && !visibleIds.has(entry.itemId)) releasePanel(entry)
    })

    let needsSettling = false
    const dragging = getIsDragging?.() || false
    const reduced = isReducedMotion?.() || false
    const smoothing = reduced
      ? 1
      : 1 - Math.exp(-Math.max(1, deltaTime) / (dragging ? 72 : 150))
    // 悬停某块屏幕时，其余屏幕压暗（参考站的 Raycaster hover 逻辑）。
    const anyRaised = panelPool.some((entry) => entry.raised && entry.itemId)

    targets.forEach((target) => {
      const entry = acquirePanel(target.screen)
      if (!entry) return
      const targetPosition = new THREE.Vector3(target.target.x, target.target.y, target.target.z)
      entry.targetPosition = targetPosition
      if (!entry.currentPosition) entry.currentPosition = targetPosition.clone()
      const distance = entry.currentPosition.distanceTo(targetPosition)
      entry.currentPosition.lerp(targetPosition, smoothing)
      entry.object.position.copy(entry.currentPosition)
      // 卡片直立朝向观看者：只绕 Y 轴转向，目标点与自身同高，不随高度俯仰。
      lookTarget.set(0, entry.object.position.y, 0)
      entry.object.lookAt(lookTarget)
      entry.object.visible = true

      const isImageScreen = target.screen.type === 'image'
      const isTopicScreen = target.screen.type === 'topic'
      const dimFactor = anyRaised && !entry.raised ? 0.32 : 1
      // 深度层次：越靠弧面边缘（frontness 越低）越透明、越灰、越淡。
      const frontness = clamp(target.frontness, 0, 1)
      const angleOpacity = (isTopicScreen
        ? clamp(0.5 + frontness * 0.48, 0.5, 0.98)
        : clamp(0.3 + frontness * 0.68, 0.3, 0.98)) * dimFactor
      const gray = isTopicScreen
        ? (1 - frontness) * 0.25
        : isImageScreen
          ? (1 - frontness) * 0.55
          : 0.1 + (1 - frontness) * 0.5
      const saturation = isImageScreen
        ? 0.72 + frontness * 0.28
        : isTopicScreen
          ? 0.8 + frontness * 0.2
          : 0.6
      entry.panel?.style.setProperty('--screen-opacity', angleOpacity.toFixed(3))
      entry.panel?.style.setProperty('--screen-gray', gray.toFixed(3))
      entry.panel?.style.setProperty('--screen-saturation', saturation.toFixed(3))
      if (distance > 0.35 && !reduced) needsSettling = true
    })

    return needsSettling
  }

  function renderUniverse(timestamp = performance.now()) {
    animationFrame = 0
    if (!renderer || !scene || !camera || disposed) return
    const deltaTime = lastFrameTime ? Math.min(34, timestamp - lastFrameTime) : 16
    lastFrameTime = timestamp

    const dragging = getIsDragging?.() || false
    const reduced = isReducedMotion?.() || false

    let inertiaActive = false
    if (!dragging && !reduced) {
      if (Math.abs(yawVelocity) > 0.000015 || Math.abs(pitchVelocity) > 0.000015) {
        const limits = rotationLimits()
        yaw = clamp(yaw + yawVelocity * deltaTime, -limits.yaw, limits.yaw)
        pitch = clamp(pitch + pitchVelocity * deltaTime, -limits.pitch, limits.pitch)
        const damping = Math.exp(-deltaTime / 145)
        yawVelocity *= damping
        pitchVelocity *= damping
        inertiaActive = true
      } else {
        yawVelocity = 0
        pitchVelocity = 0
      }
    }

    const needsSettling = syncVisiblePanels(deltaTime)

    // 鼠标跟随视角：指针在舞台上的位置直接映射为视角目标，缓动追随（参考站的 camera sway）。
    const swayLerp = reduced ? 1 : 1 - Math.exp(-deltaTime / 260)
    swayYaw += (swayTargetYaw - swayYaw) * swayLerp
    swayPitch += (swayTargetPitch - swayPitch) * swayLerp
    const swayActive = Math.abs(swayTargetYaw - swayYaw) > 0.00002
      || Math.abs(swayTargetPitch - swayPitch) > 0.00002

    // 视角速度驱动轻微 skew，近似参考站顶点 shader 的“帆布弯曲”感。
    const skew = reduced
      ? 0
      : clamp(-yawVelocity * 1400 + (swayTargetYaw - swayYaw) * 2.4, -5, 5)
    rendererHost?.style.setProperty('--drag-skew', `${skew.toFixed(2)}deg`)

    renderer.render(scene, camera)
    if (inertiaActive || needsSettling || swayActive) requestUniverseRender()
  }

  function requestUniverseRender() {
    if (!renderer || animationFrame || disposed) return
    animationFrame = window.requestAnimationFrame(renderUniverse)
  }

  function resizeUniverse() {
    const rect = stageElement?.getBoundingClientRect()
    if (!renderer || !camera || !rect?.width || !rect.height) return
    renderer.setSize(rect.width, rect.height)
    camera.aspect = rect.width / rect.height
    camera.updateProjectionMatrix()
    lastFrameTime = 0
    requestUniverseRender()
  }

  function rebuildSphereLayout({ keyword, keywords, imageLibrary, textLibrary }) {
    if (!keyword) {
      // 静默状态：不显示任何子屏，中央屏铺满舞台。
      sphereLayout = []
      yaw = 0
      pitch = 0
      yawVelocity = 0
      pitchVelocity = 0
      releaseAllPanels()
      requestUniverseRender()
      return
    }

    const items = createScreenItems({
      keyword,
      keywords,
      imageLibrary,
      textLibrary,
    })
    sphereLayout = createScreenLayout(items, keyword)
    // 每次进入选题都从正面开始环顾。
    yaw = 0
    pitch = 0
    yawVelocity = 0
    pitchVelocity = 0
    releaseAllPanels()
    requestUniverseRender()
  }

  async function initialize(host, stage, centralRef) {
    rendererHost = host
    stageElement = stage
    centralScreenElement = centralRef

    const [threeModule, cssRendererModule] = await Promise.all([
      import('three'),
      import('three/addons/renderers/CSS3DRenderer.js'),
    ])
    if (disposed || !rendererHost) return

    THREE = threeModule
    CSS3DObject = cssRendererModule.CSS3DObject
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 1, 3200)
    camera.position.set(0, 0, 0)
    camera.lookAt(0, 0, -1)
    lookTarget = new THREE.Vector3(0, 0, 0)
    rotationEuler = new THREE.Euler(0, 0, 0, 'YXZ')
    rotationQuaternion = new THREE.Quaternion()

    renderer = new cssRendererModule.CSS3DRenderer()
    renderer.domElement.className = 'screen-universe-css3d'
    renderer.domElement.setAttribute('aria-label', '球面屏幕场景')
    rendererHost.appendChild(renderer.domElement)
    createPanelPool()
    resizeUniverse()
  }

  function rotateBy(deltaYaw, deltaPitch) {
    const limits = rotationLimits()
    yaw = clamp(yaw + deltaYaw, -limits.yaw, limits.yaw)
    pitch = clamp(pitch + deltaPitch, -limits.pitch, limits.pitch)
  }

  function setVelocities(yVel, pVel) {
    yawVelocity = yVel
    pitchVelocity = pVel
  }

  function stopInertia() {
    yawVelocity = 0
    pitchVelocity = 0
  }

  function stepKeyboard(key) {
    const step = (12 * Math.PI) / 180
    stopInertia()
    const limits = rotationLimits()
    if (key === 'ArrowLeft') yaw = clamp(yaw + step, -limits.yaw, limits.yaw)
    if (key === 'ArrowRight') yaw = clamp(yaw - step, -limits.yaw, limits.yaw)
    if (key === 'ArrowUp') pitch = clamp(pitch + step, -limits.pitch, limits.pitch)
    if (key === 'ArrowDown') pitch = clamp(pitch - step, -limits.pitch, limits.pitch)
    requestUniverseRender()
  }

  function updateSwayTarget(clientX, clientY) {
    if (!getActiveTopic?.() || isReducedMotion?.() || isPortraitPhone?.() || isScreenExpanded?.()) return
    const rect = stageElement?.getBoundingClientRect()
    if (!rect?.width || !rect.height) return
    // 桌面端不再需要按住拖拽：鼠标在舞台上的归一化位置直接映射为环顾目标角度。
    // 视线跟随鼠标：鼠标向右，视线转向柱面右侧内容（画面内容相对左移）。
    const nx = clamp(((clientX - rect.left) / rect.width - 0.5) * 2, -1, 1)
    const ny = clamp(((clientY - rect.top) / rect.height - 0.5) * 2, -1, 1)
    swayTargetYaw = nx * SWAY_YAW_LIMIT
    swayTargetPitch = ny * ACTIVE_PITCH_LIMIT
    requestUniverseRender()
  }

  function resetSwayTarget() {
    if (!swayTargetYaw && !swayTargetPitch) return
    swayTargetYaw = 0
    swayTargetPitch = 0
    requestUniverseRender()
  }

  function setSuppressClickUntil(timestamp) {
    suppressClickUntil = timestamp
  }

  function isClickSuppressed() {
    return performance.now() < suppressClickUntil
  }

  function destroy() {
    disposed = true
    if (animationFrame) window.cancelAnimationFrame(animationFrame)
    releaseAllPanels()
    renderer?.domElement.remove()
    scene?.clear()
    rendererHost = null
    stageElement = null
    centralScreenElement = null
  }

  return {
    initialize,
    destroy,
    requestUniverseRender,
    resizeUniverse,
    rebuildSphereLayout,
    rotateBy,
    setVelocities,
    stopInertia,
    stepKeyboard,
    updateSwayTarget,
    resetSwayTarget,
    setSuppressClickUntil,
    isClickSuppressed,
  }
}
