import { Link } from 'react-router-dom'
import { useId } from 'react'
import { LayoutGroup, motion as Motion, useReducedMotion } from 'framer-motion'
import AdminIcon from './AdminIcon'

export default function AdminSidebar({ galleries, selectedId, onSelect, onCreate, onSignOut, busy }) {
  const groupId = useId()
  const reduced = useReducedMotion()
  const indicator = <Motion.span layoutId="active-gallery" className="admin-active-indicator" transition={{ type: 'tween', duration: reduced ? 0 : .2 }} />
  return (
    <div className="admin-sidebar-content">
      <Link to="/" className="admin-brand" aria-label="Open photography website"><span className="admin-brand-mark">C.</span><span>Cokorda<br /><small>Photography</small></span></Link>
      <nav aria-label="Gallery administration" className="admin-navigation">
        <LayoutGroup id={groupId}>
        <button className={`admin-nav-item ${!selectedId ? 'is-active' : ''}`} onClick={() => onSelect(null)} aria-current={!selectedId ? 'page' : undefined}>{!selectedId && indicator}<AdminIcon name="grid" /><span>All Galleries</span><span className="admin-nav-count">{galleries.length}</span></button>
        <div className="admin-gallery-navigation">
          {galleries.map((gallery) => <button key={gallery.id} onClick={() => onSelect(gallery.id)} className={`admin-gallery-link ${selectedId === gallery.id ? 'is-active' : ''}`} aria-current={selectedId === gallery.id ? 'page' : undefined}>{selectedId === gallery.id && indicator}<span className="admin-gallery-dot" /><span>{gallery.title}</span></button>)}
        </div>
        </LayoutGroup>
        <button className="admin-nav-item admin-create-nav" onClick={onCreate} disabled={busy}><AdminIcon name="plus" /><span>Create Gallery</span></button>
      </nav>
      <div className="admin-sidebar-bottom"><Link to="/gallery" className="admin-nav-item"><AdminIcon name="external" /><span>View website</span></Link><button className="admin-nav-item" onClick={onSignOut} disabled={busy}><AdminIcon name="logout" /><span>Sign Out</span></button></div>
    </div>
  )
}
