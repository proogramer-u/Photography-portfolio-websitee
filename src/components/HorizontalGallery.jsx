import Header from './Header';
import PageTransition from './PageTransition';
import ProjectGallerySkeleton from './ProjectGallerySkeleton';
import SkeletonImage from './SkeletonImage';

export default function HorizontalGallery({ images, isLiveUnavailable = false, isLoading = false, errorMessage = '', onRetry }) {
  return (
    <PageTransition>
      <div className="h-screen bg-white flex flex-col overflow-hidden">
        <Header />
        {isLiveUnavailable && <p role="status" className="px-6 text-center text-sm text-gray-500">Live gallery content is temporarily unavailable. Showing the local collection.</p>}
        
        {/* Horizontal scrolling container */}
        <main className="flex-1 overflow-x-auto overflow-y-hidden flex items-center snap-x snap-mandatory scrollbar-hide" aria-busy={isLoading}>
          {isLoading ? <ProjectGallerySkeleton /> : errorMessage ? <div role="alert" className="w-full p-8 text-center text-gray-500"><p>{errorMessage}</p>{onRetry && <button type="button" onClick={onRetry} className="mt-3 min-h-11 underline underline-offset-4">Try again</button>}</div> :
          <div className="flex gap-20 px-[10vw] h-full items-center py-8">
            {images.map((img, index) => (
              <div key={img.id || index} className="flex flex-col items-center justify-center snap-center shrink-0 w-[80vw] md:w-[60vw]">
                <SkeletonImage
                  variant="project"
                  src={img.url} 
                  alt={img.caption || `Gallery image ${index + 1}`} 
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  className="max-h-[60vh] w-auto object-contain"
                />
                {img.caption && (
                  <h3 className="mt-8 text-xl font-bold text-gray-800 text-center">
                    {img.caption}
                  </h3>
                )}
              </div>
            ))}
          </div>}
        </main>

        <footer className="text-center py-6 text-gray-500 shrink-0">
          Copyright © All rights reserved.
        </footer>
      </div>
    </PageTransition>
  )
}
