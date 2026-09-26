import { useState } from 'react'
import { processImage, createCoverVariant } from '../lib/imageProcessing'
import { bucket, saveGallery } from '../lib/galleryApi'
import { supabase } from '../lib/supabase'

export default function AdminGalleryForm({ onSaved }) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState('draft')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function handleFiles(event) {
    setFiles(Array.from(event.target.files || []).map((file) => ({ file, caption: '' })))
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
    if (!files.length) {
      setError('Choose at least one photo.')
      return
    }

    setError('')
    setIsSaving(true)
    const uploadedPaths = []

    try {
      const processed = await Promise.all(files.map(async ({ file, caption }, index) => {
        const image = await processImage(file)
        const path = `${crypto.randomUUID()}/${image.name}`
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, image, { contentType: 'image/webp', upsert: false })
        if (uploadError) throw uploadError
        uploadedPaths.push(path)

        let coverPath = null
        if (index === 0) {
          const cover = await createCoverVariant(file)
          coverPath = `${crypto.randomUUID()}/cover-${cover.name}`
          const { error: coverError } = await supabase.storage.from(bucket).upload(coverPath, cover, { contentType: 'image/webp', upsert: false })
          if (coverError) throw coverError
          uploadedPaths.push(coverPath)
        }

        return { storagePath: path, caption, coverPath }
      }))

      await saveGallery({
        gallery: {
          title,
          slug: slug || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          status,
          coverPath: processed[0].coverPath,
        },
        photos: processed,
      })
      setTitle('')
      setSlug('')
      setStatus('draft')
      setFiles([])
      onSaved()
    } catch (saveError) {
      if (uploadedPaths.length) await supabase.storage.from(bucket).remove(uploadedPaths)
      setError(saveError.message || 'Could not save gallery.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border border-gray-200 p-5">
      <h2 className="text-2xl font-bold">New gallery</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold">Title<input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full border border-gray-300 p-3 font-normal" /></label>
        <label className="text-sm font-bold">Slug<input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="generated-from-title" className="mt-2 w-full border border-gray-300 p-3 font-normal" /></label>
      </div>
      <label className="block text-sm font-bold">Visibility<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 border border-gray-300 p-3 font-normal"><option value="draft">Draft</option><option value="published">Published</option></select></label>
      <label className="block text-sm font-bold">Photos<input required multiple accept="image/*" type="file" onChange={handleFiles} className="mt-2 block w-full border border-gray-300 p-3 font-normal" /></label>
      {files.length > 0 && <div className="space-y-2">{files.map((item, index) => <div key={`${item.file.name}-${index}`} className="flex items-center gap-2 border border-gray-100 p-2 text-sm"><span className="w-6">{index + 1}</span><span className="flex-1 truncate">{item.file.name}</span><input value={item.caption} onChange={(event) => setFiles(files.map((file, fileIndex) => fileIndex === index ? { ...file, caption: event.target.value } : file))} placeholder="Caption" className="w-1/3 border border-gray-200 px-2 py-1" /><button type="button" onClick={() => moveFile(index, -1)} disabled={index === 0}>Up</button><button type="button" onClick={() => moveFile(index, 1)} disabled={index === files.length - 1}>Down</button></div>)}</div>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={isSaving} className="bg-black px-5 py-3 text-white disabled:opacity-40">{isSaving ? 'Optimizing and uploading...' : 'Save gallery'}</button>
    </form>
  )
}
