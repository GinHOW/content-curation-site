/**
 * 三维模型分层加载与几何合批系统
 * 负责静态几何合批 (BufferGeometryUtils)、分层 GLB 节点索引、阴影配置与包围盒度量
 */

import { STATIC_BATCH_ROOTS, DEBUG_LAYER_DEFINITIONS } from '../../data/spatial/modelConfig.js'
import {
  categoryForMaterial,
  createArchitecturalMaterial,
  isNavigationMesh,
} from './materials.js'

export function boxFor(THREE, object) {
  return new THREE.Box3().setFromObject(object)
}

export function normalizedNodeName(name) {
  return String(name || '').toLowerCase().replace(/[\s_-]+/g, '')
}

export function indexDebugLayerNodes(assetScene, assetKey, debugLayerNodes) {
  const layers = DEBUG_LAYER_DEFINITIONS.filter((layer) => layer.assetKey === assetKey)
  const nodeIdsByName = new Map()
  layers.forEach((layer) => {
    layer.nodeNames.forEach((nodeName) => {
      const normalizedName = normalizedNodeName(nodeName)
      const ids = nodeIdsByName.get(normalizedName) || []
      ids.push(layer.id)
      nodeIdsByName.set(normalizedName, ids)
    })
    debugLayerNodes.set(layer.id, [])
  })
  assetScene.traverse((node) => {
    const layerIds = nodeIdsByName.get(normalizedNodeName(node.name)) || []
    layerIds.forEach((layerId) => {
      debugLayerNodes.get(layerId).push(node)
    })
  })
}

function createBatchGeometry(mesh, rootInverse) {
  const sourceGeometry = mesh.geometry
  if (!sourceGeometry?.getAttribute('position')) return null
  let geometry = sourceGeometry.clone()
  if (geometry.index) {
    const nonIndexedGeometry = geometry.toNonIndexed()
    geometry.dispose()
    geometry = nonIndexedGeometry
  }
  geometry.applyMatrix4(rootInverse.clone().multiply(mesh.matrixWorld))
  Object.keys(geometry.attributes).forEach((attributeName) => {
    if (attributeName !== 'position' && attributeName !== 'normal') geometry.deleteAttribute(attributeName)
  })
  if (!geometry.getAttribute('normal')) geometry.computeVertexNormals()
  return geometry
}

function batchStaticRoot(THREE, mergeGeometries, root, archCache) {
  if (!root || !mergeGeometries) return 0
  const inverseRoot = root.matrixWorld.clone().invert()
  const buckets = new Map()
  const sourceMeshes = []
  root.traverse((node) => {
    if (!node.isMesh || isNavigationMesh(node) || !node.geometry?.getAttribute('position')) return
    const sourceMaterial = Array.isArray(node.material) ? node.material[0] : node.material
    const category = categoryForMaterial(sourceMaterial)
    const geometry = createBatchGeometry(node, inverseRoot)
    if (!geometry) return
    if (!buckets.has(category)) buckets.set(category, { sourceMaterial, geometries: [] })
    buckets.get(category).geometries.push(geometry)
    sourceMeshes.push(node)
  })

  if (sourceMeshes.length < 2) {
    buckets.forEach(({ geometries }) => geometries.forEach((geometry) => geometry.dispose()))
    return 0
  }

  try {
    const batches = []
    buckets.forEach(({ sourceMaterial, geometries }, category) => {
      const geometry = mergeGeometries(geometries, false)
      geometries.forEach((item) => item.dispose())
      if (!geometry) throw new Error(`Unable to merge ${root.name} (${category})`)
      geometry.computeBoundingBox()
      geometry.computeBoundingSphere()
      const mesh = new THREE.Mesh(geometry, createArchitecturalMaterial(THREE, sourceMaterial, archCache))
      mesh.name = `${root.name}-batch-${category}`
      mesh.userData.isStaticBatch = true
      batches.push(mesh)
    })
    sourceMeshes.forEach((mesh) => mesh.parent?.remove(mesh))
    batches.forEach((mesh) => root.add(mesh))
    return sourceMeshes.length
  } catch (error) {
    buckets.forEach(({ geometries }) => geometries.forEach((geometry) => geometry.dispose()))
    console.warn(`Static batch skipped for ${root.name}`, error)
    return 0
  }
}

export function optimiseStaticGeometry(THREE, mergeGeometries, root, archCache) {
  if (!root || !mergeGeometries) return
  root.updateMatrixWorld(true)
  const localNamedNodes = new Map()
  root.traverse((node) => {
    if (node.name && !localNamedNodes.has(node.name)) localNamedNodes.set(node.name, node)
  })
  const batchedMeshes = STATIC_BATCH_ROOTS.reduce((total, name) => (
    total + batchStaticRoot(THREE, mergeGeometries, localNamedNodes.get(name), archCache)
  ), 0)
  if (batchedMeshes) console.info(`Spatial model: batched ${batchedMeshes} static meshes in ${root.name || 'asset'}.`)
}

export function configureModelShadows(root) {
  if (!root) return
  root.traverse((node) => {
    if (!node.isMesh) return
    const material = Array.isArray(node.material) ? node.material[0] : node.material
    const isTransparent = Boolean(material?.transparent && material.opacity < 0.7)
    const canCastShadow = Boolean(node.userData?.isStaticBatch && !isTransparent)
    node.castShadow = canCastShadow
    node.receiveShadow = Boolean(node.userData?.isStaticBatch)
  })
}

export function attachRequiredAssets(model, assetRecords, requiredKeys) {
  if (!model) return
  const required = new Set(requiredKeys)
  assetRecords.forEach(({ scene: assetScene }, assetKey) => {
    if (required.has(assetKey)) {
      if (assetScene.parent !== model) model.add(assetScene)
    } else if (assetScene.parent === model) {
      model.remove(assetScene)
    }
  })
  model.updateMatrixWorld(true)
}

export function isModelNodeVisible(node, model) {
  let current = node
  while (current && current !== model) {
    if (!current.visible) return false
    current = current.parent
  }
  return Boolean(model?.visible)
}

export function calculateModelMetrics(THREE, model) {
  if (!model) return null
  model.updateMatrixWorld(true)
  const bounds = boxFor(THREE, model)
  const center = bounds.getCenter(new THREE.Vector3())
  const size = bounds.getSize(new THREE.Vector3())
  return { bounds, center, size }
}
