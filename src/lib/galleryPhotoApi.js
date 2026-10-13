import { supabase } from './supabase'
import { bucket } from './galleryApi'
import { processImage } from './imageProcessing'
import { validateUploadFile } from './uploadValidation'

export async function appendGalleryPhotos(galleryId, entries, onProgress = () => {}) {
  if (!entries?.length) throw new Error('Choose at least one photograph.')
  entries.forEach(({ file }) => validateUploadFile(file))
  if (!supabase) throw new Error('Gallery storage is not configured.')
  if (!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(galleryId)) throw new Error('Choose an existing gallery.')

  try {
    const { data, error } = await supabase.from('galleries').select('id').eq('id', galleryId).maybeSingle()
    if (error || !data) throw new Error('Unavailable gallery')
  } catch { throw new Error('This gallery is unavailable. Refresh and check your access before uploading.') }

  const attemptedPaths = []
  const photos = []
  let metadataStarted = false
  try {
    for (const [index, { file, caption }] of entries.entries()) {
      onProgress(`Preparing photograph ${index + 1} of ${entries.length}…`)
      const image = await processImage(file)
      if (image.type !== 'image/webp') throw new Error('WebP conversion unavailable')
      const path = `photos/${galleryId}/${crypto.randomUUID()}.webp`
      // A failed upload response can still leave this newly allocated object behind.
      attemptedPaths.push(path)
      onProgress(`Uploading photograph ${index + 1} of ${entries.length}…`)
      const { error } = await supabase.storage.from(bucket).upload(path, image, { contentType: 'image/webp', upsert: false })
      if (error) throw error
      photos.push({ id: crypto.randomUUID(), gallery_id: galleryId, storage_path: path, caption: caption?.trim() || null })
    }

    // Read after conversion/upload rather than using the potentially stale UI count.
    const { data: last, error: orderError } = await supabase.from('photos')
      .select('sort_order').eq('gallery_id', galleryId).order('sort_order', { ascending: false }).limit(1)
    if (orderError) throw orderError
    const start = last.length ? last[0].sort_order + 1 : 0
    if (!Number.isInteger(start) || start < 0 || start + photos.length - 1 > 2147483647) throw new Error('Invalid photo order')

    onProgress('Saving photographs…')
    metadataStarted = true
    // One database statement inserts the whole batch; never upsert the gallery.
    const { data: saved, error } = await supabase.from('photos')
      .insert(photos.map((photo, index) => ({ ...photo, sort_order: start + index }))).select('id')
    const confirmed = new Set((saved || []).map((photo) => photo.id))
    if (error || saved?.length !== photos.length || photos.some((photo) => !confirmed.has(photo.id))) throw new Error('Unconfirmed save')
    onProgress(`${photos.length} photograph${photos.length === 1 ? '' : 's'} saved.`)
    return photos.length
  } catch {
    if (metadataStarted) {
      // Never delete objects after an uncertain database response: rows may exist.
      const error = new Error('The photo save could not be confirmed. Refresh the gallery before retrying. Uploaded files were preserved.')
      error.requiresRefresh = true
      throw error
    }
    let cleanupFailed = false
    if (attemptedPaths.length) {
      try {
        const { error } = await supabase.storage.from(bucket).remove(attemptedPaths)
        cleanupFailed = Boolean(error)
      } catch { cleanupFailed = true }
    }
    throw new Error(cleanupFailed
      ? 'Could not upload these photographs. Some new files could not be cleaned up; check Storage before retrying.'
      : 'Could not prepare or upload these photographs. Check the files, connection, and storage access, then try again.')
  }
}
