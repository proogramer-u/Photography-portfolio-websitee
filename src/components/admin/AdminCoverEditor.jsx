import { useRef, useState } from 'react'
import AdminCoverUpload from './AdminCoverUpload'
import AdminProgress, { AdminSpinner } from './AdminProgress'
import { saveExistingGalleryCover } from '../../lib/galleryCoverApi'

export default function AdminCoverEditor({ gallery, onSaved, onCancel, onSavingChange }) {
  const [cover, setCover] = useState({ file: null, previewUrl: null, removed: false, position: gallery.coverPosition || { x: 50, y: 50 } })
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const changed = Boolean(cover.file || (cover.removed && gallery.coverPath) || (gallery.coverPath && (cover.position.x !== (gallery.coverPosition?.x ?? 50) || cover.position.y !== (gallery.coverPosition?.y ?? 50))))

  async function save(event) {
    event.preventDefault()
    if (submitting.current || !changed) return
    if (cover.removed && !cover.file && !window.confirm('Remove this gallery cover? Photograph records and stored files will be preserved.')) return
    submitting.current = true
    setSaving(true)
    onSavingChange(true)
    setError('')
    try {
      await saveExistingGalleryCover(gallery, cover, setProgress)
      await onSaved()
    } catch (error) { setError(error.message) }
    finally { submitting.current = false; setSaving(false); onSavingChange(false) }
  }

  return <form className="admin-simple-form" onSubmit={save} aria-busy={saving}><AdminCoverUpload value={cover} onChange={setCover} currentUrl={gallery.coverPath ? gallery.cover : null} disabled={saving} /><p>Choose the image shown on this gallery’s card. Photograph records stay unchanged.</p>{saving && <AdminProgress message={progress || 'Saving cover…'} />}{error && <p role="alert" className="admin-field-error">{error}</p>}<div className="admin-form-actions"><button type="button" className="admin-button-secondary" disabled={saving} onClick={onCancel}>Cancel</button><button className="admin-button-primary" disabled={saving || !changed}>{saving && <AdminSpinner />}{saving ? 'Saving…' : 'Save Cover'}</button></div></form>
}
