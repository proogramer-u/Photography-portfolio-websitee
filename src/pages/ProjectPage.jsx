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

  useEffect(() => {
    let isCurrent = true
    getPublishedGallery(requestedSlug)
      .then((data) => {
        if (isCurrent && data) setProject(data)
      })
      .catch(() => {})
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [requestedSlug])

  if (isLoading && !project) return <p className="p-8">Loading gallery...</p>
  if (!project) {
    return <Navigate to="/gallery" replace />
  }

  return <HorizontalGallery images={project.images} />
}
