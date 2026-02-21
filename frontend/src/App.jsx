import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import GearDetailPage from './pages/GearDetailPage'
import PlayerPage from './pages/PlayerPage'
import PlayersPage from './pages/PlayersPage'
import MatchupsPage from './pages/MatchupsPage'
import ShopPage from './pages/ShopPage'
import NotFoundPage from './pages/NotFoundPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(180deg, #0D0D14 0%, #131320 50%, #0D0D14 100%)' }}>
      {/* Atmospheric background elements */}
      <div className="fixed top-[-200px] right-[-200px] w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.04) 0%, transparent 70%)' }} />
      <div className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,229,160,0.03) 0%, transparent 70%)' }} />

      <ScrollToTop />
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-8 relative z-[1]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gear/:gearId" element={<GearDetailPage />} />
          <Route path="/player/:playerId" element={<PlayerPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/matchups" element={<MatchupsPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
