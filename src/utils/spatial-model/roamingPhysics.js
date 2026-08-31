/**
 * 三维模型物理碰撞与第一人称漫游引擎
 * 负责射线碰撞检测、水平防穿墙、楼梯自动攀爬、第一人称按键移动与鼠标视角转向
 */

import {
  PLAYER_EYE_HEIGHT,
  PLAYER_RADIUS,
  MAX_STEP_HEIGHT,
  MAX_DROP_HEIGHT,
} from '../../data/spatial/modelConfig.js'
import { isNavigationMesh } from './materials.js'
import { isModelNodeVisible } from './modelLoader.js'

export function rebuildCollisionMeshes(model, collisionRaycaster) {
  const collisionMeshes = []
  if (!model || !collisionRaycaster) return collisionMeshes
  model.updateMatrixWorld(true)
  model.traverse((node) => {
    if (!node.isMesh || isNavigationMesh(node) || !isModelNodeVisible(node, model)) return
    const materials = Array.isArray(node.material) ? node.material : [node.material]
    const isMostlyTransparent = materials.length > 0 && materials.every((material) => (
      Boolean(material?.transparent) && Number(material.opacity ?? 1) < 0.85
    ))
    if (!isMostlyTransparent) {
      if (!node.geometry.boundingBox) node.geometry.computeBoundingBox()
      collisionMeshes.push(node)
    }
  })
  return collisionMeshes
}

export function hitAlongRay(collisionRaycaster, collisionMeshes, origin, direction, distance, arcticGround) {
  if (!collisionRaycaster || !collisionMeshes?.length) return null
  collisionRaycaster.set(origin, direction)
  collisionRaycaster.far = Math.max(distance, 0.001)

  // 阶段 1：AABB 包围盒快速粗筛 (Broad-phase)
  const candidateMeshes = []
  const ray = collisionRaycaster.ray
  for (let i = 0; i < collisionMeshes.length; i++) {
    const mesh = collisionMeshes[i]
    if (mesh === arcticGround) continue
    // 如果已有 boundingBox，先做快速射线相交判断
    if (mesh.geometry?.boundingBox) {
      if (!mesh.userData.cachedWorldBox) {
        mesh.userData.cachedWorldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld)
      }
      if (!ray.intersectsBox(mesh.userData.cachedWorldBox)) {
        continue
      }
    }
    candidateMeshes.push(mesh)
  }

  if (!candidateMeshes.length) {
    collisionRaycaster.far = Infinity
    return null
  }

  // 阶段 2：仅对相交的候选 Mesh 做精细三角形求交 (Narrow-phase)
  const hit = collisionRaycaster.intersectObjects(candidateMeshes, false).find((item) => (
    item.distance > 0.01 && item.object !== arcticGround
  ))
  collisionRaycaster.far = Infinity
  return hit || null
}

export function worldNormalForHit(hit, THREE) {
  if (!hit?.face?.normal || !hit.object) return new THREE.Vector3(0, 1, 0)
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld)
  return hit.face.normal.clone().applyMatrix3(normalMatrix).normalize()
}

export function horizontalPathBlocked({
  position,
  movement,
  collisionRaycaster,
  collisionMeshes,
  arcticGround,
  THREE,
}) {
  const distance = Math.hypot(movement.x, movement.z)
  if (!distance) return false
  const direction = new THREE.Vector3(movement.x, 0, movement.z).normalize()
  const side = new THREE.Vector3(-direction.z, 0, direction.x)
  // 精简采样点：中心与左右微偏 + 2个关键高度（腰部与膝盖），从 9 次降至 4 次
  const offsets = [0, PLAYER_RADIUS * 0.75, -PLAYER_RADIUS * 0.75]
  const heights = [-0.3, -PLAYER_EYE_HEIGHT + 0.28]
  return heights.some((height) => offsets.some((offset) => {
    const origin = position.clone()
      .addScaledVector(side, offset)
      .add(new THREE.Vector3(0, height, 0))
    const hit = hitAlongRay(collisionRaycaster, collisionMeshes, origin, direction, distance + PLAYER_RADIUS, arcticGround)
    return Boolean(hit && worldNormalForHit(hit, THREE).y < 0.78)
  }))
}

export function walkableFloorAt({
  x,
  z,
  currentFloorY,
  collisionRaycaster,
  collisionMeshes,
  THREE,
}) {
  if (!collisionRaycaster || !collisionMeshes?.length) return null
  const startY = currentFloorY + PLAYER_EYE_HEIGHT + MAX_STEP_HEIGHT + 0.35
  const lowestY = currentFloorY - MAX_DROP_HEIGHT
  const origin = new THREE.Vector3(x, startY, z)
  const direction = new THREE.Vector3(0, -1, 0)
  collisionRaycaster.set(origin, direction)
  collisionRaycaster.far = Math.max(startY - lowestY, 0.1)
  const floor = collisionRaycaster.intersectObjects(collisionMeshes, true)
    .filter((hit) => (
      hit.point.y >= lowestY - 0.05
      && hit.point.y <= currentFloorY + MAX_STEP_HEIGHT + 0.05
      && worldNormalForHit(hit, THREE).y > 0.55
    ))
    .sort((a, b) => b.point.y - a.point.y)[0]
  collisionRaycaster.far = Infinity
  return floor?.point.y ?? null
}

