/**
 * 三维舞台与渲染引擎 Composable
 * 负责 Three.js 核心上下文 (Scene, Renderer, Cameras, Lights, Controls, TransitionManager)
 * 以及 ResizeObserver、动态 DPR 调度、RAF 渲染循环
 */
import { onBeforeUnmount, ref } from 'vue'
import { createSpatialLights, applyArcticSceneSettings, configureArchitecturalLighting, disposeSpatialLights } from '../../../utils/spatial-model/lighting.js'
import { createCameraTransitionManager, updateOrthoFrustum } from '../../../utils/spatial-model/cameraController.js'
import { calculateModelMetrics } from '../../../utils/spatial-model/modelLoader.js'

export function useSpatialModelStage({ stageRef, arcticMode }) {
  let THREE = null
  let GLTFLoader = null
  let OrbitControls = null
  let mergeGeometries = null

  let renderer = null
  let scene = null
  let orthoCamera = null
  let perspectiveCamera = null
  let activeCamera = null
  let controls = null
  let lights = null
  let transitionManager = null
  let resizeObserver = null
  let animationFrame = null
  let lastFrameTime = performance.now()
  let renderingActive = false

  let modelBounds = null
  let modelCenter = null
  let modelSize = null

  let currentDpr = 1.5
  let targetStaticDpr = 1.5
  let dprRestoreTimer = null

  const immersiveReady = ref(false)

  function updateStaticDpr() {
    if (typeof window !== 'undefined') {
      targetStaticDpr = Math.min(window.devicePixelRatio || 1, 1.5)
    }
  }

  function enterActiveMotionDpr() {
    if (!renderer) return
    if (dprRestoreTimer) {
      clearTimeout(dprRestoreTimer)
      dprRestoreTimer = null
    }
    if (currentDpr !== 1.0) {
      currentDpr = 1.0
      renderer.setPixelRatio(1.0)
    }
  }

  function scheduleRestoreStaticDpr(isInputActive = false) {
    if (dprRestoreTimer) clearTimeout(dprRestoreTimer)
    dprRestoreTimer = setTimeout(() => {
      if (!isInputActive && currentDpr !== targetStaticDpr && renderer) {
        currentDpr = targetStaticDpr
        renderer.setPixelRatio(targetStaticDpr)
        requestRender()
      }
    }, 140)
  }

  function requestRender() {
    if (!renderingActive || animationFrame) return
    animationFrame = requestAnimationFrame(render)
  }

  function requestShadowUpdate() {
    if (renderer) renderer.shadowMap.needsUpdate = true
  }

  let renderStepHook = null
  function setRenderStepHook(hook) {
    renderStepHook = hook
  }

  function render(now = performance.now()) {
    animationFrame = null
    if (!renderingActive) return
    const delta = Math.max(0, Math.min((now - lastFrameTime) / 1000, 0.05))
    lastFrameTime = now

    let shouldKeepLooping = false
    if (renderStepHook) {
      shouldKeepLooping = renderStepHook(delta)
    }

    controls?.update()
    if (scene && activeCamera && renderer) {
      renderer.render(scene, activeCamera)
    }

    if (shouldKeepLooping) {
      requestRender()
    }
  }

  function startRendering() {
    if (renderingActive || !renderer) return
    renderingActive = true
    lastFrameTime = performance.now()
    requestRender()
  }

  function stopRendering() {
    renderingActive = false
    if (animationFrame) cancelAnimationFrame(animationFrame)
    animationFrame = null
  }

  function resizeRenderer() {
    if (!stageRef.value || !renderer) return
    const { width, height } = stageRef.value.getBoundingClientRect()
    if (!width || !height) return
    updateStaticDpr()
    renderer.setSize(width, height, false)
    renderer.setPixelRatio(currentDpr)
    if (perspectiveCamera) {
      perspectiveCamera.aspect = width / height
      perspectiveCamera.updateProjectionMatrix()
    }
    if (orthoCamera && transitionManager) {
      updateOrthoFrustum(orthoCamera, renderer, transitionManager.getOrthoFrameSize())
    }
    requestRender()
  }

  function updateSceneMetrics(model) {
    if (!THREE || !model) return
    const metrics = calculateModelMetrics(THREE, model)
    if (!metrics) return
    modelBounds = metrics.bounds
    modelCenter = metrics.center
    modelSize = metrics.size
    configureArchitecturalLighting({ lights, renderer, modelCenter, modelSize, THREE })
    applyArcticSceneSettings({ lights, scene, renderer, arcticMode: arcticMode.value, modelBounds })
    requestShadowUpdate()
  }

  async function initStage() {
    const [threeModule, loaderModule, controlsModule, geometryUtilsModule] = await Promise.all([
      import('three'),
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/controls/OrbitControls.js'),
      import('three/examples/jsm/utils/BufferGeometryUtils.js'),
    ])
    THREE = threeModule
    GLTFLoader = loaderModule.GLTFLoader
    OrbitControls = controlsModule.OrbitControls
    mergeGeometries = geometryUtilsModule.mergeGeometries

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf1efe9)
    orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 5000)
    perspectiveCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 5000)
    perspectiveCamera.rotation.order = 'YXZ'
    activeCamera = orthoCamera

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.16
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.shadowMap.autoUpdate = false
    renderer.shadowMap.needsUpdate = true
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.tabIndex = 0
    renderer.domElement.setAttribute('aria-label', '场地三维模型')

    if (stageRef.value) {
      stageRef.value.appendChild(renderer.domElement)
    }

    controls = new OrbitControls(orthoCamera, renderer.domElement)
    controls.enableDamping = false
    controls.maxPolarAngle = Math.PI * 0.49
    controls.minZoom = 0.45
    controls.maxZoom = 4.5
    controls.minDistance = 1
    controls.maxDistance = 2500
    controls.addEventListener('change', requestRender)

    lights = createSpatialLights(THREE, scene, arcticMode.value)
    applyArcticSceneSettings({ lights, scene, renderer, arcticMode: arcticMode.value, modelBounds })

    transitionManager = createCameraTransitionManager({
      getOrthoCamera: () => orthoCamera,
      getPerspectiveCamera: () => perspectiveCamera,
      getControls: () => controls,
      onRequestRender: requestRender,
      onImmersiveReady: (ready) => {
        immersiveReady.value = ready
      },
    })

    if (stageRef.value) {
      resizeObserver = new ResizeObserver(resizeRenderer)
      resizeObserver.observe(stageRef.value)
      resizeRenderer()
    }
    startRendering()

    return { THREE, GLTFLoader, OrbitControls, mergeGeometries }
  }

  onBeforeUnmount(() => {
    if (dprRestoreTimer) clearTimeout(dprRestoreTimer)
    stopRendering()
    transitionManager?.stopCameraAnimation()
    resizeObserver?.disconnect()
    if (lights && scene) {
      disposeSpatialLights(lights, scene)
    }
    if (renderer) {
      renderer.dispose?.()
      renderer.domElement?.remove?.()
    }
  })

  return {
    getTHREE: () => THREE,
    getGLTFLoader: () => GLTFLoader,
    getMergeGeometries: () => mergeGeometries,
    getRenderer: () => renderer,
    getScene: () => scene,
    getOrthoCamera: () => orthoCamera,
    getPerspectiveCamera: () => perspectiveCamera,
    getActiveCamera: () => activeCamera,
    setActiveCamera: (cam) => { activeCamera = cam },
    getControls: () => controls,
    getLights: () => lights,
    getTransitionManager: () => transitionManager,
    getModelBounds: () => modelBounds,
    getModelCenter: () => modelCenter,
    getModelSize: () => modelSize,
    immersiveReady,
    initStage,
    startRendering,
    stopRendering,
    requestRender,
    requestShadowUpdate,
    resizeRenderer,
    enterActiveMotionDpr,
    scheduleRestoreStaticDpr,
    updateSceneMetrics,
    setRenderStepHook,
  }
}
