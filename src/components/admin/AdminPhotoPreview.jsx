import { useRef, useState } from 'react'
import { updatePhotoCaption, movePhotoToTrash } from '../../lib/adminPhotoApi'
import { AdminSpinner } from './AdminProgress'

export default function AdminPhotoPreview({ photo, gallery, busy, onCover, onSaved, onSavingChange, onRefresh, confirmDelete = false }) {
  const isCover = gallery.coverPath === photo.storagePath
  const [caption, setCaption] = useState(photo.caption || '')
  const [confirming, setConfirming] = useState(confirmDelete && !isCover)
  const [saving, setSaving] = useState('')
  const [error, setError] = useState('')
  const [requiresRefresh, setRequiresRefresh] = useState(false)
  const submitting = useRef(false)
  const locked = busy || Boolean(saving) || requiresRefresh
  const changed = caption.trim() !== (photo.caption || '')

  async function perform(kind) {
    if (submitting.current || busy || requiresRefresh) return
    submitting.current = true
    setSaving(kind)
    setError('')
    onSavingChange(true)
    try {
      if (kind === 'delete') await movePhotoToTrash(gallery.id, photo)
      else await updatePhotoCaption(gallery.id, photo, caption)
      await onSaved(kind)
    } catch (error) {
      setError(error.message)
      setRequiresRefresh(Boolean(error.requiresRefresh))
    } finally {
      submitting.current = false
      setSaving('')
      onSavingChange(false)
    }
  }

  return (
    <div className="admin-photo-editor" aria-busy={Boolean(saving)}>
      <div className="admin-photo-preview"><img src={photo.url} alt={photo.caption || 'Selected photograph'} /></div>
      <div className="admin-photo-fields">
        <form className="admin-simple-form" onSubmit={(event) => { event.preventDefault(); if (changed && !confirming) perform('save') }}>
          <label>Caption<textarea rows="4" value={caption} maxLength={2000} disabled={locked || confirming} onChange={(event) => setCaption(event.target.value)} aria-describedby="photo-caption-hint" /></label>
          <p id="photo-caption-hint" className="admin-field-hint">Optional. Shown alongside this photograph on your website.</p>
          <button className="admin-button-primary" disabled={locked || confirming || !changed}>{saving === 'save' && <AdminSpinner />}{saving === 'save' ? 'Saving…' : 'Save Changes'}</button>
        </form>
        {error && <p className="admin-feedback admin-feedback-error" role="alert">{error}</p>}
        {requiresRefresh && <button className="admin-button-secondary" disabled={busy} onClick={onRefresh}>Refresh gallery</button>}
        <button className="admin-button-secondary" onClick={onCover} disabled={locked || confirming || isCover}>{isCover ? 'Current Gallery Cover' : 'Set as Gallery Cover'}</button>
        <div className="admin-photo-delete">
          {photo.trashSupported === false ? <p className="admin-field-hint">Trash needs the photo-Trash database migration before you can delete photographs.</p> : isCover ? <p className="admin-field-hint">Replace or remove this gallery’s cover before deleting this photograph.</p> : confirming ? <section aria-labelledby="photo-delete-heading">
            <h3 id="photo-delete-heading">Move this photograph to Trash?</h3>
            <p>It will be removed from this gallery and its public photo collection. You can restore it from Trash later. The stored image file will be retained.</p>
            <div className="admin-form-actions">
              <button className="admin-button-secondary" disabled={locked} onClick={() => setConfirming(false)}>Cancel deletion</button>
              <button className="admin-button-danger" disabled={locked} onClick={() => perform('delete')}>{saving === 'delete' && <AdminSpinner />}{saving === 'delete' ? 'Moving…' : 'Move to Trash'}</button>
            </div>
          </section> : <button className="admin-button-danger" disabled={locked} onClick={() => { setError(''); setConfirming(true) }}>Delete Photo</button>}
        </div>
      </div>
    </div>
  )
}
