import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle mt-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Top row: Logo + nav links */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #FF4D6A)' }}>
                &#9889;
              </div>
              <span className="font-heading text-sm font-bold tracking-[1px]">
                <span className="text-text-secondary">CLEATS</span>
                <span className="text-accent-primary">&amp;</span>
                <span className="text-text-secondary">STATS</span>
              </span>
            </Link>
            <p className="font-body text-xs text-text-muted max-w-xs">
              Real-time NFL stats ranked by the gear players wear. Updated every game day.
            </p>
          </div>

          <div className="flex gap-8">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[2px] text-text-tertiary mb-2">Explore</p>
              <div className="flex flex-col gap-1.5">
                <Link to="/" className="font-body text-xs text-text-muted hover:text-text-secondary transition-colors">Leaderboard</Link>
                <Link to="/players" className="font-body text-xs text-text-muted hover:text-text-secondary transition-colors">Players</Link>
                <Link to="/shop" className="font-body text-xs text-text-muted hover:text-text-secondary transition-colors">Shop Gear</Link>
                <Link to="/matchups" className="font-body text-xs text-text-muted hover:text-text-secondary transition-colors">Matchups</Link>
              </div>
            </div>
            <div>
              <p className="font-label text-[10px] uppercase tracking-[2px] text-text-tertiary mb-2">Legal</p>
              <div className="flex flex-col gap-1.5">
                <span className="font-body text-xs text-text-muted cursor-default">About</span>
                <span className="font-body text-xs text-text-muted cursor-default">Contact</span>
                <span className="font-body text-xs text-text-muted cursor-default">Privacy Policy</span>
                <span className="font-body text-xs text-text-muted cursor-default">Affiliate Disclosure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border-subtle pt-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="font-body text-[11px] text-text-muted">
              &copy; 2025 Cleats &amp; Stats. Not affiliated with the NFL.
            </span>
            <span className="font-body text-[11px] text-text-muted">
              Data updated weekly during NFL season
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
