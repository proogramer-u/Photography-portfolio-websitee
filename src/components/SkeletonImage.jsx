import { useCallback, useState } from 'react'
import { motion as Motion, useReducedMotion } from 'framer-motion'
import ImageSkeleton from './ImageSkeleton'
import './image-loading.css'

function LoadingImage({ src, alt, variant, className, ...imageProps }) {
  const [status, setStatus] = useState(src ? 'loading' : 'failed')
  const reduced = useReducedMotion()
  const imageRef = useCallback((image) => {
    // Cached resources may have completed before React attaches load/error handlers.
    if (image?.complete) setStatus(image.naturalWidth > 0 ? 'loaded' : 'failed')
  }, [])

  return (
    <div className={`portfolio-image portfolio-image--${variant} is-${status}`} aria-busy={status === 'loading'}>
      {status === 'loading' && <ImageSkeleton className="portfolio-image-placeholder" />}
      {src && <Motion.img {...imageProps} ref={imageRef} src={src} alt={alt} className={className} aria-hidden={status !== 'loaded'} onLoad={() => setStatus('loaded')} onError={() => setStatus('failed')} initial={{ opacity: 0 }} animate={{ opacity: status === 'loaded' ? 1 : 0 }} transition={{ duration: reduced ? 0 : .25, ease: 'easeOut' }} />}
      {status === 'failed' && <div className="portfolio-image-failure" role="img" aria-label={`${alt || 'Photograph'}: image unavailable`}><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25"><rect x="3" y="3" width="18" height="18" rx="1" /><path d="m3 17 6-6 4 4 3-3 5 5" /><circle cx="8" cy="8" r="1.5" /></svg><span aria-hidden="true">Image unavailable</span></div>}
    </div>
  )
}

export default function SkeletonImage({ src, alt, variant = 'cover', className = '', ...imageProps }) {
  // A new URL starts a fresh lifecycle; old load events cannot reveal a new image.
  return <LoadingImage key={src || 'missing-image'} src={src} alt={alt} variant={variant} className={className} {...imageProps} />
}
