import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPlayers } from '../api'

const POSITIONS = ['All', 'QB', 'RB', 'WR', 'TE', 'K', 'DE', 'LB', 'CB', 'S']

export default function PlayersPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState('All')

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (position !== 'All') params.position = position
    getPlayers(params)
      .then(setPlayers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [search, position])

  // Debounce search
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  return (
    <div>
      {/* Header */}
      <div className="mb-8 animate-fade-slide-up">
        <h1 className="font-heading text-4xl font-bold text-text-primary tracking-[-0.5px] mb-2">
          PLAYERS
        </h1>
        <p className="font-body text-base text-text-tertiary">
          Browse NFL players and explore their gear loadouts
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border-subtle p-5 mb-6 animate-fade-slide-up stagger-1"
        style={{ background: 'linear-gradient(135deg, rgba(25,25,38,0.8) 0%, rgba(18,18,28,0.9) 100%)' }}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search players..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full font-body text-sm rounded-xl pl-10 pr-4 py-2.5 border outline-none transition-colors"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.08)',
                color: '#fff',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(255,107,53,0.3)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
            />
          </div>

          {/* Position pills */}
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className="font-label text-[11px] uppercase tracking-[1.5px] font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-300 cursor-pointer"
                style={{
                  background: position === pos ? 'rgba(255,107,53,0.12)' : 'transparent',
                  borderColor: position === pos ? 'rgba(255,107,53,0.4)' : 'rgba(255,255,255,0.08)',
                  color: position === pos ? '#FF6B35' : 'rgba(255,255,255,0.4)',
                }}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-body text-sm text-text-tertiary">
          {loading ? 'Loading...' : `${players.length} player${players.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Player grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      ) : players.length === 0 ? (
        <div className="rounded-2xl border border-border-subtle p-12 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(25,25,38,0.8) 0%, rgba(18,18,28,0.9) 100%)' }}>
          <p className="font-body text-text-tertiary">No players found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {players.map((player, i) => (
            <Link
              key={player.id}
              to={`/player/${player.id}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-border-subtle transition-all duration-300 hover:-translate-y-0.5 group"
              style={{
                background: 'rgba(255,255,255,0.02)',
                animationName: i < 12 ? 'fadeSlideUp' : undefined,
                animationDuration: '0.5s',
                animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                animationFillMode: 'both',
                animationDelay: i < 12 ? `${0.1 + i * 0.05}s` : undefined,
              }}
            >
              <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                {player.headshot_url ? (
                  <img src={player.headshot_url} alt=""
                    className="w-full h-full object-cover" />
                ) : (
                  <span className="text-text-muted text-xl">?</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-body text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors truncate">
                  {player.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-label text-[10px] uppercase tracking-[1.5px] text-accent-primary">
                    {player.position}
                  </span>
                  <span className="font-label text-[10px] uppercase tracking-[1.5px] text-text-tertiary">
                    {player.team}
                  </span>
                </div>
              </div>
              <div className="text-text-muted group-hover:text-text-tertiary group-hover:translate-x-1 transition-all duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
