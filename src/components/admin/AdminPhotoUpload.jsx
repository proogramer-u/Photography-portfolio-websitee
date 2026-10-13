import { useRef, useState } from 'react'
import { appendGalleryPhotos } from '../../lib/galleryPhotoApi'
import { validateUploadFile } from '../../lib/uploadValidation'
import AdminProgress, { AdminSpinner } from './AdminProgress'

export default function AdminPhotoUpload({ gallery, onSaved, onSavingChange, onCancel }) {
  const [entries, setEntries] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState('')
  const [requiresRefresh, setRequiresRefresh] = useState(false)
  const submitting = useRef(false)

  function chooseFiles(event) {
    const files = Array.from(event.target.files || [])
    try { files.forEach(validateUploadFile) }
    catch (error) { setError(error.message); event.target.value = ''; return }
    setError('')
    setEntries(files.map((file) => ({ id: crypto.randomUUID(), file, caption: '' })))
    event.target.value = ''
  }

  async function submit(event) {
    event.preventDefault()
    if (submitting.current || requiresRefresh || !entries.length) return
    submitting.current = true
    setSaving(true)
    setError('')
    onSavingChange?.(true)
    try {
      const count = await appendGalleryPhotos(gallery.id, entries, setProgress)
      await onSaved(count)
    } catch (error) {
      setError(error.message)
      setRequiresRefresh(Boolean(error.requiresRefresh))
    } finally {
      submitting.current = false
      setSaving(false)
      onSavingChange?.(false)
    }
  }

  return (
    <form className="admin-simple-form" onSubmit={submit} aria-busy={saving}>
      <p className="admin-field-hint">Add photographs to {gallery.title}. New photos appear after the current collection. Your gallery cover stays the same.</p>
      <fieldset className="admin-form-fields" disabled={saving || requiresRefresh}>
        <label>Photographs<input type="file" multiple accept="image/jpeg,image/png" onChange={chooseFiles} className="mt-2 block w-full border border-gray-300 p-3 font-normal" /></label>
        <p className="admin-field-hint">JPEG or PNG · Up to 20 MB per photograph · Converted to WebP automatically.</p>
        {entries.length > 0 && <div className="space-y-3">
          <p>{entries.length} photograph{entries.length === 1 ? '' : 's'} selected</p>
          {entries.map((entry, index) => <div key={entry.id} className="border border-gray-200 p-3 space-y-2">
            <p className="break-all text-sm">{index + 1}. {entry.file.name}</p>
            <label>Caption for photograph {index + 1}<input value={entry.caption} placeholder="Optional caption" onChange={(event) => setEntries(entries.map((item) => item.id === entry.id ? { ...item, caption: event.target.value } : item))} /></label>
            <button type="button" className="admin-button-secondary" aria-label={`Remove ${entry.file.name} from upload`} onClick={() => setEntries(entries.filter((item) => item.id !== entry.id))}>Remove</button>
          </div>)}
        </div>}
      </fieldset>
      {saving && <AdminProgress message={progress || 'Preparing photographs…'} />}
      {error && <p role="alert" className="admin-field-error">{error}</p>}
      <div className="admin-form-actions">
        <button type="button" className="admin-button-secondary" disabled={saving} onClick={onCancel}>{requiresRefresh ? 'Back to gallery' : 'Cancel'}</button>
        <button className="admin-button-primary" disabled={saving || requiresRefresh || !entries.length}>{saving && <AdminSpinner />}{saving ? 'Uploading…' : 'Upload Photos'}</button>
      </div>
    </form>
  )
}
