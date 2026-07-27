import GalleryPage from './pages/GalleryPage'
import HeroPage from './pages/HeroPage'
import ProjectPage from './pages/ProjectPage'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { projects } from './data/portfolio'

export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HeroPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        {projects.map((project) => (
          <Route
            key={project.id}
            path={`/project-${project.id}`}
            element={<ProjectPage projectId={String(project.id)} />}
          />
        ))}
      </Routes>
    </AnimatePresence>
  )
}
