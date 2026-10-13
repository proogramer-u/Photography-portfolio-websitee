import { useEffect, useState } from 'react'
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
import { listAllGalleries } from '../lib/galleryApi'
import { renameGallery, setGalleryStatus, setGalleryCover, deleteGalleryRecord } from '../lib/adminGalleryApi'
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

  function openDialog(next) { if (!busy) { setDialogError(''); setNotice(''); setDialog(next) } }
  function closeDialog() { if (!busy) setDialog(null) }

  async function runAction(action, message, close = false) {
    setBusy(true)
    setError('')
    setNotice('')
    setDialogError('')
    try {
      await action()
      setNotice(message)
      if (close) setDialog(null)
      await refresh()
    } catch {
      const message = 'Could not save this change. Check your access and try again.'
      if (dialog) setDialogError(message)
      else setError(message)
    } finally { setBusy(false) }
  }

  function handleDelete(gallery) {
    if (!window.confirm(`Delete “${gallery.title}” and its photo records? This cannot be undone. Uploaded files will remain in Storage.`)) return
    runAction(async () => {
      await deleteGalleryRecord(gallery.id)
      if (selectedId === gallery.id) setSearchParams({})
    }, 'Gallery deleted.')
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
      <AdminWorkspace galleries={galleries} selectedId={selectedId} loading={loading} error={error} notice={notice} busy={busy} onSelect={selectGallery} onCreate={onCreate} onSignOut={signOut} onMenu={() => openDialog({ type: 'navigation' })} onRename={onRename} onEditCover={onEditCover} onStatus={handleStatus} onDelete={handleDelete} onPhoto={(photo) => openDialog({ type: 'photo', photoId: photo.id })} onUpload={() => openDialog({ type: 'upload' })} onRetry={refresh} />
      <AnimatePresence mode="wait">
      {dialog && (dialog.type !== 'photo' || selectedPhoto) && (dialog.type !== 'upload' || selected) && <AdminDialog key={`${dialog.type}-${dialog.gallery?.id || dialog.photoId || (dialog.type === 'upload' ? selectedId : '')}`} title={{ create: 'Create Gallery', rename: 'Rename Gallery', navigation: 'My Galleries', upload: 'Upload Photos', photo: 'Photograph', cover: 'Edit Gallery Cover' }[dialog.type]} onClose={closeDialog} dismissible={!busy} wide={dialog.type === 'photo'}>
        {dialogError && <p className="admin-feedback admin-feedback-error" role="alert">{dialogError}</p>}
        {dialog.type === 'create' && <AdminGalleryForm onSavingChange={setBusy} onCancel={closeDialog} onSaved={async () => { setDialog(null); setNotice('Gallery created.'); await refresh() }} />}
        {dialog.type === 'cover' && <AdminCoverEditor gallery={dialog.gallery} onSavingChange={setBusy} onCancel={closeDialog} onSaved={async () => { setDialog(null); setNotice('Gallery cover updated.'); await refresh() }} />}
        {dialog.type === 'rename' && <form className="admin-simple-form" onSubmit={(event) => { event.preventDefault(); runAction(() => renameGallery(dialog.gallery.id, renameValue), 'Gallery renamed. Its URL is unchanged.', true) }}><label>Gallery name<input autoFocus required value={renameValue} onChange={(event) => setRenameValue(event.target.value)} /></label><p>The existing gallery URL will stay the same.</p><button className="admin-button-primary" disabled={busy || !renameValue.trim()}>{busy ? 'Saving…' : 'Save Changes'}</button></form>}
        {dialog.type === 'navigation' && <AdminSidebar galleries={galleries} selectedId={selectedId} onSelect={selectGallery} onCreate={onCreate} onSignOut={signOut} busy={busy} />}
        {dialog.type === 'upload' && <AdminPhotoUpload gallery={selected} onSavingChange={setBusy} onCancel={closeDialog} onSaved={async (count) => { setDialog(null); setNotice(`${count} photograph${count === 1 ? '' : 's'} added.`); await refresh() }} />}
        {dialog.type === 'photo' && selectedPhoto && <AdminPhotoPreview photo={selectedPhoto} gallery={selected} busy={busy} onCover={() => runAction(() => setGalleryCover(selected, selectedPhoto.id), 'Gallery cover updated.', true)} />}
      </AdminDialog>}
      </AnimatePresence>
    </PageTransition>
  )
}
