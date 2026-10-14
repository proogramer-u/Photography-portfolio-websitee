import { supabase, supabaseConfigurationError } from './supabase'
import { normalizeCoverPosition, validateCoverPosition } from './coverPosition'

const bucket = 'portfolio-images'

async function readGalleryQuery(query) {
  try {
    if (!supabase) throw new Error('Configuration unavailable')
    const { data, error } = await query()
    if (error) throw error
    return data
  } catch {
    // Never forward response bodies, credentials, request URLs, or raw SDK errors.
    const message = supabaseConfigurationError || 'Gallery content is temporarily unavailable. Please try again later.'
    console.warn(`[Portfolio] ${message}`)
    throw new Error(message)
  }
}

const galleryFields = 'id, title, slug, cover_path, status, sort_order, photos(id, storage_path, caption, sort_order)'
async function readPositionedGallery(build) {
  return readGalleryQuery(async () => {
    let positionSupported = true
    let trashSupported = true
    let galleryTrashSupported = true
    for (let attempt = 0; attempt < 4; attempt++) {
      const fields = (trashSupported ? galleryFields.replace('caption, sort_order)', 'caption, sort_order, deleted_at)') : galleryFields)
        + (positionSupported ? ', cover_position_x, cover_position_y' : '')
        + (galleryTrashSupported ? ', deleted_at' : '')
      let query = build(fields)
      if (trashSupported) query = query.is('photos.deleted_at', null)
      if (galleryTrashSupported) query = query.is('deleted_at', null)
      const result = await query
      if (result.error?.code !== '42703') return result
      if (positionSupported && result.error.message?.includes('cover_position_')) positionSupported = false
      else if (galleryTrashSupported && result.error.message?.includes('deleted_at') && !result.error.message.includes('photos')) galleryTrashSupported = false
      else if (trashSupported && result.error.message?.includes('deleted_at')) trashSupported = false
      else return result
    }
  })
}

function publicImageUrl(path) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

function mapGallery(row) {
  return {
    id: row.id,
    galleryTrashSupported: Object.hasOwn(row, 'deleted_at'),
    title: row.title,
    slug: row.slug,
    cover: row.cover_path ? publicImageUrl(row.cover_path) : null,
    coverPath: row.cover_path || null,
    coverPosition: normalizeCoverPosition({ x: row.cover_position_x, y: row.cover_position_y }),
    coverPositionSupported: Object.hasOwn(row, 'cover_position_x') && Object.hasOwn(row, 'cover_position_y'),
    status: row.status,
    images: (row.photos || [])
      .filter(photo => !photo.deleted_at)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((photo) => ({
        id: photo.id,
        trashSupported: Object.hasOwn(photo, 'deleted_at'),
        url: publicImageUrl(photo.storage_path),
        storagePath: photo.storage_path,
        caption: photo.caption || '',
      })),
  }
}

export async function listPublishedGalleries() {
  const data = await readPositionedGallery((fields) => supabase
    .from('galleries')
    .select(fields)
    .eq('status', 'published')
    .order('sort_order'))

  return data.filter(row => !row.deleted_at).map(mapGallery)
}

export async function getPublishedGallery(slug) {
  const data = await readPositionedGallery((fields) => supabase
    .from('galleries')
    .select(fields)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle())

  return data && !data.deleted_at ? mapGallery(data) : null
}

export async function listAllGalleries() {
  const data = await readPositionedGallery((fields) => supabase
    .from('galleries')
    .select(fields)
    .order('sort_order'))

  return data.filter(row => !row.deleted_at).map(mapGallery)
}

export async function saveGallery({ gallery, photos }) {
  if (gallery.coverPath && /^(blob:|https?:|data:)/i.test(gallery.coverPath)) throw new Error('A cover must use a Storage path, not a browser preview URL.')
  const position = gallery.coverPosition ? validateCoverPosition(gallery.coverPosition) : null
  const { data, error } = await supabase
    .from('galleries')
    .upsert({
      id: gallery.id || undefined,
      title: gallery.title,
      slug: gallery.slug,
      status: gallery.status,
      ...(gallery.coverPath !== undefined ? { cover_path: gallery.coverPath || null } : gallery.id ? {} : { cover_path: null }),
      sort_order: gallery.sortOrder || 0,
      ...(position && (position.x !== 50 || position.y !== 50) ? { cover_position_x: position.x, cover_position_y: position.y } : {}),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (['42703', 'PGRST204'].includes(error?.code) && position) {
    const failure = new Error('Apply the cover-position migration before saving custom framing. Uploaded files were preserved; refresh before retrying.')
    failure.requiresCoverMigration = true
    throw failure
  }
  if (error) throw error

  if (photos?.length) {
    const { error: photoError } = await supabase.from('photos').insert(
      photos.map((photo, index) => ({
        gallery_id: data.id,
        storage_path: photo.storagePath,
        caption: photo.caption || null,
        sort_order: index,
      })),
    )
    if (photoError) throw photoError
  }

  return data.id
}

export { bucket, publicImageUrl }
