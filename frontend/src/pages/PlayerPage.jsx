import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getPlayer } from '../api'
import AffiliateButton from '../components/AffiliateButton'

const CATEGORY_ICONS = {
  helmet: '🏈',
  cleats: '👟',
  gloves: '🧤',
  visor: '🥽',
  facemask: '🏈',
}

const CATEGORY_COLORS = {
  helmet: '#FF6B35',
  cleats: '#00E5A0',
  gloves: '#4DA8FF',
  visor: '#B266FF',
  facemask: '#FF4D6A',
}

const CATEGORY_ORDER = ['helmet', 'cleats', 'gloves', 'visor', 'facemask']

// Position-aware hero stats: show the most relevant big numbers
function getHeroStats(position, stats) {
  if (!stats || !stats.season) return []
  if (position === 'QB') {
    return [
      { label: 'Pass Yds', value: stats.passing_yards },
      { label: 'Pass TD', value: stats.passing_tds },
      { label: 'Comp/Att', value: `${stats.completions}/${stats.attempts}` },
      { label: 'Rush Yds', value: stats.rushing_yards },
    ]
  }
  if (position === 'RB') {
    return [
      { label: 'Rush Yds', value: stats.rushing_yards },
      { label: 'Rush TD', value: stats.rushing_tds },
      { label: 'Rec Yds', value: stats.receiving_yards },
      { label: 'Fantasy', value: stats.fantasy_points_ppr },
    ]
  }
  if (position === 'WR' || position === 'TE') {
    return [
      { label: 'Rec Yds', value: stats.receiving_yards },
      { label: 'Rec TD', value: stats.receiving_tds },
      { label: 'Rec', value: stats.receptions },
      { label: 'Fantasy', value: stats.fantasy_points_ppr },
    ]
  }
  if (position === 'K') {
    return [
      { label: 'FG Made', value: stats.fg_made },
      { label: 'FG Att', value: stats.fg_att },
      { label: 'FG Long', value: stats.fg_long },
      { label: 'Fantasy', value: stats.fantasy_points_ppr },
    ]
  }
  // DEF positions
  return [
    { label: 'Fantasy', value: stats.fantasy_points_ppr },
    { label: 'Rush Yds', value: stats.rushing_yards },
  ]
}

// Full stat list for the detailed section
function getDetailedStats(position, stats) {
  if (!stats || !stats.season) return []
  const all = []
  if (stats.passing_yards > 0) {
    all.push({ label: 'Passing Yards', value: stats.passing_yards })
    all.push({ label: 'Passing TDs', value: stats.passing_tds })
    if (stats.completions > 0) all.push({ label: 'Comp / Att', value: `${stats.completions}/${stats.attempts}` })
  }
  if (stats.rushing_yards > 0) {
    all.push({ label: 'Rushing Yards', value: stats.rushing_yards })
    all.push({ label: 'Rushing TDs', value: stats.rushing_tds })
    if (stats.carries > 0) all.push({ label: 'Carries', value: stats.carries })
  }
  if (stats.receiving_yards > 0) {
    all.push({ label: 'Receiving Yards', value: stats.receiving_yards })
    all.push({ label: 'Receiving TDs', value: stats.receiving_tds })
    all.push({ label: 'Receptions', value: stats.receptions })
    if (stats.targets > 0) all.push({ label: 'Targets', value: stats.targets })
  }
  if (stats.fg_made > 0) {
    all.push({ label: 'FG Made / Att', value: `${stats.fg_made}/${stats.fg_att}` })
    if (stats.fg_long > 0) all.push({ label: 'FG Long', value: stats.fg_long })
  }
  if (stats.fantasy_points_ppr > 0) {
    all.push({ label: 'Fantasy (PPR)', value: stats.fantasy_points_ppr })
  }
  return all
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border-subtle p-3"
      style={{ background: 'rgba(13,13,20,0.95)', backdropFilter: 'blur(12px)' }}>
      <p className="font-label text-[10px] uppercase tracking-[1.5px] text-text-tertiary mb-1">
        Week {label}
      </p>
      <p className="font-heading text-lg font-bold text-accent-primary">
        {typeof payload[0]?.value === 'number' ? payload[0].value.toLocaleString() : payload[0]?.value}
      </p>
    </div>
  )
}

