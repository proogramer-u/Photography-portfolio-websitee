import { supabase } from './supabase'
import { bucket } from './galleryApi'
import { createCoverVariant } from './imageProcessing'
import { validateUploadFile } from './uploadValidation'

export async function uploadGalleryCover(file, onProgress = () => {}) {
  validateUploadFile(file)
  if (!supabase) throw new Error('Gallery storage is not configured.')
  onProgress('Preparing cover…')
  let cover
  try { cover = await createCoverVariant(file) }
  catch { throw new Error('Could not prepare this image. Choose a valid JPEG or PNG.') }
  if (cover.type !== 'image/webp') throw new Error('WebP conversion is unavailable in this browser.')

  const path = `covers/${crypto.randomUUID()}.webp`
  onProgress('Uploading cover…')
  try {
    const { error } = await supabase.storage.from(bucket).upload(path, cover, { contentType: 'image/webp', upsert: false })
    if (error) throw error
  } catch { throw new Error('Could not upload the cover. Check your connection and storage access, then try again.') }
  return path
}

export async function saveExistingGalleryCover(gallery, selection, onProgress = () => {}) {
  if (!selection.file && !selection.removed) return gallery.coverPath || null
  const path = selection.file ? await uploadGalleryCover(selection.file, onProgress) : null
  onProgress('Saving cover…')
  try {
    let query = supabase.from('galleries').update({ cover_path: path, updated_at: new Date().toISOString() }).eq('id', gallery.id)
    // Avoid overwriting a cover changed by another browser while this editor was open.
    query = gallery.coverPath ? query.eq('cover_path', gallery.coverPath) : query.is('cover_path', null)
    const { data, error } = await query.select('id, cover_path').single()
    if (error || !data || data.cover_path !== path) throw new Error('Unconfirmed save')
  } catch {
    // A failed response may follow a committed write. Keep uploaded and old objects:
    // deleting either here could break a gallery or a shared photograph reference.
    throw new Error('The cover save could not be confirmed. Refresh the gallery before trying again.')
  }
  onProgress('Cover saved.')
  return path
}
