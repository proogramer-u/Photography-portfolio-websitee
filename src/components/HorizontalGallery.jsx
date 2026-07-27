import Header from './Header';
import PageTransition from './PageTransition';

export default function HorizontalGallery({ images }) {
  return (
    <PageTransition>
      <div className="h-screen bg-white flex flex-col overflow-hidden">
        <Header />
        
        {/* Horizontal scrolling container */}
        <main className="flex-1 overflow-x-auto overflow-y-hidden flex items-center snap-x snap-mandatory scrollbar-hide">
          <div className="flex gap-20 px-[10vw] h-full items-center py-8">
            {images.map((img, index) => (
              <div key={img.id || index} className="flex flex-col items-center justify-center snap-center shrink-0 w-[80vw] md:w-[60vw]">
                <img 
                  src={img.url} 
                  alt={img.caption || `Gallery image ${index + 1}`} 
                  className="max-h-[60vh] w-auto object-contain"
                />
                {img.caption && (
                  <h3 className="mt-8 text-xl font-bold text-gray-800 text-center">
                    {img.caption}
                  </h3>
                )}
              </div>
            ))}
          </div>
        </main>

        <footer className="text-center py-6 text-gray-500 shrink-0">
          Copyright © All rights reserved.
        </footer>
      </div>
    </PageTransition>
  )
}
