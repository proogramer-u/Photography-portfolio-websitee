import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import Header from './Header'
import PageTransition from './PageTransition'
import ProjectGallerySkeleton from './ProjectGallerySkeleton'
import SkeletonImage from './SkeletonImage'
import './horizontal-navigation.css'

export default function HorizontalGallery({ images, isLiveUnavailable = false, isLoading = false, errorMessage = '', onRetry }) {
  const scroller = useRef(null)
  const slides = useRef([])
  const active = useRef(0)
  const lock = useRef(0)
  const pointer = useRef(null)
  const lastScroll = useRef(-Infinity)
  const [current, setCurrent] = useState(0)
  const reduced = useReducedMotion()
  const navigate = useCallback((direction) => {
    if (performance.now() < lock.current) return false
    const next = Math.min(images.length - 1, Math.max(0, active.current + direction))
    const slide = slides.current[next]
    if (!slide || next === active.current) return false
    const frame = scroller.current.getBoundingClientRect()
    const target = slide.getBoundingClientRect()
    lock.current = performance.now() + (reduced ? 0 : 500)
    active.current = next
    setCurrent(next)
    scroller.current.scrollTo({ left: scroller.current.scrollLeft + target.left + target.width / 2 - frame.left - frame.width / 2, behavior: reduced ? 'auto' : 'smooth' })
    return true
  }, [images.length, reduced])
  useEffect(() => {
    const element = scroller.current
    let timer
    const settle = () => {
      const center = element.getBoundingClientRect().left + element.clientWidth / 2
      let nearest = 0; let distance = Infinity
      slides.current.slice(0, images.length).forEach((slide, index) => {
        if (!slide) return
        const rect = slide.getBoundingClientRect(); const gap = Math.abs(rect.left + rect.width / 2 - center)
        if (gap < distance) { nearest = index; distance = gap }
      })
      active.current = nearest
      setCurrent(nearest)
      lock.current = 0
    }
    const scroll = () => { lastScroll.current = performance.now(); clearTimeout(timer); timer = setTimeout(settle, 140) }
    element.addEventListener('scroll', scroll, { passive: true })
    return () => { element.removeEventListener('scroll', scroll); clearTimeout(timer) }
  }, [images.length])

  // Leave trackpad horizontal motion, pinch/zoom, and unfocused page scrolling native.
  useEffect(() => {
    const element = scroller.current
    const wheel = (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.deltaX || Math.abs(event.deltaY) < 40 || !element.contains(document.activeElement) || element.scrollWidth <= element.clientWidth) return
      const direction = Math.sign(event.deltaY)
      const possible = direction > 0 ? active.current < images.length - 1 : active.current > 0
      if (possible) { event.preventDefault(); navigate(direction) }
    }
    element.addEventListener('wheel', wheel, { passive: false })
    return () => element.removeEventListener('wheel', wheel)
  }, [navigate, images.length])

  function tap(event, direction) {
    if (event.detail && (pointer.current?.moved || performance.now() - lastScroll.current < 180)) return
    navigate(direction)
  }
  const keyboard = useCallback((event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return
    const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (direction) { event.preventDefault(); navigate(direction) }
  }, [navigate])
  useEffect(() => {
    const pageKeyboard = (event) => {
      // Desktop page shortcuts must not steal arrows from controls or open menus.
      if (!window.matchMedia('(min-width: 768px) and (pointer: fine)').matches || event.defaultPrevented || document.querySelector('dialog[open], [aria-modal="true"]')) return
      if (event.target?.closest?.('a, button, input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="textbox"]')) return
      keyboard(event)
    }
    window.addEventListener('keydown', pageKeyboard)
    return () => window.removeEventListener('keydown', pageKeyboard)
  }, [keyboard])
  return <PageTransition><div className="h-dvh bg-white flex flex-col overflow-hidden">
    <Header />
    {isLiveUnavailable && <p role="status" className="px-6 text-center text-sm text-gray-500">Live gallery content is temporarily unavailable. Showing the local collection.</p>}
    <main ref={scroller} tabIndex={0} aria-label="Gallery photographs" aria-describedby="photo-navigation-help" onKeyDown={keyboard} className="horizontal-photo-scroller flex-1 min-h-0 overflow-x-auto overflow-y-hidden flex items-center snap-x snap-mandatory scrollbar-hide" aria-busy={isLoading}>
      <span id="photo-navigation-help" className="sr-only">Swipe or scroll sideways. On desktop, use the left and right arrow keys immediately. You can also focus the gallery or use the Previous and Next photograph controls. Mouse wheel navigation is available when focused.</span>
      {isLoading ? <ProjectGallerySkeleton /> : errorMessage ? <div role="alert" className="w-full p-8 text-center text-gray-500"><p>{errorMessage}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-3 min-h-11 underline underline-offset-4">Try again</button>}</div> : <div className="flex gap-20 px-[10vw] h-full items-center py-8">
        {images.map((img, index) => <div ref={(element) => { slides.current[index] = element }} key={img.id || img.url || index} className="flex flex-col items-center justify-center snap-center shrink-0 w-[80vw] md:w-[60vw]">
          <div className="horizontal-photo-stage" onPointerDown={(event) => { pointer.current = { x: event.clientX, y: event.clientY, moved: false } }} onPointerMove={(event) => { if (pointer.current && Math.hypot(event.clientX - pointer.current.x, event.clientY - pointer.current.y) > 8) pointer.current.moved = true }} onPointerCancel={() => { if (pointer.current) pointer.current.moved = true }}>
            <SkeletonImage variant="project" src={img.url} alt={img.caption || `Gallery image ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" fetchPriority={index === 0 ? 'high' : 'auto'} className="max-h-[60vh] w-auto object-contain" />
            <button type="button" className="photo-tap-zone is-previous" aria-label={`Previous photograph from photo ${index + 1}`} disabled={index === 0} onClick={(event) => tap(event, -1)}><span aria-hidden="true">‹</span></button>
            <button type="button" className="photo-tap-zone is-next" aria-label={`Next photograph from photo ${index + 1}`} disabled={index === images.length - 1} onClick={(event) => tap(event, 1)}><span aria-hidden="true">›</span></button>
          </div>
          {img.caption && <h3 className="mt-8 text-xl font-bold text-gray-800 text-center">{img.caption}</h3>}
        </div>)}
      </div>}
    </main>
    {!isLoading && images.length > 0 && <span className="sr-only" role="status" aria-live="polite">Photograph {current + 1} of {images.length}</span>}
    <footer className="text-center py-6 text-gray-500 shrink-0">Copyright © All rights reserved.</footer>
  </div></PageTransition>
}
