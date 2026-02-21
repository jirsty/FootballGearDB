import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { path: '/', label: 'Gear Leaderboard', matchPaths: ['/', '/gear/'] },
  { path: '/matchups', label: 'Matchups', matchPaths: ['/matchups'] },
  { path: '/players', label: 'Players', matchPaths: ['/players', '/player/'] },
  { path: '/shop', label: 'Shop Gear', matchPaths: ['/shop'] },
]

function isActive(pathname, matchPaths) {
  return matchPaths.some((p) => {
    if (p === '/') return pathname === '/'
    return pathname.startsWith(p)
  })
}

export default function Navbar() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle" style={{ background: 'rgba(13,13,20,0.9)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, #FF6B35, #FF4D6A)', boxShadow: '0 4px 20px rgba(255,107,53,0.3)' }}>
            &#9889;
          </div>
          <div className="font-heading text-[22px] font-bold tracking-[1px]">
            <span className="text-text-primary">CLEATS</span>
            <span className="text-accent-primary">&amp;</span>
            <span className="text-text-primary">STATS</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-8 items-center">
          {NAV_LINKS.map(({ path, label, matchPaths }) => {
            const active = isActive(location.pathname, matchPaths)
            return (
              <Link
                key={path}
                to={path}
                className="font-label text-[13px] uppercase tracking-[2px] font-semibold transition-colors duration-300 relative"
                style={{ color: active ? '#FF6B35' : 'rgba(255,255,255,0.45)' }}
              >
                {label}
                {active && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-[2px] rounded-full"
                    style={{ background: 'linear-gradient(90deg, #FF6B35, #FF4D6A)' }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Live indicator */}
        <div className="hidden md:flex items-center gap-1.5 animate-pulse-dot">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-success" />
          <span className="font-label text-[11px] uppercase tracking-[1.5px] text-accent-success">
            Live &middot; Week 18
          </span>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-text-secondary"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border-subtle px-4 sm:px-6 lg:px-10 py-4 space-y-3" style={{ background: 'rgba(13,13,20,0.95)' }}>
          {NAV_LINKS.map(({ path, label, matchPaths }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className="block font-label text-[13px] uppercase tracking-[2px] font-semibold py-2 transition-colors duration-300"
              style={{ color: isActive(location.pathname, matchPaths) ? '#FF6B35' : 'rgba(255,255,255,0.45)' }}
            >
              {label}
            </Link>
          ))}
          <div className="flex items-center gap-1.5 pt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-success" />
            <span className="font-label text-[11px] uppercase tracking-[1.5px] text-accent-success">
              Live &middot; Week 18
            </span>
          </div>
        </div>
      )}
    </header>
  )
}
