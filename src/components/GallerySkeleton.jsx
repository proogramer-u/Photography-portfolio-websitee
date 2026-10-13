import ImageSkeleton from './ImageSkeleton'
import './image-loading.css'

export default function GallerySkeleton({ count = 4 }) {
  return <><span className="sr-only" role="status">Loading galleries</span>{Array.from({ length: count }, (_, index) => <div key={index} className={`flex-col items-center ${index === 0 ? 'flex' : index === 1 ? 'hidden sm:flex' : 'hidden lg:flex'}`} aria-hidden="true"><ImageSkeleton className="w-full aspect-square" /><ImageSkeleton className="mt-6 h-7 w-1/2" /></div>)}</>
}
