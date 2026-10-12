export const MAX_IMAGE_BYTES = 20 * 1024 * 1024

export function validateUploadFile(file) {
  if (!file || !['image/jpeg', 'image/png'].includes(file.type)) throw new Error('Choose a JPEG or PNG image.')
  if (!file.size) throw new Error('This image is empty. Choose another file.')
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Choose an image smaller than 20 MB.')
}
