function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Could not read ${file.name}`))
    }
    image.src = url
  })
}

export async function processImage(file, { maxSize = 2400, quality = 0.84 } = {}) {
  const image = await loadImage(file)
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Image processing is unavailable in this browser.')
  context.drawImage(image, 0, 0, width, height)

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result)
      else reject(new Error(`Could not optimize ${file.name}`))
    }, 'image/webp', quality)
  })
  if (blob.type !== 'image/webp') throw new Error('WebP conversion is unavailable in this browser.')

  const baseName = file.name.replace(/\.[^.]+$/, '')
  return new File([blob], `${baseName}.webp`, { type: 'image/webp' })
}

export function createCoverVariant(file) {
  return processImage(file, { maxSize: 900, quality: 0.8 })
}
