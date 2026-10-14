import { supabase } from './supabase'
import { publicImageUrl } from './galleryApi'

function checkPhoto(galleryId, photo) {
  if (!supabase) throw new Error('Photo management is not configured.')
  if (!galleryId || !photo?.id || !photo.storagePath) throw new Error('Choose a photograph belonging to this gallery.')
}

function matchPhoto(query, galleryId, photo) {
  query = query.eq('id', photo.id).eq('gallery_id', galleryId).eq('storage_path', photo.storagePath)
  // Empty captions are mapped to an empty string on reads, including database nulls.
  return photo.caption ? query.eq('caption', photo.caption) : query.or('caption.is.null,caption.eq.')
}

function migrationError(error) {
  return ['42703', 'PGRST204'].includes(error?.code) && error.message?.includes('deleted_at')
}
function trashFailure(error, action) {
  if (migrationError(error)) return new Error('Apply the photo and gallery Trash migrations before using Trash. No permanent deletion was attempted.')
  return unconfirmed(action)
}

function unconfirmed(action) {
  const error = new Error(`The photo ${action} could not be confirmed. Refresh the gallery before trying again. Stored image files were preserved.`)
  error.requiresRefresh = true
  return error
}

export async function updatePhotoCaption(galleryId, photo, value) {
  checkPhoto(galleryId, photo)
  if (typeof value !== 'string') throw new Error('Enter a valid caption.')
  const caption = value.trim() || null
  if (caption?.length > 2000) throw new Error('Keep the caption to 2000 characters or fewer.')
  try {
    let query = matchPhoto(supabase.from('photos').update({ caption }), galleryId, photo)
    if (photo.trashSupported) query = query.is('deleted_at', null)
    const { data, error } = await query.select('id, caption').single()
    if (error || data?.id !== photo.id || data.caption !== caption) throw new Error('Unconfirmed write')
  } catch { throw unconfirmed('save') }
}

async function checkCovers(photo) {
  let covers
  try {
    const { data, error } = await supabase.from('galleries').select('id').eq('cover_path', photo.storagePath).limit(1)
    if (error || !Array.isArray(data)) throw new Error('Unavailable covers')
    covers = data
  } catch { throw new Error('Could not check gallery covers. Check your access and connection before deleting.') }
  if (covers.length) throw new Error('This photograph is used as a gallery cover. Replace or remove that cover before deleting the photograph.')
}

export async function movePhotoToTrash(galleryId, photo) {
  checkPhoto(galleryId, photo)
  await checkCovers(photo)
  const deletedAt = new Date().toISOString()
  try {
    const { data, error } = await matchPhoto(supabase.from('photos').update({ deleted_at: deletedAt }), galleryId, photo)
      .is('deleted_at', null).select('id, deleted_at').single()
    if (error) throw error
    if (data?.id !== photo.id || Date.parse(data.deleted_at) !== Date.parse(deletedAt)) throw new Error('Unconfirmed Trash move')
  } catch (error) { throw trashFailure(error, 'move to Trash') }
}

function checkTrashed(photo) {
  checkPhoto(photo.galleryId, photo)
  if (!photo.deletedAt || !Number.isFinite(Date.parse(photo.deletedAt))) throw new Error('Choose a photograph already in Trash.')
}

export async function restoreTrashedPhoto(photo) {
  checkTrashed(photo)
  try {
    const { data, error } = await matchPhoto(supabase.from('photos').update({ deleted_at: null }), photo.galleryId, photo)
      .eq('deleted_at', photo.deletedAt).select('id, deleted_at').single()
    if (error) throw error
    if (data?.id !== photo.id || data.deleted_at !== null) throw new Error('Unconfirmed restore')
  } catch (error) { throw trashFailure(error, 'restore') }
}

export async function deleteTrashedPhotoRecord(photo) {
  checkTrashed(photo)
  await checkCovers(photo)
  try {
    const { data, error } = await matchPhoto(supabase.from('photos').delete(), photo.galleryId, photo)
      .eq('deleted_at', photo.deletedAt).select('id').single()
    if (error) throw error
    if (data?.id !== photo.id) throw new Error('Unconfirmed deletion')
  } catch (error) { throw trashFailure(error, 'permanent deletion') }
  // Retain image bytes: the cover check is not atomic with this write, and other
  // galleries may share the same file. Reclamation is a separate backend task.
}

export async function listTrashedPhotos() {
  if (!supabase) throw new Error('Photo management is not configured.')
  try {
    const { data, error } = await supabase.from('photos').select('id, gallery_id, storage_path, caption, deleted_at, galleries!inner(title, deleted_at)')
      .not('deleted_at', 'is', null).is('galleries.deleted_at', null).order('deleted_at', { ascending: false })
    if (error) throw error
    if (!Array.isArray(data)) throw new Error('Unavailable Trash')
    return data.map(row => ({ id: row.id, galleryId: row.gallery_id, storagePath: row.storage_path,
      caption: row.caption || '', deletedAt: row.deleted_at, galleryTitle: row.galleries?.title || 'Gallery', url: publicImageUrl(row.storage_path) }))
  } catch (error) {
    if (migrationError(error)) throw trashFailure(error, 'read')
    throw new Error('Trash is temporarily unavailable. Check your access and try again.')
  }
}
