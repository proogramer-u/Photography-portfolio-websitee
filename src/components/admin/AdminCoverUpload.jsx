import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion'
import { validateUploadFile } from '../../lib/uploadValidation'
import AdminIcon from './AdminIcon'

export default function AdminCoverUpload({ value, onChange, currentUrl = null, disabled = false }) {
  const inputRef = useRef(null)
  const dragDepth = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const id = useId()
  const reduced = useReducedMotion()
  const previewUrl = value.previewUrl || (!value.removed ? currentUrl : null)

  useEffect(() => {
    const url = value.previewUrl
    return () => { if (url) URL.revokeObjectURL(url) }
  }, [value.previewUrl])

  function choose(files) {
    if (disabled || !files?.length) return
    if (files.length !== 1) { setError('Choose one image for the gallery cover.'); return }
    const file = files[0]
    try { validateUploadFile(file) }
    catch (error) { setError(error.message); return }
    setError('')
    onChange({ file, previewUrl: URL.createObjectURL(file), removed: false })
  }

  return (
    <div className="admin-cover-field">
      <p id={`${id}-label`} className="admin-field-label">Gallery Cover Image <span>Optional</span></p>
      <input ref={inputRef} id={id} type="file" accept="image/jpeg,image/png" hidden disabled={disabled} aria-labelledby={`${id}-label`} onChange={(event) => { choose(event.target.files); event.target.value = '' }} />
      <div className={`admin-cover-zone ${dragging ? 'is-dragging' : ''} ${previewUrl ? 'has-preview' : ''}`} onDragOver={(event) => { event.preventDefault(); if (!disabled) event.dataTransfer.dropEffect = 'copy' }} onDragEnter={(event) => { event.preventDefault(); if (!disabled) { dragDepth.current++; setDragging(true) } }} onDragLeave={(event) => { event.preventDefault(); dragDepth.current = Math.max(0, dragDepth.current - 1); if (!dragDepth.current) setDragging(false) }} onDrop={(event) => { event.preventDefault(); dragDepth.current = 0; setDragging(false); choose(event.dataTransfer.files) }}>
        <AnimatePresence mode="wait" initial={false}>
          {previewUrl ? <Motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .15 }} className="admin-cover-preview"><img src={previewUrl} alt="Gallery cover preview" /><span>{value.file ? 'New cover preview' : 'Current cover'}</span></Motion.div> : <Motion.button key="empty" type="button" className="admin-cover-browse" onClick={() => inputRef.current.click()} disabled={disabled} aria-labelledby={`${id}-label ${id}-instructions`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .15 }}><AdminIcon name="image" size={26} /><span id={`${id}-instructions`}>Drag &amp; drop a cover image here</span><small>or click to browse files</small><small>JPEG or PNG · Up to 20 MB</small></Motion.button>}
        </AnimatePresence>
      </div>
      {previewUrl && <div className="admin-cover-actions"><button type="button" className="admin-button-secondary" disabled={disabled} onClick={() => inputRef.current.click()}>Replace Cover</button><button type="button" className="admin-cover-remove" disabled={disabled} onClick={() => { setError(''); onChange({ file: null, previewUrl: null, removed: true }) }}>Remove Cover</button></div>}
      {value.removed && currentUrl && <p className="admin-field-hint">The cover will be removed when you save.</p>}
      {error && <p className="admin-field-error" role="alert">{error}</p>}
    </div>
  )
}
