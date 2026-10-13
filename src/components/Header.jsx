import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion as Motion, useIsPresent, useReducedMotion } from 'framer-motion'
import { projects } from '../data/portfolio'
import { listPublishedGalleries } from '../lib/galleryApi'
import PublicFooter from './PublicFooter'
import './public-navigation.css'

function MenuIcon({ close = false }) {
  return <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">{close ? <><path d="m6 6 12 12" /><path d="m6 18 12-12" /></> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}</svg>
}

function NavigationOverlay({ galleries, loadError, onClose, trigger }) {
  const dialog = useRef(null)
  const closeButton = useRef(null)
  const present = useIsPresent()
  const reduced = useReducedMotion()
  useEffect(() => {
    const element = dialog.current
    const opener = trigger.current
    const overflow = document.body.style.overflow
    const padding = document.body.style.paddingRight
    const gap = window.innerWidth - document.documentElement.clientWidth
    element.style.paddingRight = gap ? `${gap}px` : ''
    if (gap && !getComputedStyle(document.documentElement).scrollbarGutter.includes('stable')) document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + gap}px`
    document.body.style.overflow = 'hidden'
    element.showModal()
    closeButton.current.focus()
    return () => {
      element.close()
      document.body.style.overflow = overflow
      document.body.style.paddingRight = padding
      opener?.focus()
    }
  }, [trigger])
  const dismiss = () => { if (present) onClose() }
  const outside = (event) => { if (event.target === event.currentTarget) dismiss() }
  const item = { initial: { opacity: 0, y: reduced ? 0 : 5 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 0 } }
  return createPortal(<dialog ref={dialog} id="public-navigation" className="public-menu-root" aria-label="Portfolio navigation" onCancel={(event) => { event.preventDefault(); dismiss() }}>
    <Motion.div className="public-menu-backdrop" aria-hidden="true" onClick={dismiss} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .22 }} />
    <Motion.section className="public-menu-panel" onClick={outside} initial={{ x: reduced ? 0 : '12%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : .3, ease: [.16, 1, .3, 1] }} inert={!present}>
      <nav className="flex justify-between p-4 items-center shrink-0" aria-label="Site">
        <Link to="/" onClick={dismiss} className="hover:text-[#fcf940] transition-colors">Cokorda Bagus Laksmana Iswara</Link>
        <button ref={closeButton} type="button" onClick={dismiss} aria-label="Close navigation" disabled={!present} className="cursor-pointer"><MenuIcon close /></button>
      </nav>
      <nav aria-label="Galleries" className="flex flex-col items-center gap-6 text-2xl font-bold flex-1 justify-center py-12" onClick={outside}>
        <Motion.div {...item} transition={{ duration: reduced ? 0 : .2 }}><Link to="/gallery" onClick={dismiss} className="hover:text-gray-500 transition-colors underline decoration-1 underline-offset-4">Gallery</Link></Motion.div>
        {loadError && <p role="status" className="text-sm font-normal text-gray-500">Live galleries are temporarily unavailable.</p>}
        {galleries.map((gallery, index) => <Motion.div key={gallery.id} {...item} transition={{ duration: reduced ? 0 : .2, delay: reduced || !present ? 0 : Math.min(index + 1, 8) * .025 }}><Link to={`/project/${gallery.slug || `project-${gallery.id}`}`} onClick={dismiss} className="hover:text-gray-500 transition-colors">{gallery.title}</Link></Motion.div>)}
      </nav>
      <PublicFooter />
    </Motion.section>
  </dialog>, document.body)
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const [galleries, setGalleries] = useState(projects)
  const [loadError, setLoadError] = useState(false)
  const trigger = useRef(null)
  useEffect(() => {
    let current = true
    listPublishedGalleries().then((data) => { if (current) setGalleries(data) }).catch(() => { if (current) setLoadError(true) })
    return () => { current = false }
  }, [])
  return <>
    <nav className="flex justify-between p-4 items-center relative z-50 shrink-0" aria-label="Site">
      <Link to="/" className="hover:text-[#fcf940] transition-colors">Cokorda Bagus Laksmana Iswara</Link>
      <button ref={trigger} type="button" onClick={() => setOpen(true)} aria-label="Open navigation" aria-expanded={open} aria-controls="public-navigation" className="cursor-pointer"><MenuIcon /></button>
    </nav>
    <AnimatePresence>{open && <NavigationOverlay galleries={galleries} loadError={loadError} trigger={trigger} onClose={() => setOpen(false)} />}</AnimatePresence>
  </>
}
