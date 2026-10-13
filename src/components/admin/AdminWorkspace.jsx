import { Link } from 'react-router-dom'
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion'
import AdminIcon from './AdminIcon'
import AdminSidebar from './AdminSidebar'
import AdminGalleryGrid from './AdminGalleryGrid'
import AdminPhotoGrid from './AdminPhotoGrid'

export default function AdminWorkspace({ galleries, selectedId, loading, error, notice, busy, onSelect, onCreate, onSignOut, onMenu, onRename, onEditCover, onStatus, onDelete, onPhoto, onUpload, onRetry }) {
  const reduced = useReducedMotion()
  const initialLoading = loading && !galleries.length
  const selected = galleries.find((gallery) => gallery.id === selectedId)
  const missing = selectedId && !selected && !loading && !error
  const title = selected?.title || 'My Galleries'
  const count = selected ? `${selected.images.length} Photos` : `${galleries.length} Galleries`
  const sidebarProps = { galleries, selectedId, onSelect, onCreate, onSignOut, busy }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar"><AdminSidebar {...sidebarProps} /></aside>
      <main className="admin-main">
        <header className="admin-main-header">
          <div className="admin-title-row"><button className="admin-icon-button admin-mobile-menu" onClick={onMenu} aria-label="Open gallery navigation"><AdminIcon name="menu" /></button><h1>{title}</h1><span className="admin-count-badge">{loading ? 'Loading…' : count}</span></div>
          <details className="admin-account"><summary aria-label="Account menu"><span>C</span></summary><div className="admin-account-menu"><p>Portfolio administration</p><Link to="/gallery">View website</Link><button onClick={onSignOut} disabled={busy}>Sign Out</button></div></details>
        </header>
        <div className="admin-toolbar"><nav className="admin-breadcrumb" aria-label="Breadcrumb"><button onClick={() => onSelect(null)}>Portfolio</button><AdminIcon name="arrow" size={14} />{selected ? <><button onClick={() => onSelect(null)}>My Galleries</button><AdminIcon name="arrow" size={14} /><span aria-current="page">{selected.title}</span></> : <span aria-current="page">My Galleries</span>}</nav><button className="admin-button-primary" onClick={selected ? onUpload : onCreate} disabled={busy || Boolean(missing)}><AdminIcon name={selected ? 'upload' : 'plus'} size={17} />{selected ? 'Upload Photos' : 'Create Gallery'}</button></div>
        {selected && <div className="admin-detail-actions"><span className={`admin-status ${selected.status === 'published' ? 'is-published' : ''}`}>{selected.status === 'published' ? 'Published' : 'Draft'}</span><button onClick={() => onRename(selected)} disabled={busy}>Rename gallery</button><button onClick={() => onEditCover(selected)} disabled={busy}>{selected.coverPath ? 'Edit cover' : 'Add cover'}</button><button onClick={() => onStatus(selected)} disabled={busy}>{selected.status === 'published' ? 'Unpublish' : 'Publish'}</button><button className="admin-danger-text" onClick={() => onDelete(selected)} disabled={busy}>Delete gallery</button></div>}
        <AnimatePresence initial={false}>{notice && <Motion.p key={notice} className="admin-feedback" role="status" initial={{ opacity: 0, y: reduced ? 0 : 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .18 }}>{notice}</Motion.p>}</AnimatePresence>
        {error && <div className="admin-feedback admin-feedback-error" role="alert"><p>{error}</p><button onClick={onRetry} disabled={busy || loading}>Try again</button></div>}
        <section className="admin-content-panel" aria-label={selected ? 'Gallery photographs' : 'All galleries'} aria-busy={loading}>
          {initialLoading ? <div className="admin-loading-grid" aria-label="Loading galleries">{Array.from({ length: 5 }, (_, index) => <div key={index} className="admin-loading-thumbnail" />)}</div> : missing ? <div className="admin-empty"><AdminIcon name="image" size={36} /><h2>Gallery not found</h2><p>This gallery may have been removed.</p><button className="admin-button-secondary" onClick={() => onSelect(null)}>Back to My Galleries</button></div> : error && !galleries.length ? <div className="admin-empty"><AdminIcon name="image" size={36} /><h2>Galleries could not be loaded</h2><p>Try again to load your collection.</p></div> : selected ? selected.images.length ? <AdminPhotoGrid gallery={selected} onEdit={onPhoto} /> : <div className="admin-empty"><AdminIcon name="image" size={36} /><h2>A new place for your photographs</h2><p>This gallery is empty. Upload photographs to start your collection.</p><button className="admin-button-secondary" onClick={onUpload}>Upload Photos</button></div> : galleries.length ? <AdminGalleryGrid galleries={galleries} busy={busy} onEditCover={onEditCover} onOpen={onSelect} onRename={onRename} onStatus={onStatus} onDelete={onDelete} /> : <div className="admin-empty"><AdminIcon name="image" size={36} /><h2>Your collection starts here</h2><p>Create a gallery to organize your photographs.<br />You can give it a name now and add images later.</p><button className="admin-button-primary" onClick={onCreate} disabled={busy}><AdminIcon name="plus" size={17} />Create Gallery</button></div>}
        </section>
        <footer className="admin-footer">Cokorda Bagus Laksmana Iswara <span>Photography portfolio</span></footer>
      </main>
    </div>
  )
}
