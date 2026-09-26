import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import AdminGalleryForm from '../components/AdminGalleryForm'
import { listAllGalleries } from '../lib/galleryApi'
import { supabase } from '../lib/supabase'

export default function AdminPage({ session }) {
  const [galleries, setGalleries] = useState([])
  const [error, setError] = useState('')

  async function loadGalleries() {
    try {
      setGalleries(await listAllGalleries())
    } catch (loadError) {
      setError(loadError.message)
    }
  }

  useEffect(() => {
    if (!session) return
    let isCurrent = true
    listAllGalleries()
      .then((data) => {
        if (isCurrent) setGalleries(data)
      })
      .catch((loadError) => {
        if (isCurrent) setError(loadError.message)
      })

    return () => {
      isCurrent = false
    }
  }, [session])

  if (!session) return <Navigate to="/admin/login" replace />

  async function updateStatus(gallery) {
    const nextStatus = gallery.status === 'published' ? 'draft' : 'published'
    const { error: updateError } = await supabase.from('galleries').update({ status: nextStatus }).eq('id', gallery.id)
    if (updateError) setError(updateError.message)
    else loadGalleries()
  }

  async function deleteGallery(gallery) {
    if (!window.confirm(`Delete ${gallery.title}?`)) return
    const { error: deleteError } = await supabase.from('galleries').delete().eq('id', gallery.id)
    if (deleteError) setError(deleteError.message)
    else loadGalleries()
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-white px-6 py-8 md:px-12">
        <header className="mb-10 flex items-center justify-between gap-4">
          <div><p className="text-sm text-gray-500">Portfolio administration</p><h1 className="text-4xl font-bold">Galleries</h1></div>
          <button onClick={() => supabase.auth.signOut()} className="border border-gray-300 px-4 py-2">Sign out</button>
        </header>
        <div className="mx-auto max-w-5xl space-y-10">
          <AdminGalleryForm onSaved={loadGalleries} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <section className="space-y-3"><h2 className="text-2xl font-bold">Existing galleries</h2>{galleries.map((gallery) => <article key={gallery.id} className="flex flex-wrap items-center gap-4 border-b border-gray-200 py-4"><div className="flex-1"><h3 className="font-bold">{gallery.title}</h3><p className="text-sm text-gray-500">/{gallery.slug} · {gallery.images.length} photos · {gallery.status}</p></div><button onClick={() => updateStatus(gallery)} className="border border-gray-300 px-3 py-2">{gallery.status === 'published' ? 'Unpublish' : 'Publish'}</button><button onClick={() => deleteGallery(gallery)} className="border border-red-300 px-3 py-2 text-red-700">Delete</button></article>)}</section>
        </div>
      </main>
    </PageTransition>
  )
}
