import { useEffect, useRef } from 'react'
import { motion as Motion, useIsPresent, useReducedMotion } from 'framer-motion'
import AdminIcon from './AdminIcon'

export default function AdminDialog({ title, onClose, children, wide = false, dismissible = true }) {
  const dialogRef = useRef(null)
  const present = useIsPresent()
  const reduced = useReducedMotion()
  const transition = { duration: reduced ? 0 : .2, ease: [.2, .65, .3, 1] }
  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    dialog.showModal()
    dialog.querySelector('input:not([disabled]):not([type="file"])')?.focus()
    return () => {
      dialog.close()
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [])
  const close = () => { if (dismissible && present) onClose() }

  return (
    <dialog ref={dialogRef} className="admin-dialog-frame" aria-labelledby="admin-dialog-title" onCancel={(event) => { event.preventDefault(); close() }}>
      <Motion.div className="admin-modal-backdrop" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition} onClick={close} />
      <div className="admin-dialog-container">
        <Motion.div className={`admin-dialog ${wide ? 'admin-dialog-wide' : ''}`} initial={{ opacity: 0, y: reduced ? 0 : 12, scale: reduced ? 1 : .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduced ? 0 : 8, scale: reduced ? 1 : .985 }} transition={transition} inert={!present}>
          <div className="admin-dialog-inner">
            <header className="admin-dialog-header"><h2 id="admin-dialog-title">{title}</h2><button type="button" className="admin-icon-button" onClick={close} disabled={!dismissible || !present} aria-label="Close dialog"><AdminIcon name="close" /></button></header>
            {children}
          </div>
        </Motion.div>
      </div>
    </dialog>
  )
}
