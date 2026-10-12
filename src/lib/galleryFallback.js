import { projects } from '../data/portfolio'

export const fallbackGalleries = projects.map((project) => ({
  ...project,
  slug: `project-${project.id}`,
  status: 'published',
}))
