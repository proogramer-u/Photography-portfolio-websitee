import { useEffect, useRef, useState } from 'react'
import { listTrashedPhotos, restoreTrashedPhoto, deleteTrashedPhotoRecord } from '../../lib/adminPhotoApi'
import { listTrashedGalleries, restoreTrashedGallery, deleteTrashedGalleryRecord } from '../../lib/adminGalleryApi'
import { publicImageUrl } from '../../lib/galleryApi'
import { AdminSpinner } from './AdminProgress'

export default function AdminTrash({ onSavingChange, onChanged }) {
  const [photos, setPhotos] = useState([])
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [pending, setPending] = useState(null)
  const [saving, setSaving] = useState(false)
  const [requiresRefresh, setRequiresRefresh] = useState(false)
  const submitting = useRef(false)

  useEffect(() => {
    let current = true
    Promise.all([listTrashedPhotos(), listTrashedGalleries()]).then(([photos, galleries]) => { if (current) { setPhotos(photos); setGalleries(galleries) } })
      .catch(error => { if (current) setError(error.message) })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [])

  async function reload() {
    setLoading(true); setError(''); setPending(null)
    try { const [photos, galleries] = await Promise.all([listTrashedPhotos(), listTrashedGalleries()]); setPhotos(photos); setGalleries(galleries); setRequiresRefresh(false) }
    catch (error) { setError(error.message); setRequiresRefresh(true) }
    finally { setLoading(false) }
  }

  async function act(photo, permanently = false, isGallery = false) {
    if (submitting.current || requiresRefresh) return
    submitting.current = true; setSaving(true); setError(''); setNotice(''); onSavingChange(true)
    try {
      if (isGallery) {
        if (permanently) await deleteTrashedGalleryRecord(photo)
        else await restoreTrashedGallery(photo)
        setGalleries(current => current.filter(item => item.id !== photo.id))
      } else {
        if (permanently) await deleteTrashedPhotoRecord(photo)
        else await restoreTrashedPhoto(photo)
        setPhotos(current => current.filter(item => item.id !== photo.id))
      }
      setPending(null)
      setNotice(isGallery ? (permanently ? 'Gallery and its photo records permanently deleted. Stored files retained.' : 'Gallery restored with its photographs and original publication status.') : (permanently ? 'Photo record permanently deleted. Stored image file retained.' : 'Photograph restored to its original gallery.'))
      await onChanged()
      await reload()
    } catch (error) { setError(error.message); setRequiresRefresh(Boolean(error.requiresRefresh)) }
    finally { submitting.current = false; setSaving(false); onSavingChange(false) }
  }

  return <div aria-busy={loading || saving}>
    <p className="admin-field-hint">Galleries and photographs stay here until you restore them or delete their records permanently. Restore a gallery to recover its collection; photographs previously trashed individually stay in photo Trash.</p>
    {notice && <p className="admin-feedback" role="status">{notice}</p>}
    {error && <div className="admin-feedback admin-feedback-error" role="alert"><p>{error}</p><button className="admin-button-secondary" disabled={saving || loading} onClick={reload}>Refresh Trash</button></div>}
    {loading ? <p role="status"><AdminSpinner /> Loading Trash…</p> : !photos.length && !galleries.length && !error ? <div className="admin-empty"><h3>Trash is empty</h3><p>Deleted galleries and photographs will appear here.</p></div> : <>
      {galleries.length > 0 && <section aria-label="Trashed galleries"><h3>Galleries</h3><div className="admin-image-grid">
        {galleries.map(gallery => <article className="admin-photo-card" key={gallery.id}>
          <div className="admin-thumbnail">{gallery.coverPath ? <img src={publicImageUrl(gallery.coverPath)} alt={gallery.title} loading="lazy" /> : <span>Gallery</span>}</div>
          <h4 className="admin-photo-caption">{gallery.title}</h4>
          <p className="admin-field-hint">{gallery.photoCount} photographs · Restores as {gallery.status === 'published' ? 'Published' : 'Draft'}</p>
          {pending === `gallery-${gallery.id}` ? <section aria-label="Confirm permanent gallery deletion">
            <p>This permanently deletes the gallery and all its photo records, including individually trashed photos. It cannot be restored. Stored image files remain.</p>
            <button className="admin-button-secondary" disabled={saving || requiresRefresh || loading} onClick={() => setPending(null)}>Cancel</button>
            <button className="admin-button-danger" disabled={saving || requiresRefresh || loading} onClick={() => act(gallery, true, true)}>Confirm Permanent Gallery Delete</button>
          </section> : <div className="space-y-2">
            <button className="admin-button-secondary" disabled={saving || requiresRefresh || loading} onClick={() => act(gallery, false, true)}>Restore Gallery</button>
            <button className="admin-button-danger" disabled={saving || requiresRefresh || loading} onClick={() => setPending(`gallery-${gallery.id}`)}>Delete Gallery Permanently</button>
          </div>}
        </article>)}
      </div></section>}
      {photos.length > 0 && <section aria-label="Trashed photographs"><h3>Photographs</h3><div className="admin-image-grid">
      {photos.map(photo => <article className="admin-photo-card" key={photo.id}>
        <div className="admin-thumbnail"><img src={photo.url} alt={photo.caption || 'Trashed photograph'} loading="lazy" /></div>
        <p className="admin-photo-caption">{photo.caption || 'Untitled photograph'}</p>
        <p className="admin-field-hint">{photo.galleryTitle}</p>
        {pending === photo.id ? <section aria-label="Confirm permanent deletion">
          <p>This permanently deletes the photo record. It cannot be restored from Trash. The stored image file will remain.</p>
          <button className="admin-button-secondary" disabled={saving || requiresRefresh || loading} onClick={() => setPending(null)}>Cancel</button>
          <button className="admin-button-danger" disabled={saving || requiresRefresh || loading} onClick={() => act(photo, true)}>Confirm Permanent Delete</button>
        </section> : <div className="space-y-2">
          <button className="admin-button-secondary" disabled={saving || requiresRefresh || loading} onClick={() => act(photo)}>Restore</button>
          <button className="admin-button-danger" disabled={saving || requiresRefresh || loading} onClick={() => setPending(photo.id)}>Delete Permanently</button>
        </div>}
      </article>)}
    </div></section>}
    </>}
  </div>
}
