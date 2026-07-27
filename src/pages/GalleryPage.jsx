import Header from "../components/Header"
import { Link } from "react-router-dom"
import PageTransition from "../components/PageTransition"
import { projects } from "../data/portfolio"

export default function GalleryPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {projects.map((item) => (
              <Link to={`/project-${item.id}`} key={item.id} className="flex flex-col items-center group cursor-pointer" style={{ textDecoration: 'none' }}>
                <div className="w-full aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h2 className="mt-6 text-lg font-bold underline decoration-2 underline-offset-4 hover:text-gray-600 transition-colors text-black">
                  {item.title}
                </h2>
              </Link>
            ))}
          </div>

          <div className="flex flex-col items-center gap-8 mt-32 mb-12 text-gray-500 font-bold text-2xl w-full">
            <div className="flex gap-12 justify-center flex-wrap">
              <a href="https://api.whatsapp.com/send/?phone=6281246951339&text&type=phone_number&app_absent=0" target="_blank" rel="noreferrer" className="hover:text-gray-800 transition-colors">Whatsapp</a>
              <a href="https://www.instagram.com/cokordabagoess/" target="_blank" rel="noreferrer" className="hover:text-gray-800 transition-colors">Instagram</a>
            </div>
            <p className="text-xl mt-4 text-gray-400">Copyright © All rights reserved.</p>
          </div>
        </main>
      </div>
    </PageTransition>
  )
}
