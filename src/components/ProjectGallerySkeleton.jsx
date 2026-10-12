import ImageSkeleton from './ImageSkeleton'
import './image-loading.css'

export default function ProjectGallerySkeleton({ count = 4 }) {
  return <div className="flex gap-20 px-[10vw] h-full items-center py-8" role="status" aria-label="Loading gallery photographs">{Array.from({ length: count }, (_, index) => <div key={index} className="flex flex-col items-center justify-center snap-center shrink-0 w-[80vw] md:w-[60vw]" aria-hidden="true"><ImageSkeleton className="project-image-placeholder" /><ImageSkeleton className="mt-8 h-7 w-24" /></div>)}</div>
}
