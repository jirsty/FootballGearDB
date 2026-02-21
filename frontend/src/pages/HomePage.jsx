import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUnifiedLeaderboard, getHighlights, getWeeks } from '../api'

const STAT_TABS = ['Rushing', 'Passing', 'Receiving', 'Kicking', 'Defense']
const GEAR_FILTERS = ['All Gear', 'Helmets', 'Cleats', 'Gloves', 'Visors']
const GEAR_FILTER_MAP = {
  'All Gear': null,
  'Helmets': 'helmet',
  'Cleats': 'cleats',
  'Gloves': 'gloves',
  'Visors': 'visor',
}

const CATEGORY_ICONS = {
  helmet: { emoji: '🏈', color: '#FF6B35' },
  cleats: { emoji: '👟', color: '#00E5A0' },
  gloves: { emoji: '🧤', color: '#4DA8FF' },
  visor: { emoji: '🥽', color: '#B266FF' },
  facemask: { emoji: '🏈', color: '#FF4D6A' },
}

const HIGHLIGHT_ICONS = ['🏃', '🧤', '🥾', '🎯']

function StatCard({ highlight, index }) {
  return (
    <Link
      to={`/gear/${highlight.gear_id}`}
      className="group relative flex-1 min-w-[200px] rounded-2xl p-6 border border-border-subtle overflow-hidden transition-all duration-400 cursor-pointer hover:-translate-y-1 animate-fade-slide-up"
      style={{
        background: 'linear-gradient(135deg, rgba(30,30,42,1) 0%, rgba(20,20,28,1) 100%)',
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <div className="text-[28px] mb-3">{HIGHLIGHT_ICONS[index] || '📊'}</div>
      <div className="font-label text-[11px] uppercase tracking-[2px] text-text-tertiary mb-1.5">
        {highlight.label}
      </div>
      <div className="font-heading text-[28px] font-bold text-accent-primary mb-1 tracking-[-0.5px]">
        {highlight.value}
      </div>
      <div className="font-body text-sm text-text-secondary">
        {highlight.gear_name}
      </div>
      <div className="absolute top-0 right-0 w-20 h-20 rounded-br-none"
        style={{ background: 'radial-gradient(circle at top right, rgba(255,107,53,0.08) 0%, transparent 70%)' }} />
    </Link>
  )
}

function LeaderboardRow({ item, index, maxStat }) {
  const cat = CATEGORY_ICONS[item.category] || CATEGORY_ICONS.helmet
  const barWidth = maxStat > 0 ? (item.total_stat / maxStat) * 100 : 0
  const rank = index + 1

  return (
    <Link
      to={`/gear/${item.gear_id}`}
      className="group flex items-center gap-4 px-5 py-4 rounded-lg border-b border-border-subtle transition-all duration-300 hover:bg-[rgba(255,107,53,0.06)] cursor-pointer animate-fade-slide-up"
      style={{ animationDelay: `${0.3 + index * 0.08}s` }}
    >
      {/* Rank */}
      <div className="font-heading text-2xl font-bold w-9 text-center shrink-0"
        style={{ color: rank <= 3 ? '#FF6B35' : 'rgba(255,255,255,0.25)' }}>
        {rank}
      </div>

      {/* Gear icon */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{
          background: `linear-gradient(135deg, ${cat.color}22, ${cat.color}08)`,
          border: `1px solid ${cat.color}33`,
        }}>
        {cat.emoji}
      </div>

      {/* Name + progress bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-body text-[15px] font-semibold text-text-primary truncate">
            {item.brand} {item.model}
          </span>
          <span className="font-label text-[10px] uppercase tracking-[1.5px] rounded px-2 py-0.5 shrink-0"
            style={{ color: cat.color, background: `${cat.color}15` }}>
            {item.category}
          </span>
        </div>
        <div className="relative h-1 rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="absolute left-0 top-0 bottom-0 rounded-sm transition-all duration-1000"
            style={{
              width: `${barWidth}%`,
              background: `linear-gradient(90deg, ${cat.color}, ${cat.color}88)`,
            }} />
        </div>
      </div>

      {/* Stat value */}
      <div className="text-right shrink-0">
        <div className="font-heading text-xl font-bold text-text-primary">
          {item.total_stat.toLocaleString()}
        </div>
        <div className="font-label text-[11px] text-text-muted uppercase tracking-[1px]">
          {item.stat_name.replace(/_/g, ' ')}
        </div>
      </div>

      {/* Weekly change */}
      {item.weekly_change > 0 && (
        <div className="font-body text-[13px] font-semibold text-accent-success rounded-md px-2.5 py-1 shrink-0"
          style={{ background: 'rgba(0,229,160,0.08)' }}>
          +{item.weekly_change.toLocaleString()}
        </div>
      )}

      {/* Player count */}
      <div className="font-body text-xs text-text-tertiary shrink-0 w-16 text-right hidden lg:block">
        {item.player_count} players
      </div>

      {/* Arrow */}
      <div className="text-sm text-text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 opacity-30">
        →
      </div>
    </Link>
  )
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('Rushing')
  const [activeFilter, setActiveFilter] = useState('All Gear')
  const [timeRange, setTimeRange] = useState('season')
  const [leaderboard, setLeaderboard] = useState(null)
  const [highlights, setHighlights] = useState([])
  const [availableWeeks, setAvailableWeeks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWeeks().then((data) => {
      setAvailableWeeks(data.weeks?.['2024'] || [])
    }).catch(console.error)

    getHighlights({ season: 2024 })
      .then(setHighlights)
      .catch(console.error)
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {
      stat_category: activeTab.toLowerCase(),
      season: 2024,
      limit: 10,
    }
    const gearType = GEAR_FILTER_MAP[activeFilter]
    if (gearType) params.gear_type = gearType
    if (timeRange !== 'season') params.week = parseInt(timeRange)

    getUnifiedLeaderboard(params)
      .then(setLeaderboard)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [activeTab, activeFilter, timeRange])

  const maxStat = leaderboard?.items?.[0]?.total_stat || 1

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-10 animate-fade-slide-up">
        <h1 className="font-heading text-5xl font-bold leading-[1.1] mb-2 tracking-[-0.5px]">
          WHICH GEAR
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #FF6B35, #FF4D6A)' }}> DOMINATES </span>
          THE FIELD?
        </h1>
        <p className="font-body text-base text-text-tertiary max-w-[500px]">
          Real-time NFL stats ranked by the gear players wear. Updated every game day.
        </p>
      </div>

      {/* Weekly Highlight Cards */}
      {highlights.length > 0 && (
        <div className="flex gap-4 mb-10 flex-wrap">
          {highlights.map((h, i) => (
            <StatCard key={i} highlight={h} index={i} />
          ))}
        </div>
      )}

      {/* Leaderboard Section */}
      <div className="rounded-[20px] overflow-hidden border border-border-subtle"
        style={{ background: 'linear-gradient(135deg, rgba(25,25,38,0.8) 0%, rgba(18,18,28,0.9) 100%)', backdropFilter: 'blur(20px)' }}>

        {/* Leaderboard Header */}
        <div className="px-7 pt-6 flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-[0.5px] mb-4">
              GEAR LEADERBOARD
            </h2>
            {/* Stat Category Tabs */}
            <div className="flex gap-1 flex-wrap">
              {STAT_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="font-label text-xs uppercase tracking-[1.5px] font-semibold px-4 py-2 rounded-lg border-none cursor-pointer transition-all duration-300"
                  style={{
                    background: activeTab === tab ? 'rgba(255,107,53,0.15)' : 'transparent',
                    color: activeTab === tab ? '#FF6B35' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Gear Filter + Time Range */}
          <div className="flex gap-2 items-center flex-wrap justify-end">
            {GEAR_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="font-body text-xs font-medium px-3.5 py-1.5 rounded-full cursor-pointer transition-all duration-300"
                style={{
                  border: activeFilter === f ? '1px solid rgba(255,107,53,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  background: activeFilter === f ? 'rgba(255,107,53,0.1)' : 'transparent',
                  color: activeFilter === f ? '#FF6B35' : 'rgba(255,255,255,0.4)',
                }}
              >
                {f}
              </button>
            ))}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="font-body text-xs font-medium px-3.5 py-1.5 rounded-full cursor-pointer outline-none"
              style={{
                border: '1px solid rgba(255,107,53,0.3)',
                background: 'rgba(255,107,53,0.08)',
                color: '#FF6B35',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            >
              <option value="season">Season 2024</option>
              {availableWeeks.map((w) => (
                <option key={w} value={w}>Week {w}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Column Headers */}
        <div className="hidden md:flex items-center gap-4 px-5 pt-4 pb-2 mx-2 mt-3">
          <div className="w-9 text-center">
            <span className="font-label text-[10px] uppercase tracking-[1.5px] text-text-muted">#</span>
          </div>
          <div className="w-11" />
          <div className="flex-1">
            <span className="font-label text-[10px] uppercase tracking-[1.5px] text-text-muted">Gear</span>
          </div>
          <div className="text-right w-20">
            <span className="font-label text-[10px] uppercase tracking-[1.5px] text-text-muted">Total</span>
          </div>
          <div className="w-16 text-center">
            <span className="font-label text-[10px] uppercase tracking-[1.5px] text-text-muted">&#916; Week</span>
          </div>
          <div className="w-16 text-right hidden lg:block">
            <span className="font-label text-[10px] uppercase tracking-[1.5px] text-text-muted">Worn By</span>
          </div>
          <div className="w-4" />
        </div>

        {/* Leaderboard Rows */}
        <div className="px-2 pb-4">
          {loading ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
              ))}
            </div>
          ) : leaderboard?.items?.length > 0 ? (
            leaderboard.items.map((item, i) => (
              <LeaderboardRow key={item.gear_id} item={item} index={i} maxStat={maxStat} />
            ))
          ) : (
            <div className="p-8 text-center text-text-tertiary font-body text-sm">
              No data available for this selection.
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="px-7 py-5 border-t border-border-subtle flex justify-between items-center">
          <span className="font-body text-[13px] text-text-muted">
            Showing {leaderboard?.items?.length || 0} of {leaderboard?.total_count || 0} gear items
          </span>
          <button className="font-label text-[13px] uppercase tracking-[1.5px] font-semibold px-6 py-2.5 rounded-[10px] cursor-pointer transition-all duration-300"
            style={{
              border: '1px solid rgba(255,107,53,0.3)',
              background: 'rgba(255,107,53,0.08)',
              color: '#FF6B35',
            }}>
            View Full Leaderboard →
          </button>
        </div>
      </div>

      {/* Gear Matchup Teaser */}
      {leaderboard?.items?.length >= 2 && (
        <div className="mt-8 rounded-[20px] p-8 border border-border-subtle flex flex-col md:flex-row items-center justify-between animate-fade-slide-up stagger-8"
          style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.06) 0%, rgba(18,18,28,0.9) 50%, rgba(77,168,255,0.06) 100%)' }}>
          <div className="text-center flex-1">
            <div className="text-4xl mb-2">{CATEGORY_ICONS[leaderboard.items[0].category]?.emoji || '🏈'}</div>
            <div className="font-heading text-lg font-bold text-accent-primary">
              {leaderboard.items[0].brand} {leaderboard.items[0].model}
            </div>
            <div className="font-body text-[13px] text-text-tertiary">
              {leaderboard.items[0].total_stat.toLocaleString()} {leaderboard.stat_unit}
            </div>
          </div>

          <div className="text-center px-6 my-4 md:my-0">
            <div className="font-heading text-sm uppercase tracking-[3px] text-text-muted mb-1">
              Sunday Matchup
            </div>
            <div className="font-heading text-[32px] font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #FF6B35, #fff, #4DA8FF)' }}>
              VS
            </div>
            <div className="font-label text-[11px] uppercase tracking-[1.5px] text-text-muted mt-1">
              Who wins this week?
            </div>
          </div>

          <div className="text-center flex-1">
            <div className="text-4xl mb-2">{CATEGORY_ICONS[leaderboard.items[1].category]?.emoji || '🏈'}</div>
            <div className="font-heading text-lg font-bold text-accent-info">
              {leaderboard.items[1].brand} {leaderboard.items[1].model}
            </div>
            <div className="font-body text-[13px] text-text-tertiary">
              {leaderboard.items[1].total_stat.toLocaleString()} {leaderboard.stat_unit}
            </div>
          </div>
        </div>
      )}

      {/* Shop CTA Banner */}
      <div className="mt-8 rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-slide-up"
        style={{
          background: 'linear-gradient(90deg, rgba(255,107,53,0.12) 0%, rgba(255,77,106,0.08) 100%)',
          border: '1px solid rgba(255,107,53,0.15)',
          animationDelay: '1s',
        }}>
        <div>
          <div className="font-heading text-lg font-bold mb-1">GEAR UP LIKE THE PROS</div>
          <div className="font-body text-sm text-text-tertiary">
            Shop the #1 ranked gear this season. Links to trusted retailers.
          </div>
        </div>
        <button className="font-heading text-sm uppercase tracking-[1.5px] font-bold px-8 py-3 rounded-xl border-none cursor-pointer transition-all duration-300 whitespace-nowrap text-white"
          style={{
            background: 'linear-gradient(135deg, #FF6B35, #FF4D6A)',
            boxShadow: '0 4px 24px rgba(255,107,53,0.3)',
          }}>
          Shop Now →
        </button>
      </div>
    </div>
  )
}
