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

// Preserve the existing database-only deletion. Storage cleanup is a separate dependency.
export function deleteGalleryRecord(id) {
  return writeGallery(() => supabase.from('galleries').delete().eq('id', id))
}
