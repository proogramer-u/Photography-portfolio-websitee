import { Navigate } from "react-router-dom"
import HorizontalGallery from "../components/HorizontalGallery"
import { projects } from "../data/portfolio"

export default function ProjectPage({ projectId }) {
  const project = projects.find((item) => String(item.id) === projectId)

  if (!project) {
    return <Navigate to="/gallery" replace />
  }

  return <HorizontalGallery images={project.images} />
}
