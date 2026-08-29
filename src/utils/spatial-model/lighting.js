/**
 * 三维模型光照与环境系统
 * 负责场景灯光初始化、常规/极地光照参数切换、阴影相机自适应与资源释放
 */

export function createSpatialLights(THREE, scene, arcticMode = false) {
  const hemisphereLight = new THREE.HemisphereLight(0xe9f1ff, 0x4e4b46, 0.72)
  scene.add(hemisphereLight)

  const ambientLight = new THREE.AmbientLight(0xfff8ee, 0.22)
  scene.add(ambientLight)

  const keyLight = new THREE.DirectionalLight(0xfff0da, 2.25)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(1024, 1024)
  keyLight.shadow.radius = 2.8
  keyLight.shadow.bias = -0.00015
  keyLight.shadow.normalBias = 0.018
  scene.add(keyLight)
  scene.add(keyLight.target)

  const fillLight = new THREE.DirectionalLight(0xd8e7f1, 0.34)
  scene.add(fillLight)
  scene.add(fillLight.target)

  const arcticGround = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshStandardMaterial({ color: 0xe4e5e1, roughness: 1 }),
  )
  arcticGround.rotation.x = -Math.PI / 2
  arcticGround.receiveShadow = true
  arcticGround.visible = Boolean(arcticMode)
  scene.add(arcticGround)

  return {
    hemisphereLight,
    ambientLight,
    keyLight,
    fillLight,
    arcticGround,
  }
}

export function applyArcticSceneSettings({
  lights,
  scene,
  renderer,
  arcticMode,
  modelBounds,
}) {
  if (!scene || !renderer || !lights) return
  const { hemisphereLight, ambientLight, keyLight, fillLight, arcticGround } = lights

  if (arcticMode) {
    scene.background.set(0xf7f7f3)
    hemisphereLight?.color.set(0xf8fbff)
    hemisphereLight?.groundColor.set(0xe5e8e5)
    if (hemisphereLight) hemisphereLight.intensity = 0.88
    ambientLight?.color.set(0xf7faf7)
    if (ambientLight) ambientLight.intensity = 0.42
    keyLight?.color.set(0xffffff)
    if (keyLight) {
      keyLight.intensity = 2.05
      keyLight.shadow.radius = 3.8
    }
    fillLight?.color.set(0xdfe8f0)
    if (fillLight) fillLight.intensity = 0.42
    renderer.toneMappingExposure = 1.24
    if (arcticGround) {
      arcticGround.visible = true
      arcticGround.position.y = (modelBounds?.min?.y || 0) - 0.025
      arcticGround.material.color.set(0xe4e5e1)
    }
  } else {
    scene.background.set(0xf1efe9)
    hemisphereLight?.color.set(0xe9f1ff)
    hemisphereLight?.groundColor.set(0x4e4b46)
    if (hemisphereLight) hemisphereLight.intensity = 0.72
    ambientLight?.color.set(0xfff8ee)
    if (ambientLight) ambientLight.intensity = 0.22
    keyLight?.color.set(0xfff0da)
    if (keyLight) {
      keyLight.intensity = 2.25
      keyLight.shadow.radius = 2.8
    }
    fillLight?.color.set(0xd8e7f1)
    if (fillLight) fillLight.intensity = 0.34
    renderer.toneMappingExposure = 1.16
    if (arcticGround) arcticGround.visible = false
  }
  renderer.shadowMap.needsUpdate = true
}

export function configureArchitecturalLighting({
  lights,
  renderer,
  modelCenter,
  modelSize,
  THREE,
}) {
  if (!modelCenter || !modelSize || !lights?.keyLight || !lights?.fillLight || !THREE) return
  const { keyLight, fillLight } = lights
  const span = Math.max(modelSize.x, modelSize.z)
  const shadowExtent = span * 0.76

  keyLight.position.copy(modelCenter).add(new THREE.Vector3(
    modelSize.x * 0.56,
    span * 1.12,
    modelSize.z * 0.46,
  ))
  keyLight.target.position.copy(modelCenter)
  keyLight.shadow.camera.left = -shadowExtent
  keyLight.shadow.camera.right = shadowExtent
  keyLight.shadow.camera.top = shadowExtent
  keyLight.shadow.camera.bottom = -shadowExtent
  keyLight.shadow.camera.near = 1
  keyLight.shadow.camera.far = span * 3.6
  keyLight.shadow.camera.updateProjectionMatrix()
  keyLight.shadow.needsUpdate = true

  fillLight.position.copy(modelCenter).add(new THREE.Vector3(
    -modelSize.x * 0.38,
    span * 0.42,
    -modelSize.z * 0.72,
  ))
  fillLight.target.position.copy(modelCenter)
  if (renderer) renderer.shadowMap.needsUpdate = true
}

export function disposeSpatialLights(lights) {
  if (!lights) return
  lights.arcticGround?.geometry?.dispose()
  lights.arcticGround?.material?.dispose()
}
