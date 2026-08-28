export const RESOURCE_IMAGE_MAX_RAW_BYTES = 10 * 1024 * 1024
export const RESOURCE_IMAGE_MAX_OUTPUT_BYTES = 1024 * 1024
export const RESOURCE_IMAGE_MAX_EDGE = 1920
export const RESOURCE_IMAGE_OUTPUT_TYPE = 'image/webp'

const acceptedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

const loadImage = async (file) => {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() }
    } catch {
      // Fall back to an HTMLImageElement for browsers with partial AVIF/ImageBitmap support.
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('图片读取失败'))
      element.src = url
    })
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, close: () => {} }
  } finally {
    URL.revokeObjectURL(url)
  }
}

const createCanvas = (width, height) => {
  if (typeof OffscreenCanvas === 'function') return new OffscreenCanvas(width, height)
  if (typeof document === 'undefined') throw new Error('当前环境无法处理图片')
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

const canvasBlob = (canvas, quality) => new Promise((resolve, reject) => {
  if (typeof canvas.convertToBlob === 'function') {
    canvas.convertToBlob({ type: RESOURCE_IMAGE_OUTPUT_TYPE, quality }).then(resolve, reject)
    return
  }
  canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('WebP 编码失败')), RESOURCE_IMAGE_OUTPUT_TYPE, quality)
})

export async function compressResourceImage(file) {
  if (!file || !acceptedTypes.has(String(file.type || '').toLowerCase())) throw new Error('封面仅支持 JPG、PNG、WebP 或 AVIF')
  if (Number(file.size || 0) < 1 || file.size > RESOURCE_IMAGE_MAX_RAW_BYTES) throw new Error('原始图片需小于 10MB')

  const image = await loadImage(file)
  if (!image.width || !image.height) {
    image.close()
    throw new Error('图片尺寸无效，请重新选择')
  }

  let scale = Math.min(1, RESOURCE_IMAGE_MAX_EDGE / Math.max(image.width, image.height))
  let bestBlob = null
  let outputWidth = 0
  let outputHeight = 0
  try {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      outputWidth = Math.max(1, Math.round(image.width * scale))
      outputHeight = Math.max(1, Math.round(image.height * scale))
      const canvas = createCanvas(outputWidth, outputHeight)
      const context = canvas.getContext('2d', { alpha: false })
      if (!context) throw new Error('当前环境无法处理图片')
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, outputWidth, outputHeight)
      context.drawImage(image.source, 0, 0, outputWidth, outputHeight)

      for (const quality of [0.82, 0.74, 0.66, 0.58]) {
        const blob = await canvasBlob(canvas, quality)
        bestBlob = blob
        if (blob.size <= RESOURCE_IMAGE_MAX_OUTPUT_BYTES) break
      }
      if (bestBlob?.size <= RESOURCE_IMAGE_MAX_OUTPUT_BYTES) break
      scale *= 0.86
    }
  } finally {
    image.close()
  }

  if (!bestBlob || bestBlob.size > RESOURCE_IMAGE_MAX_OUTPUT_BYTES) throw new Error('图片压缩后仍超过 1MB，请选择尺寸更小的图片')
  const filename = `${String(file.name || 'resource-image').replace(/\.[^.]+$/, '') || 'resource-image'}.webp`
  const output = new File([bestBlob], filename, { type: RESOURCE_IMAGE_OUTPUT_TYPE, lastModified: Date.now() })
  return {
    file: output,
    width: outputWidth,
    height: outputHeight,
    originalBytes: file.size,
    outputBytes: output.size,
    originalName: file.name || '',
  }
}

export const formatImageBytes = (bytes) => {
  const value = Number(bytes || 0)
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(0)} KB`
  return `${(value / 1024 / 1024).toFixed(2)} MB`
}
