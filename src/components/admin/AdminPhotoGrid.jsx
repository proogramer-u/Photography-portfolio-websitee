import { motion as Motion, useReducedMotion } from 'framer-motion'

export default function AdminPhotoGrid({ gallery, onEdit, onDelete, busy }) {
  const reduced = useReducedMotion()
  return <div className="admin-image-grid">{gallery.images.map((photo, index) => {
    const title = photo.title || photo.caption || `Photograph ${index + 1}`
    return (
      <Motion.article key={photo.id} className="admin-photo-card" initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .22, delay: reduced ? 0 : Math.min(index, 6) * .025 }}>
        <div className="admin-thumbnail-wrap">
          <button className="admin-thumbnail" onClick={() => onEdit(photo)} aria-label={`Open photograph ${index + 1}: ${title}`}><img src={photo.url} alt={title} loading="lazy" decoding="async" />{gallery.coverPath === photo.storagePath && <span className="admin-cover-label">Cover</span>}</button>
          <div className="admin-thumbnail-actions admin-photo-overlay"><span>{title}</span><div><button onClick={() => onEdit(photo)} aria-label={`Edit photograph ${index + 1}`}>Edit</button><button disabled={busy} onClick={() => onDelete(photo)} aria-label={`Delete photograph ${index + 1}`}>Delete</button></div></div>
        </div>
        <p className="admin-photo-caption">{title}</p>
      </Motion.article>
    )
  })}</div>
}
