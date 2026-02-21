import { Link } from 'react-router-dom'

export default function MatchupsPage() {
  return (
    <div>
      <div className="mb-8 animate-fade-slide-up">
        <h1 className="font-heading text-4xl font-bold text-text-primary tracking-[-0.5px] mb-2">
          GEAR MATCHUPS
        </h1>
        <p className="font-body text-base text-text-tertiary">
          Head-to-head gear battles from this week's NFL games
        </p>
      </div>

      <div className="rounded-2xl border border-border-subtle p-12 text-center animate-fade-slide-up stagger-1"
        style={{ background: 'linear-gradient(135deg, rgba(25,25,38,0.8) 0%, rgba(18,18,28,0.9) 100%)' }}>
        <div className="text-5xl mb-4">🏈</div>
        <h2 className="font-heading text-2xl font-bold text-text-primary mb-2">
          COMING SOON
        </h2>
        <p className="font-body text-sm text-text-tertiary max-w-md mx-auto mb-6">
          Gear matchups will show head-to-head battles between gear items based on the players wearing them in each week's NFL games. Which helmet will rush for more yards this Sunday?
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-label text-[12px] uppercase tracking-[1.5px] font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 hover:scale-105"
          style={{
            background: 'rgba(255,107,53,0.1)',
            border: '1px solid rgba(255,107,53,0.3)',
            color: '#FF6B35',
          }}
        >
          View Leaderboard
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
