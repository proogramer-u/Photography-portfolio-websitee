import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { projects } from "../data/portfolio"
import { listPublishedGalleries } from "../lib/galleryApi"

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuGalleries, setMenuGalleries] = useState(projects);
    const [loadError, setLoadError] = useState(false);

    useEffect(() => {
        listPublishedGalleries().then((galleries) => {
            if (galleries) setMenuGalleries(galleries)
        }).catch(() => setLoadError(true))
    }, [])

    return (
        <>
            <nav className="flex justify-between p-4 items-center relative z-50">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-[#fcf940] transition-colors"> Cokorda Bagus Laksmana Iswara</Link>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="cursor-pointer">
                    {isMenuOpen ? (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    )}
                </button>
            </nav>

            {isMenuOpen && (
                <div className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center pt-20">
                    <div className="flex flex-col items-center gap-6 text-2xl font-bold flex-1 justify-center mt-12">
                        <Link to="/gallery" onClick={() => setIsMenuOpen(false)} className="hover:text-gray-500 transition-colors underline decoration-1 underline-offset-4">
                            Gallery
                        </Link>
                        {loadError && <p role="status" className="text-sm font-normal text-gray-500">Live galleries are temporarily unavailable.</p>}
                        {menuGalleries.map((project) => (
                            <Link key={project.id} to={`/project/${project.slug || `project-${project.id}`}`} onClick={() => setIsMenuOpen(false)} className="hover:text-gray-500 transition-colors">
                                {project.title}
                            </Link>
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-6 mb-12 text-gray-500 font-bold text-2xl w-full">
                        <div className="flex gap-8 justify-center">
                            <a href="http://wa.me/6281246951339" target="_blank" rel="noreferrer" className="hover:text-gray-800 transition-colors">Whatsapp</a>
                            <a href="https://www.instagram.com/cokordabagoess/" target="_blank" rel="noreferrer" className="hover:text-gray-800 transition-colors">Instagram</a>
                        </div>
                        <p className="text-xl mt-2 text-gray-400">Copyright © All rights reserved.</p>
                    </div>
                </div>
            )}
        </>
    )
}

export default Header
