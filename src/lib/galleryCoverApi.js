import { supabase } from './supabase'
import { bucket } from './galleryApi'
import { createCoverVariant } from './imageProcessing'
import { validateUploadFile } from './uploadValidation'
import { validateCoverPosition } from './coverPosition'

export async function verifyCoverPositionSupport() {
  try {
    const { error } = await supabase.from('galleries').select('cover_position_x, cover_position_y').limit(0)
    if (['42703', 'PGRST204'].includes(error?.code)) {
      const failure = new Error('Apply the cover-position migration before saving custom framing.')
      failure.requiresCoverMigration = true
      throw failure
    }
    if (error) throw error
  } catch (error) {
    if (error.requiresCoverMigration) throw error
    throw new Error('Could not verify cover positioning. Check your connection and access, then try again.')
  }
}

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
  const position = selection.position ? validateCoverPosition(selection.position) : null
  const positionChanged = position && (position.x !== (gallery.coverPosition?.x ?? 50) || position.y !== (gallery.coverPosition?.y ?? 50))
  if (!selection.file && !selection.removed && !positionChanged) return gallery.coverPath || null
  const positioning = position && (gallery.coverPositionSupported || positionChanged)
  if (positioning && !gallery.coverPositionSupported) await verifyCoverPositionSupport()
  const path = selection.file ? await uploadGalleryCover(selection.file, onProgress) : selection.removed ? null : gallery.coverPath
  onProgress('Saving cover…')
  try {
    let query = supabase.from('galleries').update({ cover_path: path, ...(positioning ? { cover_position_x: position.x, cover_position_y: position.y } : {}), updated_at: new Date().toISOString() }).eq('id', gallery.id)
    // Avoid overwriting a cover changed by another browser while this editor was open.
    query = gallery.coverPath ? query.eq('cover_path', gallery.coverPath) : query.is('cover_path', null)
    if (gallery.coverPositionSupported) query = query.eq('cover_position_x', gallery.coverPosition?.x ?? 50).eq('cover_position_y', gallery.coverPosition?.y ?? 50)
    const { data, error } = await query.select(positioning ? 'id, cover_path, cover_position_x, cover_position_y' : 'id, cover_path').single()
    if (['42703', 'PGRST204'].includes(error?.code) && positioning) { const failure = new Error('Apply the cover-position migration before saving framing. Refresh before retrying; uploaded files were preserved.'); failure.requiresCoverMigration = true; throw failure }
    if (error || !data || data.cover_path !== path || (positioning && (data.cover_position_x == null || data.cover_position_y == null || Number(data.cover_position_x) !== position.x || Number(data.cover_position_y) !== position.y))) throw new Error('Unconfirmed save')
  } catch (error) {
    if (error.requiresCoverMigration) throw error
    // A failed response may follow a committed write. Keep uploaded and old objects:
    // deleting either here could break a gallery or a shared photograph reference.
    throw new Error('The cover save could not be confirmed. Refresh the gallery before trying again.')
  }
  onProgress('Cover saved.')
  return path
}
