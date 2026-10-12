import ImageSkeleton from './ImageSkeleton'
import './image-loading.css'

export default function GallerySkeleton({ count = 6 }) {
  return <><span className="sr-only" role="status">Loading galleries</span>{Array.from({ length: count }, (_, index) => <div key={index} className="flex flex-col items-center" aria-hidden="true"><ImageSkeleton className="w-full aspect-square" /><ImageSkeleton className="mt-6 h-7 w-1/2" /></div>)}</>
}
