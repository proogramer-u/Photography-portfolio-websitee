import { supabase } from './supabase'

async function writeGallery(query) {
  try {
    const { data, error } = await query().select('id').single()
    if (error || !data) throw new Error('Write failed')
  } catch {
    throw new Error('Could not save this change. Check your access and try again.')
  }
}

export function renameGallery(id, title) {
  const name = title.trim()
  if (!name) return Promise.reject(new Error('Enter a gallery name.'))
  return writeGallery(() => supabase.from('galleries').update({ title: name, updated_at: new Date().toISOString() }).eq('id', id))
}

export function setGalleryStatus(id, status) {
  if (!['draft', 'published'].includes(status)) return Promise.reject(new Error('Invalid publication status.'))
  return writeGallery(() => supabase.from('galleries').update({ status, updated_at: new Date().toISOString() }).eq('id', id))
}

export function setGalleryCover(gallery, photoId) {
  const photo = gallery.images.find((image) => image.id === photoId)
  if (!photo?.storagePath) return Promise.reject(new Error('Choose a photograph belonging to this gallery.'))
  return writeGallery(() => supabase.from('galleries').update({ cover_path: photo.storagePath, ...(gallery.coverPositionSupported ? { cover_position_x: 50, cover_position_y: 50 } : {}), updated_at: new Date().toISOString() }).eq('id', gallery.id))
}


function checkGallery(id) {
  if (!supabase || !id) throw new Error('Choose an available gallery.')
}
function galleryTrashError(error) {
  if (['42703', 'PGRST204'].includes(error?.code) && error.message?.includes('deleted_at')) return new Error('Apply the gallery-Trash migration before using gallery Trash.')
  const failure = new Error('The gallery change could not be confirmed. Refresh Trash or the gallery before trying again. Stored files were preserved.')
  failure.requiresRefresh = true
  return failure
}
function checkTrashedGallery(gallery) {
  checkGallery(gallery?.id)
  if (!gallery.deletedAt || !Number.isFinite(Date.parse(gallery.deletedAt))) throw new Error('Choose a gallery already in Trash.')
}
export async function moveGalleryToTrash(id) {
  checkGallery(id)
  const deletedAt = new Date().toISOString()
  try {
    const { data, error } = await supabase.from('galleries').update({ deleted_at: deletedAt }).eq('id', id)
      .is('deleted_at', null).select('id, deleted_at').single()
    if (error) throw error
    if (data?.id !== id || Date.parse(data.deleted_at) !== Date.parse(deletedAt)) throw new Error('Unconfirmed move')
  } catch (error) { throw galleryTrashError(error) }
}
export async function restoreTrashedGallery(gallery) {
  checkTrashedGallery(gallery)
  try {
    const { data, error } = await supabase.from('galleries').update({ deleted_at: null }).eq('id', gallery.id)
      .eq('deleted_at', gallery.deletedAt).select('id, deleted_at').single()
    if (error) throw error
    if (data?.id !== gallery.id || data.deleted_at !== null) throw new Error('Unconfirmed restore')
  } catch (error) { throw galleryTrashError(error) }
}
export async function deleteTrashedGalleryRecord(gallery) {
  checkTrashedGallery(gallery)
  try {
    const { data, error } = await supabase.from('galleries').delete().eq('id', gallery.id)
      .eq('deleted_at', gallery.deletedAt).select('id').single()
    if (error) throw error
    if (data?.id !== gallery.id) throw new Error('Unconfirmed deletion')
  } catch (error) { throw galleryTrashError(error) }
  // The existing FK cascades all photo records. Keep Storage files, which may be shared.
}
export async function listTrashedGalleries() {
  if (!supabase) throw new Error('Gallery management is not configured.')
  try {
    const { data, error } = await supabase.from('galleries').select('id, title, slug, status, cover_path, deleted_at, photos(count)')
      .not('deleted_at', 'is', null).order('deleted_at', { ascending: false })
    if (error) throw error
    if (!Array.isArray(data)) throw new Error('Unavailable Trash')
    return data.map(row => ({ id: row.id, title: row.title, slug: row.slug, status: row.status, coverPath: row.cover_path,
      deletedAt: row.deleted_at, photoCount: row.photos?.[0]?.count || 0 }))
  } catch (error) { throw galleryTrashError(error) }
}
