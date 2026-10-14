import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'

export default function HeroPage() {
  return (
    <PageTransition>
      <div style={{ position: 'relative' }}>
        <img
          src="/images/home/_DSC3841.webp"
          alt="Hero"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          style={{ width: '100vw', height: '100vh', objectFit: 'cover', display: 'block' }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}
        >
          <Link to="/gallery" style={{ textDecoration: 'none' }}>
            <h1
              className="transition-all duration-200 ease-in-out hover:!text-[yellow] hover:underline hover:decoration-[yellow]"
              style={{
                fontFamily: `'Constantia Regular'`,
                color: 'white',
                fontSize: '3rem',
                cursor: 'pointer',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              Cokorda Bagus Laksmana Iswara
            </h1>
          </Link>
        </div>
      </div>
    </PageTransition>
  )
}