export function stairFloorAt({
  position,
  movement,
  collisionRaycaster,
  collisionMeshes,
  THREE,
}) {
  const currentFloorY = position.y - PLAYER_EYE_HEIGHT
  const floorY = walkableFloorAt({
    x: position.x + movement.x,
    z: position.z + movement.z,
    currentFloorY,
    collisionRaycaster,
    collisionMeshes,
    THREE,
  })
  if (floorY === null || floorY <= currentFloorY + 0.025) return null
  if (floorY > currentFloorY + MAX_STEP_HEIGHT + 0.05) return null
  return floorY
}

export function safeVerticalDelta({
  position,
  intendedDelta,
  collisionRaycaster,
  collisionMeshes,
  arcticGround,
  THREE,
}) {
  if (!intendedDelta) return 0
  const direction = new THREE.Vector3(0, Math.sign(intendedDelta), 0)
  const origin = position.clone()
  origin.y += intendedDelta > 0 ? 0.16 : -PLAYER_EYE_HEIGHT + 0.12
  const hit = hitAlongRay(collisionRaycaster, collisionMeshes, origin, direction, Math.abs(intendedDelta) + 0.08, arcticGround)
  if (!hit) return intendedDelta
  return Math.sign(intendedDelta) * Math.max(0, hit.distance - 0.08)
}

export function stepFreeFlight({
  delta,
  perspectiveCamera,
  pressedKeys,
  collisionRaycaster,
  collisionMeshes,
  arcticGround,
  THREE,
  onPositionChanged,
}) {
  if (!perspectiveCamera || !THREE) return false
  const speed = 8 * Math.min(delta, 0.05)
  const forward = perspectiveCamera.getWorldDirection(new THREE.Vector3())
  forward.y = 0
  forward.normalize()
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()
  const movement = new THREE.Vector3()

  if (pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp')) movement.add(forward)
  if (pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown')) movement.sub(forward)
  if (pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight')) movement.add(right)
  if (pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft')) movement.sub(right)
  if (pressedKeys.has('KeyQ')) movement.y += 1
  if (pressedKeys.has('KeyE')) movement.y -= 1
  if (!movement.lengthSq()) return false

  const intendedMove = movement.normalize().multiplyScalar(speed)
  const nextPosition = perspectiveCamera.position.clone()
  const horizontalMove = new THREE.Vector3(intendedMove.x, 0, intendedMove.z)
  const hasVerticalInput = Boolean(intendedMove.y)
  const currentFloorY = perspectiveCamera.position.y - PLAYER_EYE_HEIGHT

  if (horizontalMove.lengthSq()) {
    // 快速直行路径：优先检测合位移向量是否通畅
    const directStepFloor = stairFloorAt({ position: nextPosition, movement: horizontalMove, collisionRaycaster, collisionMeshes, THREE })
    const directBlocked = horizontalPathBlocked({ position: nextPosition, movement: horizontalMove, collisionRaycaster, collisionMeshes, arcticGround, THREE })

    if (!directBlocked || directStepFloor !== null) {
      nextPosition.x += horizontalMove.x
      nextPosition.z += horizontalMove.z
      if (directStepFloor !== null) {
        nextPosition.y = directStepFloor + PLAYER_EYE_HEIGHT
      }
    } else {
      // 贴墙滑动路径：合位移阻挡时，分解为 X 与 Z 分轴滑动
      const xMove = new THREE.Vector3(horizontalMove.x, 0, 0)
      const zMove = new THREE.Vector3(0, 0, horizontalMove.z)
      if (xMove.lengthSq()) {
        const stepFloor = stairFloorAt({ position: nextPosition, movement: xMove, collisionRaycaster, collisionMeshes, THREE })
        if (!horizontalPathBlocked({ position: nextPosition, movement: xMove, collisionRaycaster, collisionMeshes, arcticGround, THREE }) || stepFloor !== null) {
          nextPosition.x += xMove.x
          if (stepFloor !== null) nextPosition.y = stepFloor + PLAYER_EYE_HEIGHT
        }
      }
      if (zMove.lengthSq()) {
        const stepFloor = stairFloorAt({ position: nextPosition, movement: zMove, collisionRaycaster, collisionMeshes, THREE })
        if (!horizontalPathBlocked({ position: nextPosition, movement: zMove, collisionRaycaster, collisionMeshes, arcticGround, THREE }) || stepFloor !== null) {
          nextPosition.z += zMove.z
          if (stepFloor !== null) nextPosition.y = stepFloor + PLAYER_EYE_HEIGHT
        }
      }
    }

    if (!hasVerticalInput) {
      const floorY = walkableFloorAt({ x: nextPosition.x, z: nextPosition.z, currentFloorY, collisionRaycaster, collisionMeshes, THREE })
      if (floorY !== null) {
        nextPosition.y = floorY + PLAYER_EYE_HEIGHT
      }
    }
  }

  if (hasVerticalInput) {
    nextPosition.y += safeVerticalDelta({ position: nextPosition, intendedDelta: intendedMove.y, collisionRaycaster, collisionMeshes, arcticGround, THREE })
  }

  if (nextPosition.distanceToSquared(perspectiveCamera.position) < 0.000001) return false
  perspectiveCamera.position.copy(nextPosition)
  onPositionChanged?.()
  return true
}

export function applyPointerRotation({
  perspectiveCamera,
  movementX,
  movementY,
  THREE,
}) {
  if (!perspectiveCamera || !THREE) return
  const yaw = perspectiveCamera.rotation.y - movementX * 0.0024
  const pitch = THREE.MathUtils.clamp(perspectiveCamera.rotation.x - movementY * 0.0024, -Math.PI / 2.05, Math.PI / 2.05)
  perspectiveCamera.rotation.order = 'YXZ'
  perspectiveCamera.rotation.set(pitch, yaw, 0)
}
