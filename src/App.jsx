import GalleryPage from './pages/GalleryPage'
import HeroPage from './pages/HeroPage'
import ProjectPage from './pages/ProjectPage'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { projects } from './data/portfolio'
import { useEffect, useState } from 'react'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPage from './pages/AdminPage'
import { supabase } from './lib/supabase'

export default function App() {
  const location = useLocation()
  const [session, setSession] = useState(null)

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HeroPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/project/:slug" element={<ProjectPage />} />
        <Route path="/admin/login" element={<AdminLoginPage session={session} />} />
        <Route path="/admin" element={<AdminPage session={session} />} />
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
