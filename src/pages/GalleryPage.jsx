import Header from "../components/Header"
import PublicFooter from "../components/PublicFooter"
import "../components/public-gallery.css"
import { coverPositionStyle } from "../lib/coverPosition"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import PageTransition from "../components/PageTransition"
import { fallbackGalleries } from "../lib/galleryFallback"
import { listPublishedGalleries } from "../lib/galleryApi"
import GallerySkeleton from "../components/GallerySkeleton"
import SkeletonImage from "../components/SkeletonImage"
import { motion as Motion, useReducedMotion } from "framer-motion"

export default function GalleryPage() {
  const [galleries, setGalleries] = useState(fallbackGalleries)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [requestVersion, setRequestVersion] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    let isCurrent = true
    listPublishedGalleries()
      .then((data) => {
        if (isCurrent && data) setGalleries(data)
      })
      .catch(() => {
        if (isCurrent) setLoadError(true)
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [requestVersion])

  function retry() {
    setLoadError(false)
    setIsLoading(true)
    setRequestVersion((version) => version + 1)
  }

  return (
    <PageTransition>
      <div className="portfolio-gallery-page min-h-dvh bg-white flex flex-col">
        <Header />
        <main className="max-w-7xl w-full mx-auto px-4 pt-12 sm:px-6 lg:px-8 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10" aria-busy={isLoading}>
            {isLoading ? <GallerySkeleton /> : galleries.map((item) => (
              <Link to={`/project/${item.slug || `project-${item.id}`}`} key={item.id} className="flex flex-col items-center group cursor-pointer" style={{ textDecoration: 'none' }}>
                <div className="w-full aspect-square overflow-hidden bg-gray-100">
                  {item.cover && <SkeletonImage
                    src={item.cover}
                    style={coverPositionStyle(item)}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />}
                </div>
                <Motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .25 }} className="mt-6 text-lg font-bold underline decoration-2 underline-offset-4 hover:text-gray-600 transition-colors text-black">
                  {item.title}
                </Motion.h2>
              </Link>
            ))}
          </div>

          {loadError && <div className="mt-8 text-center text-sm text-gray-500" role="alert"><p>Live galleries are temporarily unavailable.{galleries.length ? ' Showing the local collection.' : ' Please try again.'}</p><button type="button" onClick={retry} className="mt-3 min-h-11 underline underline-offset-4">Try again</button></div>}

        </main>
        <PublicFooter className="mt-32" />
      </div>
    </PageTransition>
  )
}
