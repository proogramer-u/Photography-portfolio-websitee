import { useEffect, useRef, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import PageTransition from '../components/PageTransition'
import AdminGalleryForm from '../components/AdminGalleryForm'
import AdminWorkspace from '../components/admin/AdminWorkspace'
import AdminDialog from '../components/admin/AdminDialog'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminPhotoPreview from '../components/admin/AdminPhotoPreview'
import AdminCoverEditor from '../components/admin/AdminCoverEditor'
import AdminPhotoUpload from '../components/admin/AdminPhotoUpload'
import AdminTrash from '../components/admin/AdminTrash'
import { listAllGalleries } from '../lib/galleryApi'
import { renameGallery, setGalleryStatus, setGalleryCover, moveGalleryToTrash } from '../lib/adminGalleryApi'
import { supabase } from '../lib/supabase'
import './admin.css'

export default function AdminPage({ session }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('gallery')
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [dialog, setDialog] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [dialogError, setDialogError] = useState('')
  const [dialogRequiresRefresh, setDialogRequiresRefresh] = useState(false)
  const actionPending = useRef(false)

  useEffect(() => {
    if (!session) return
    let current = true
    listAllGalleries().then((data) => {
      if (current) { setGalleries(data); setError('') }
    }).catch(() => {
      if (current) setError('Your galleries are temporarily unavailable. Please try again.')
    }).finally(() => {
      if (current) setLoading(false)
    })
    return () => { current = false }
  }, [session])

  useEffect(() => {
    const closeOnHistory = () => { if (!busy) setDialog(null) }
    window.addEventListener('popstate', closeOnHistory)
    return () => window.removeEventListener('popstate', closeOnHistory)
  }, [busy])

  async function refresh() {
    setLoading(true)
    setError('')
    try { setGalleries(await listAllGalleries()) }
    catch { setError('Your galleries are temporarily unavailable. Please try again.') }
    finally { setLoading(false) }
  }

  function selectGallery(id) {
    if (busy) return
    setSearchParams(id ? { gallery: id } : {})
    setDialog(null)
    setDialogError('')
    setNotice('')
  }

  function openDialog(next) { if (!busy) { setDialogError(''); setDialogRequiresRefresh(false); setNotice(''); setDialog(next) } }
  function closeDialog() { if (!busy) setDialog(null) }

  async function runAction(action, message, close = false) {
    if (actionPending.current) return
    actionPending.current = true
    setBusy(true)
    setError('')
    setNotice('')
    setDialogError('')
    try {
      await action()
      setNotice(message)
      if (close) setDialog(null)
      await refresh()
    } catch (error) {
      const message = error.requiresRefresh ? 'This change could not be confirmed. Refresh before trying again.' : 'Could not save this change. Check your access and try again.'
      setDialogRequiresRefresh(Boolean(error.requiresRefresh))
      if (dialog) setDialogError(message)
      else setError(message)
    } finally { actionPending.current = false; setBusy(false) }
  }

  function handleDelete(gallery) {
    if (!gallery.galleryTrashSupported) { setError('Apply the gallery-Trash migration before deleting galleries.'); return }
    openDialog({ type: 'trashGallery', gallery })
  }

  function confirmGalleryTrash(gallery) {
    runAction(async () => {
      await moveGalleryToTrash(gallery.id)
      if (selectedId === gallery.id) setSearchParams({})
    }, 'Gallery moved to Trash. You can restore it later.', true)
  }

  function handleStatus(gallery) {
    if (gallery.status !== 'published' && (!gallery.images.length || !gallery.cover)) {
      setError('Add photographs and choose a cover before publishing this gallery.')
      return
    }
    runAction(() => setGalleryStatus(gallery.id, gallery.status === 'published' ? 'draft' : 'published'), gallery.status === 'published' ? 'Gallery unpublished.' : 'Gallery published.')
  }

  async function signOut() {
    setBusy(true)
    const reportError = () => {
      if (dialog) setDialogError('Could not sign out. Please try again.')
      else setError('Could not sign out. Please try again.')
    }
    try {
      const { error } = await supabase.auth.signOut()
      if (error) reportError()
    } catch { reportError() }
    finally { setBusy(false) }
  }

  if (!session) return <Navigate to="/admin/login" replace />
  const selected = galleries.find((gallery) => gallery.id === selectedId)
  const selectedPhoto = selected?.images.find((photo) => photo.id === dialog?.photoId)
  const onCreate = () => openDialog({ type: 'create' })
  const onRename = (gallery) => { setRenameValue(gallery.title); openDialog({ type: 'rename', gallery }) }
  const onEditCover = (gallery) => openDialog({ type: 'cover', gallery })

  return (
    <PageTransition>
      <AdminWorkspace galleries={galleries} selectedId={selectedId} loading={loading} error={error} notice={notice} busy={busy} onSelect={selectGallery} onCreate={onCreate} onSignOut={signOut} onMenu={() => openDialog({ type: 'navigation' })} onRename={onRename} onEditCover={onEditCover} onStatus={handleStatus} onDelete={handleDelete} onPhoto={(photo) => openDialog({ type: 'photo', photoId: photo.id })} onPhotoDelete={(photo) => openDialog({ type: 'photo', photoId: photo.id, confirmDelete: true })} onTrash={() => openDialog({ type: 'trash' })} onUpload={() => openDialog({ type: 'upload' })} onRetry={refresh} />
      <AnimatePresence mode="wait">
      {dialog && (dialog.type !== 'photo' || selectedPhoto) && (dialog.type !== 'upload' || selected) && <AdminDialog key={`${dialog.type}-${dialog.gallery?.id || dialog.photoId || (dialog.type === 'upload' ? selectedId : '')}`} title={{ create: 'Create Gallery', rename: 'Rename Gallery', navigation: 'My Galleries', upload: 'Upload Photos', photo: 'Photograph', cover: 'Edit Gallery Cover', trash: 'Trash', trashGallery: 'Move Gallery to Trash' }[dialog.type]} onClose={closeDialog} dismissible={!busy} wide={['photo', 'trash'].includes(dialog.type)}>
        {dialogError && <div className="admin-feedback admin-feedback-error" role="alert"><p>{dialogError}</p>{dialogRequiresRefresh && <button className="admin-button-secondary" disabled={busy} onClick={async () => { setDialog(null); await refresh() }}>Refresh galleries</button>}</div>}
        {dialog.type === 'trashGallery' && <div className="admin-simple-form"><p>Move “{dialog.gallery.title}” to Trash? Its photographs, cover, and publication status will be preserved. You can restore it later.</p><div className="admin-form-actions"><button className="admin-button-secondary" disabled={busy} onClick={closeDialog}>Cancel</button><button className="admin-button-danger" disabled={busy || dialogRequiresRefresh} onClick={() => confirmGalleryTrash(dialog.gallery)}>{busy ? 'Moving…' : 'Move Gallery to Trash'}</button></div></div>}
        {dialog.type === 'trash' && <AdminTrash onSavingChange={setBusy} onChanged={refresh} />}
        {dialog.type === 'create' && <AdminGalleryForm onSavingChange={setBusy} onCancel={closeDialog} onSaved={async () => { setDialog(null); setNotice('Gallery created.'); await refresh() }} />}
        {dialog.type === 'cover' && <AdminCoverEditor gallery={dialog.gallery} onSavingChange={setBusy} onCancel={closeDialog} onSaved={async () => { setDialog(null); setNotice('Gallery cover updated.'); await refresh() }} />}
        {dialog.type === 'rename' && <form className="admin-simple-form" onSubmit={(event) => { event.preventDefault(); runAction(() => renameGallery(dialog.gallery.id, renameValue), 'Gallery renamed. Its URL is unchanged.', true) }}><label>Gallery name<input autoFocus required value={renameValue} onChange={(event) => setRenameValue(event.target.value)} /></label><p>The existing gallery URL will stay the same.</p><button className="admin-button-primary" disabled={busy || !renameValue.trim()}>{busy ? 'Saving…' : 'Save Changes'}</button></form>}
        {dialog.type === 'navigation' && <AdminSidebar galleries={galleries} selectedId={selectedId} onSelect={selectGallery} onCreate={onCreate} onTrash={() => openDialog({ type: 'trash' })} onSignOut={signOut} busy={busy} />}
        {dialog.type === 'upload' && <AdminPhotoUpload gallery={selected} onSavingChange={setBusy} onCancel={closeDialog} onSaved={async (count) => { setDialog(null); setNotice(`${count} photograph${count === 1 ? '' : 's'} added.`); await refresh() }} />}
        {dialog.type === 'photo' && selectedPhoto && <AdminPhotoPreview photo={selectedPhoto} gallery={selected} busy={busy} confirmDelete={dialog.confirmDelete} onSavingChange={setBusy} onRefresh={async () => { setDialog(null); await refresh() }} onSaved={async (kind) => { setDialog(null); setNotice(kind === 'delete' ? 'Photograph moved to Trash. You can restore it later.' : 'Caption updated.'); await refresh() }} onCover={() => runAction(() => setGalleryCover(selected, selectedPhoto.id), 'Gallery cover updated.', true)} />}
      </AdminDialog>}
      </AnimatePresence>
    </PageTransition>
  )
}