export default function PlayerPage() {
  const { playerId } = useParams()
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartStat, setChartStat] = useState('rushing_yards')

  useEffect(() => {
    setLoading(true)
    getPlayer(playerId)
      .then((data) => {
        setPlayer(data)
        if (data.position === 'QB') setChartStat('passing_yards')
        else if (data.position === 'K') setChartStat('fg_made')
        else if (['WR', 'TE'].includes(data.position)) setChartStat('receiving_yards')
        else setChartStat('rushing_yards')
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [playerId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
        <div className="h-64 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
    )
  }

  if (!player) return <p className="text-text-tertiary font-body">Player not found.</p>

  const stats = player.season_stats || {}
  const heroStats = getHeroStats(player.position, stats)
  const detailedStats = getDetailedStats(player.position, stats)
  const sortedGear = [...(player.gear || [])].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
  )

  const statOptions = [
    { value: 'rushing_yards', label: 'Rush Yds' },
    { value: 'receiving_yards', label: 'Rec Yds' },
    { value: 'passing_yards', label: 'Pass Yds' },
    { value: 'receptions', label: 'Receptions' },
    { value: 'fg_made', label: 'FG Made' },
    { value: 'fantasy_points_ppr', label: 'Fantasy' },
  ]

  const chartData = (player.weekly_stats || []).map((w) => ({
    week: w.week,
    value: w[chartStat] || 0,
  }))

  return (
    <div>
      {/* Back link */}
      <Link to="/" className="font-body text-sm text-text-tertiary hover:text-text-primary transition-colors mb-6 inline-flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Leaderboards
      </Link>

      {/* ═══ PLAYER HEADER ═══ */}
      <div className="rounded-2xl border border-border-subtle p-8 mb-6 animate-fade-slide-up relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(30,30,42,1) 0%, rgba(20,20,28,1) 100%)' }}>
        {/* Atmospheric glow */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right, rgba(255,107,53,0.05) 0%, transparent 70%)' }} />

        <div className="flex flex-col sm:flex-row items-start gap-6 relative">
          {/* Headshot */}
          {player.headshot_url ? (
            <img src={player.headshot_url} alt={player.name}
              className="w-28 h-28 rounded-2xl object-cover shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.08)' }} />
          ) : (
            <div className="w-28 h-28 rounded-2xl flex items-center justify-center text-text-muted text-4xl shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.08)' }}>?</div>
          )}

          <div className="flex-1 min-w-0">
            {/* Position badge */}
            <div className="flex items-center gap-3 mb-2">
              <span className="font-label text-[11px] uppercase tracking-[2px] text-accent-primary">
                {player.position}
              </span>
              <span className="font-label text-[11px] uppercase tracking-[2px] text-text-tertiary">
                {player.team}
              </span>
            </div>
            <h1 className="font-heading text-4xl font-bold text-text-primary tracking-[-0.5px] mb-4">
              {player.name}
            </h1>

            {/* Hero stat numbers */}
            {heroStats.length > 0 && (
              <div className="flex flex-wrap gap-6">
                {heroStats.map((hs, i) => (
                  <div key={hs.label}>
                    <div className="font-heading text-2xl font-bold text-text-primary">
                      {typeof hs.value === 'number' ? hs.value.toLocaleString() : hs.value}
                    </div>
                    <div className="font-label text-[10px] uppercase tracking-[1.5px] text-text-tertiary">
                      {hs.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ TWO-COLUMN LAYOUT: GEAR LOADOUT + SEASON STATS ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">

        {/* Gear Loadout (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-border-subtle p-6 animate-fade-slide-up stagger-1"
          style={{ background: 'linear-gradient(135deg, rgba(25,25,38,0.8) 0%, rgba(18,18,28,0.9) 100%)' }}>
          <h2 className="font-heading text-xl font-bold text-text-primary tracking-[0.5px] mb-5">
            GEAR LOADOUT
          </h2>

          {sortedGear.length === 0 ? (
            <p className="font-body text-sm text-text-tertiary">No gear data available.</p>
          ) : (
            <div className="space-y-3">
              {sortedGear.map((g, i) => {
                const color = CATEGORY_COLORS[g.category] || '#FF6B35'
                return (
                  <Link
                    key={g.id}
                    to={`/gear/${g.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border-subtle transition-all duration-300 hover:-translate-y-0.5 group"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      animationName: 'fadeSlideUp',
                      animationDuration: '0.5s',
                      animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                      animationFillMode: 'both',
                      animationDelay: `${0.2 + i * 0.08}s`,
                    }}
                  >
                    {/* Category icon */}
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${color}20, ${color}08)`,
                        border: `1px solid ${color}30`,
                      }}>
                      {CATEGORY_ICONS[g.category] || '🏈'}
                    </div>

                    {/* Gear name + category */}
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors truncate">
                        {g.brand} {g.model}
                      </p>
                      <p className="font-label text-[10px] uppercase tracking-[1.5px] mt-0.5" style={{ color }}>
                        {g.category}
                      </p>
                    </div>

                    {/* Rank badge + stat */}
                    <div className="text-right shrink-0">
                      {g.rank && (
                        <span className="font-heading text-sm font-bold px-2.5 py-1 rounded-lg inline-block"
                          style={{
                            background: g.rank <= 3 ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.05)',
                            color: g.rank <= 3 ? '#FF6B35' : 'rgba(255,255,255,0.5)',
                            border: g.rank <= 3 ? '1px solid rgba(255,107,53,0.25)' : '1px solid rgba(255,255,255,0.06)',
                          }}>
                          #{g.rank}
                        </span>
                      )}
                      <p className="font-label text-[9px] uppercase tracking-[1px] text-text-muted mt-1">
                        of {g.total_in_category} {g.category === 'gloves' ? 'gloves' : `${g.category}s`}
                      </p>
                    </div>

                    {/* Affiliate + arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      <AffiliateButton url={g.affiliate_url} />
                      <div className="text-text-muted group-hover:text-text-tertiary group-hover:translate-x-1 transition-all duration-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Season Stats (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-border-subtle p-6 animate-fade-slide-up stagger-2"
          style={{ background: 'linear-gradient(135deg, rgba(25,25,38,0.8) 0%, rgba(18,18,28,0.9) 100%)' }}>
          <h2 className="font-heading text-xl font-bold text-text-primary tracking-[0.5px] mb-5">
            2024 SEASON STATS
          </h2>

          {detailedStats.length === 0 ? (
            <p className="font-body text-sm text-text-tertiary">No stats available.</p>
          ) : (
            <div className="space-y-0">
              {detailedStats.map((s, i) => (
                <div key={s.label}
                  className="flex justify-between items-center py-3 border-b border-border-subtle last:border-0"
                  style={{
                    animationName: 'fadeSlideUp',
                    animationDuration: '0.4s',
                    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    animationFillMode: 'both',
                    animationDelay: `${0.3 + i * 0.05}s`,
                  }}>
                  <span className="font-body text-sm text-text-secondary">{s.label}</span>
                  <span className="font-heading text-base font-bold text-text-primary">
                    {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ GEAR PERFORMANCE CONTEXT ═══ */}
      {sortedGear.some(g => g.rank) && (
        <div className="rounded-2xl border border-border-subtle p-6 mb-6 animate-fade-slide-up stagger-3"
          style={{ background: 'linear-gradient(135deg, rgba(25,25,38,0.8) 0%, rgba(18,18,28,0.9) 100%)' }}>
          <h2 className="font-heading text-xl font-bold text-text-primary tracking-[0.5px] mb-2">
            HOW DOES {player.name.split(' ').pop().toUpperCase()}'S GEAR STACK UP?
          </h2>
          <p className="font-body text-sm text-text-tertiary mb-5">
            Where each piece of {player.name}'s gear ranks on the leaderboard this season
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedGear.filter(g => g.rank).map((g) => {
              const color = CATEGORY_COLORS[g.category] || '#FF6B35'
              const percentage = g.total_in_category > 0
                ? Math.max(5, Math.round(((g.total_in_category - g.rank + 1) / g.total_in_category) * 100))
                : 0
              return (
                <Link
                  key={g.id}
                  to={`/gear/${g.id}`}
                  className="p-4 rounded-xl border border-border-subtle transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  {/* Subtle glow */}
                  <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none"
                    style={{ background: `radial-gradient(circle at top right, ${color}0A 0%, transparent 70%)` }} />

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{
                        background: `linear-gradient(135deg, ${color}20, ${color}08)`,
                        border: `1px solid ${color}30`,
                      }}>
                      {CATEGORY_ICONS[g.category] || '🏈'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-xs font-semibold text-text-primary truncate group-hover:text-accent-primary transition-colors">
                        {g.brand} {g.model}
                      </p>
                      <p className="font-label text-[9px] uppercase tracking-[1.5px]" style={{ color }}>
                        {g.category}
                      </p>
                    </div>
                    <span className="font-heading text-xl font-bold"
                      style={{ color: g.rank <= 3 ? '#FF6B35' : 'rgba(255,255,255,0.5)' }}>
                      #{g.rank}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-2 rounded-full overflow-hidden mb-2"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-1000"
                      style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}88)`,
                      }} />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-body text-xs text-text-tertiary">
                      {g.total_stat_value?.toLocaleString()} {g.primary_stat_label}
                    </span>
                    <span className="font-label text-[9px] uppercase tracking-[1px] text-text-muted">
                      of {g.total_in_category} {g.category === 'gloves' ? 'gloves' : `${g.category}s`}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ═══ WEEKLY PERFORMANCE CHART ═══ */}
      {chartData.length > 0 && (
        <div className="rounded-2xl border border-border-subtle p-6 animate-fade-slide-up stagger-4"
          style={{ background: 'linear-gradient(135deg, rgba(25,25,38,0.8) 0%, rgba(18,18,28,0.9) 100%)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading text-xl font-bold text-text-primary tracking-[0.5px]">
                WEEKLY PERFORMANCE
              </h2>
              <p className="font-body text-sm text-text-tertiary mt-1">
                Week-by-week breakdown — 2024 season
              </p>
            </div>
            <select
              value={chartStat}
              onChange={(e) => setChartStat(e.target.value)}
              className="font-body text-xs rounded-xl px-4 py-2 border outline-none cursor-pointer"
              style={{
                background: 'rgba(255,107,53,0.08)',
                borderColor: 'rgba(255,107,53,0.3)',
                color: '#FF6B35',
              }}
            >
              {statOptions.map(({ value, label }) => (
                <option key={value} value={value} style={{ background: '#131320', color: '#fff' }}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <defs>
                  <linearGradient id="playerChartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B35" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#FF6B35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="week"
                  tickFormatter={(w) => `W${w}`}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontFamily: 'Barlow Condensed', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontFamily: 'Barlow Condensed', fontSize: 11 }}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#FF6B35"
                  strokeWidth={2.5}
                  fill="url(#playerChartGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#FF6B35', stroke: '#0D0D14', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
