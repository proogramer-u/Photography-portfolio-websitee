import { useRef, useState } from 'react'
import { processImage, createCoverVariant } from '../lib/imageProcessing'
import { bucket, saveGallery } from '../lib/galleryApi'
import { supabase } from '../lib/supabase'
import AdminCoverUpload from './admin/AdminCoverUpload'
import AdminProgress, { AdminSpinner } from './admin/AdminProgress'
import { uploadGalleryCover } from '../lib/galleryCoverApi'
import { validateUploadFile } from '../lib/uploadValidation'

export default function AdminGalleryForm({ onSaved, onSavingChange, onCancel }) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState('draft')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [cover, setCover] = useState({ file: null, previewUrl: null, removed: false })
  const [progress, setProgress] = useState('')
  const submitting = useRef(false)
  const generatedSlug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  function handleFiles(event) {
    const selected = Array.from(event.target.files || [])
    try { selected.forEach(validateUploadFile) }
    catch (error) {
      setFiles([])
      event.target.value = ''
      setError(error.message)
      return
    }
    setError('')
    setFiles(selected.map((file) => ({ file, caption: '' })))
  }

  function moveFile(index, direction) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= files.length) return
    const next = [...files]
    ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
    setFiles(next)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting.current) return
    if (!title.trim()) {
      setError('Enter a gallery name.')
      return
    }
    if (status === 'published' && (!files.length || (cover.removed && !cover.file))) {
      setError('Add photographs and a cover before publishing. You can create this gallery as a draft.')
      return
    }

    setError('')
    setIsSaving(true)
    submitting.current = true
    onSavingChange?.(true)
    const uploadedPaths = []
    let metadataStarted = false

    try {
      let chosenCoverPath = null
      if (cover.file) {
        chosenCoverPath = await uploadGalleryCover(cover.file, setProgress)
        uploadedPaths.push(chosenCoverPath)
      }
      const processed = []
      // Finish each upload before starting another so cleanup cannot race pending uploads.
      for (const [index, { file, caption }] of files.entries()) {
        setProgress(`Preparing photograph ${index + 1} of ${files.length}…`)
        const image = await processImage(file)
        const path = `${crypto.randomUUID()}/${image.name}`
        setProgress(`Uploading photograph ${index + 1} of ${files.length}…`)
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, image, { contentType: 'image/webp', upsert: false })
        if (uploadError) throw uploadError
        uploadedPaths.push(path)

        let coverPath = null
        if (index === 0 && !cover.file && !cover.removed) {
          const cover = await createCoverVariant(file)
          coverPath = `${crypto.randomUUID()}/cover-${cover.name}`
          const { error: coverError } = await supabase.storage.from(bucket).upload(coverPath, cover, { contentType: 'image/webp', upsert: false })
          if (coverError) throw coverError
          uploadedPaths.push(coverPath)
        }

        processed.push({ storagePath: path, caption, coverPath })
      }

      setProgress('Saving gallery…')
      metadataStarted = true
      await saveGallery({
        gallery: {
          title: title.trim(),
          slug: slug || generatedSlug || `gallery-${crypto.randomUUID()}`,
          status,
          coverPath: chosenCoverPath || processed[0]?.coverPath || null,
        },
        photos: processed,
      })
      setTitle('')
      setSlug('')
      setStatus('draft')
      setFiles([])
      setCover({ file: null, previewUrl: null, removed: false })
      await onSaved()
    } catch {
      let cleanupFailed = false
      if (uploadedPaths.length && !metadataStarted) {
        try {
          const { error: cleanupError } = await supabase.storage.from(bucket).remove(uploadedPaths)
          cleanupFailed = Boolean(cleanupError)
        } catch { cleanupFailed = true }
      }
      setError(metadataStarted ? 'Gallery save could not be confirmed. Refresh your galleries before retrying. Uploaded files were preserved safely.' : cleanupFailed ? 'Could not save gallery. Some uploaded files could not be cleaned up; check Storage before retrying.' : 'Could not prepare or upload these images. Check the files, storage access, and connection, then try again.')
    } finally {
      setIsSaving(false)
      submitting.current = false
      onSavingChange?.(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-simple-form" aria-busy={isSaving}>
      <fieldset className="admin-form-fields" disabled={isSaving}>
      <label>Gallery name<input required autoFocus value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      <AdminCoverUpload value={cover} onChange={setCover} disabled={isSaving} />
      <p className="admin-field-hint">A name is all you need. New galleries start as drafts.</p>
      <details className="admin-create-options"><summary>Advanced Options</summary>
      <label>Gallery URL<input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder={generatedSlug || 'generated-from-name'} /></label>
      <p className="admin-field-hint">{generatedSlug || slug ? `Public address: /project/${slug || generatedSlug}` : 'Generated automatically from the gallery name.'}</p>
      <label className="block text-sm font-bold">Visibility<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 border border-gray-300 p-3 font-normal"><option value="draft">Draft</option><option value="published">Published</option></select></label>
      <label className="block text-sm font-bold">Photos (optional)<input multiple accept="image/jpeg,image/png" type="file" onChange={handleFiles} className="mt-2 block w-full border border-gray-300 p-3 font-normal" /></label>
      {files.length > 0 && <div className="space-y-2">{files.map((item, index) => <div key={`${item.file.name}-${index}`} className="flex items-center gap-2 border border-gray-100 p-2 text-sm"><span className="w-6">{index + 1}</span><span className="flex-1 truncate">{item.file.name}</span><input value={item.caption} onChange={(event) => setFiles(files.map((file, fileIndex) => fileIndex === index ? { ...file, caption: event.target.value } : file))} placeholder="Caption" className="w-1/3 border border-gray-200 px-2 py-1" /><button type="button" onClick={() => moveFile(index, -1)} disabled={index === 0}>Up</button><button type="button" onClick={() => moveFile(index, 1)} disabled={index === files.length - 1}>Down</button></div>)}</div>}
      </details>
      </fieldset>
      {isSaving && <AdminProgress message={progress || 'Saving gallery…'} />}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="admin-form-actions">{onCancel && <button type="button" disabled={isSaving} className="admin-button-secondary" onClick={onCancel}>Cancel</button>}<button disabled={isSaving || !title.trim()} className="admin-button-primary">{isSaving && <AdminSpinner />}{isSaving ? 'Saving…' : 'Create Gallery'}</button></div>
    </form>
  )
}
