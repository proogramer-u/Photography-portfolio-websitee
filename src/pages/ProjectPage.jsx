import { Navigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import HorizontalGallery from "../components/HorizontalGallery"
import { projects } from "../data/portfolio"
import { getPublishedGallery } from "../lib/galleryApi"
import { fallbackGalleries } from "../lib/galleryFallback"

export default function ProjectPage({ projectId }) {
  const { slug } = useParams()
  const requestedSlug = slug || `project-${projectId}`
  const fallbackProject = fallbackGalleries.find((item) => item.slug === requestedSlug) || projects.find((item) => String(item.id) === projectId)
  const [project, setProject] = useState(fallbackProject)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    let isCurrent = true
    getPublishedGallery(requestedSlug)
      .then((data) => {
        if (isCurrent && data) setProject(data)
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
  }, [requestedSlug, requestVersion])

  function retry() {
    setLoadError(false)
    setIsLoading(true)
    setRequestVersion((version) => version + 1)
  }

  if (isLoading) return <HorizontalGallery images={[]} isLoading />
  if (!project) {
    if (loadError) return <HorizontalGallery images={[]} errorMessage="This gallery is temporarily unavailable. Please try again." onRetry={retry} />
    return <Navigate to="/gallery" replace />
  }

  return <HorizontalGallery images={project.images} isLiveUnavailable={loadError} />
}
