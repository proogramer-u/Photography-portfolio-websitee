import { motion as Motion, useReducedMotion } from 'framer-motion'
import AdminIcon from './AdminIcon'
import { coverPositionStyle } from '../../lib/coverPosition'

export default function AdminGalleryGrid({ galleries, busy, onOpen, onRename, onEditCover, onStatus, onDelete }) {
  const reduced = useReducedMotion()
  return <div className="admin-image-grid">{galleries.map((gallery, index) => (
    <Motion.article key={gallery.id} className="admin-gallery-card" initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .22, delay: reduced ? 0 : Math.min(index, 6) * .025 }}>
      <div className="admin-thumbnail-wrap">
        <button className="admin-thumbnail" onClick={() => onOpen(gallery.id)} aria-label={`Open ${gallery.title}`}>
          {gallery.cover ? <img src={gallery.cover} style={coverPositionStyle(gallery)} alt="" loading="lazy" decoding="async" /> : <span className="admin-thumbnail-placeholder"><AdminIcon name="image" size={30} /><span>No cover yet</span></span>}
        </button>
        <div className="admin-thumbnail-actions"><button onClick={() => onOpen(gallery.id)} aria-label={`Edit ${gallery.title}`}>Edit</button><button onClick={() => onDelete(gallery)} disabled={busy} aria-label={`Delete ${gallery.title}`}>Delete</button></div>
      </div>
      <div className="admin-card-heading"><button onClick={() => onOpen(gallery.id)} className="admin-card-title">{gallery.title}</button><span className={`admin-status ${gallery.status === 'published' ? 'is-published' : ''}`}>{gallery.status === 'published' ? 'Published' : 'Draft'}</span></div>
      <p className="admin-card-meta">{gallery.images.length} {gallery.images.length === 1 ? 'photograph' : 'photographs'}</p>
      <div className="admin-card-actions"><button onClick={() => onRename(gallery)} disabled={busy}>Rename</button><button onClick={() => onEditCover(gallery)} disabled={busy}>Cover</button><button onClick={() => onStatus(gallery)} disabled={busy}>{gallery.status === 'published' ? 'Unpublish' : 'Publish'}</button><button className="admin-danger-text" onClick={() => onDelete(gallery)} disabled={busy}>Delete</button></div>
    </Motion.article>
  ))}</div>
}
