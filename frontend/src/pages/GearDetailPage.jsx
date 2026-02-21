import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { getGearDetail } from '../api'
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

const STAT_LABELS = {
  rushing_yards: 'Rushing Yards',
  receiving_yards: 'Receiving Yards',
  passing_yards: 'Passing Yards',
  fg_made: 'FG Made',
}

const STAT_KEYS = [
  { key: 'total_rushing_yards', label: 'Rushing Yards', icon: '🏃', short: 'Rush Yds' },
  { key: 'total_receiving_yards', label: 'Receiving Yards', icon: '🎯', short: 'Rec Yds' },
  { key: 'total_passing_yards', label: 'Passing Yards', icon: '🏈', short: 'Pass Yds' },
  { key: 'total_rushing_tds', label: 'Rush TDs', icon: '🔥', short: 'Rush TD' },
  { key: 'total_receiving_tds', label: 'Rec TDs', icon: '🔥', short: 'Rec TD' },
  { key: 'total_passing_tds', label: 'Pass TDs', icon: '🔥', short: 'Pass TD' },
  { key: 'total_receptions', label: 'Receptions', icon: '🧤', short: 'Rec' },
  { key: 'total_fg_made', label: 'FG Made', icon: '🥅', short: 'FG' },
]

// Pick best display stats per position
function getPlayerDisplayStats(player) {
  const s = player.stats
  if (!s) return []
  const pos = player.position
  if (pos === 'QB') {
    return [
      { label: 'Pass Yds', value: s.passing_yards },
      { label: 'Pass TD', value: s.passing_tds },
      { label: 'Rush Yds', value: s.rushing_yards },
    ]
  }
  if (pos === 'RB') {
    return [
      { label: 'Rush Yds', value: s.rushing_yards },
      { label: 'Rush TD', value: s.rushing_tds },
      { label: 'Rec Yds', value: s.receiving_yards },
    ]
  }
  if (pos === 'WR' || pos === 'TE') {
    return [
      { label: 'Rec Yds', value: s.receiving_yards },
      { label: 'Rec TD', value: s.receiving_tds },
      { label: 'Rec', value: s.receptions },
    ]
  }
  if (pos === 'K') {
    return [
      { label: 'FG Made', value: s.fg_made },
      { label: 'Fantasy', value: s.fantasy_points },
    ]
  }
  // DEF/LB/CB/S/DE
  return [
    { label: 'Rush Yds', value: s.rushing_yards },
    { label: 'Fantasy', value: s.fantasy_points },
  ]
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
        {payload[0]?.value?.toLocaleString()}
      </p>
      <p className="font-body text-xs text-text-tertiary">cumulative</p>
      {payload[1] && (
        <p className="font-body text-xs text-text-secondary mt-1">
          +{payload[1]?.value?.toLocaleString()} this week
        </p>
      )}
    </div>
  )
}

export default function GearDetailPage() {
  const { gearId } = useParams()
  const [gear, setGear] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getGearDetail(gearId)
      .then(setGear)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [gearId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 rounded w-1/3 animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="h-48 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
        <div className="h-64 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
    )
  }

  if (!gear) return <p className="text-text-tertiary font-body">Gear not found.</p>

  const categoryColor = CATEGORY_COLORS[gear.category] || '#FF6B35'
  const visibleStats = STAT_KEYS.filter(({ key }) => (gear.stats_summary[key] || 0) > 0)
  const primaryStatLabel = STAT_LABELS[gear.primary_stat] || gear.primary_stat?.replace(/_/g, ' ')

  return (
    <div>
      {/* Back link */}
      <Link to="/" className="font-body text-sm text-text-tertiary hover:text-text-primary transition-colors mb-6 inline-flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Leaderboards
      </Link>

      {/* ═══ HERO AREA ═══ */}
      <div className="rounded-2xl border border-border-subtle p-8 mb-6 animate-fade-slide-up relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(30,30,42,1) 0%, rgba(20,20,28,1) 100%)' }}>
        {/* Atmospheric glow */}
        <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
          style={{ background: `radial-gradient(circle at top right, ${categoryColor}08 0%, transparent 70%)` }} />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative">
          <div className="flex items-start gap-5">
            {/* Gear icon */}
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0"
              style={{
                background: `linear-gradient(135deg, ${categoryColor}20, ${categoryColor}08)`,
                border: `1px solid ${categoryColor}30`,
              }}>
              {CATEGORY_ICONS[gear.category] || '🏈'}
            </div>
            <div>
              {/* Category + Rank badge */}
              <div className="flex items-center gap-3 mb-2">
                <span className="font-label text-[11px] uppercase tracking-[2px]"
                  style={{ color: categoryColor }}>
                  {gear.category}
                </span>
                {gear.rank && (
                  <span className="font-heading text-xs font-bold px-2.5 py-0.5 rounded-lg"
                    style={{
                      background: gear.rank <= 3 ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.06)',
                      color: gear.rank <= 3 ? '#FF6B35' : 'rgba(255,255,255,0.5)',
                      border: gear.rank <= 3 ? '1px solid rgba(255,107,53,0.25)' : '1px solid rgba(255,255,255,0.08)',
                    }}>
                    #{gear.rank} in {gear.category === 'gloves' ? 'gloves' : `${gear.category}s`}
                  </span>
                )}
              </div>
              <h1 className="font-heading text-4xl font-bold text-text-primary tracking-[-0.5px] mb-1">
                {gear.brand} {gear.model}
              </h1>
              <p className="font-body text-sm text-text-secondary">
                Worn by <span className="text-text-primary font-semibold">{gear.players.length}</span> player{gear.players.length !== 1 ? 's' : ''} in our database
              </p>
            </div>
          </div>

          {/* Shop CTA */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <AffiliateButton url={gear.affiliate_url} label={gear.affiliate_source ? `Buy on ${gear.affiliate_source}` : 'Buy on Amazon'} size="lg" />
            {gear.affiliate_source && (
              <span className="font-body text-[11px] text-text-muted">
                Affiliate link · {gear.affiliate_source}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ═══ STAT SUMMARY CARDS ═══ */}
      {visibleStats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {visibleStats.slice(0, 4).map(({ key, label, icon }, i) => (
            <div key={key}
              className="rounded-2xl border border-border-subtle p-5 animate-fade-slide-up transition-all duration-300 hover:-translate-y-1 group cursor-default"
              style={{
                background: 'linear-gradient(135deg, rgba(25,25,38,0.8) 0%, rgba(18,18,28,0.9) 100%)',
                animationDelay: `${0.1 + i * 0.1}s`,
              }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xl">{icon}</div>
                {key === `total_${gear.primary_stat}` && gear.rank && (
                  <span className="font-label text-[9px] uppercase tracking-[1px] px-2 py-0.5 rounded"
                    style={{ background: 'rgba(255,107,53,0.12)', color: '#FF6B35' }}>
                    #{gear.rank}
                  </span>
                )}
              </div>
              <div className="font-heading text-3xl font-bold text-text-primary">
                {(gear.stats_summary[key] || 0).toLocaleString()}
              </div>
              <div className="font-label text-[10px] uppercase tracking-[1.5px] text-text-tertiary mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ PERFORMANCE CHART ═══ */}
      {gear.weekly_chart?.length > 0 && (
        <div className="rounded-2xl border border-border-subtle p-6 mb-6 animate-fade-slide-up stagger-3"
          style={{ background: 'linear-gradient(135deg, rgba(25,25,38,0.8) 0%, rgba(18,18,28,0.9) 100%)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-xl font-bold text-text-primary tracking-[0.5px]">
                SEASON PERFORMANCE
              </h2>
              <p className="font-body text-sm text-text-tertiary mt-1">
                Cumulative {primaryStatLabel?.toLowerCase()} — 2024 season
              </p>
            </div>
            <div className="text-right">
              <div className="font-heading text-2xl font-bold" style={{ color: categoryColor }}>
                {gear.weekly_chart[gear.weekly_chart.length - 1]?.cumulative?.toLocaleString()}
              </div>
              <div className="font-label text-[10px] uppercase tracking-[1.5px] text-text-tertiary">
                Total {primaryStatLabel}
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gear.weekly_chart} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={categoryColor} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={categoryColor} stopOpacity={0} />
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
                  dataKey="cumulative"
                  stroke={categoryColor}
                  strokeWidth={2.5}
                  fill="url(#chartGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: categoryColor, stroke: '#0D0D14', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="weekly"
                  stroke="transparent"
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ═══ PLAYERS USING THIS GEAR ═══ */}
      <div className="rounded-2xl border border-border-subtle p-6 mb-6 animate-fade-slide-up stagger-4"
        style={{ background: 'linear-gradient(135deg, rgba(25,25,38,0.8) 0%, rgba(18,18,28,0.9) 100%)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl font-bold text-text-primary tracking-[0.5px]">
            PLAYERS USING THIS GEAR
          </h2>
          <span className="font-label text-[11px] uppercase tracking-[1.5px] text-text-tertiary">
            {gear.players.length} player{gear.players.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-2">
          {gear.players.map((player, i) => {
            const displayStats = getPlayerDisplayStats(player)
            return (
              <Link
                key={player.id}
                to={`/player/${player.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-border-subtle transition-all duration-300 hover:-translate-y-0.5 group"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  animationName: i < 10 ? 'fadeSlideUp' : undefined,
                  animationDuration: '0.5s',
                  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  animationFillMode: 'both',
                  animationDelay: i < 10 ? `${0.4 + i * 0.06}s` : undefined,
                }}
              >
                {/* Headshot */}
                {player.headshot_url ? (
                  <img src={player.headshot_url} alt={player.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)' }} />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-text-muted text-lg shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>?</div>
                )}

                {/* Name + Position */}
                <div className="min-w-0 flex-1">
                  <p className="font-body text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                    {player.name}
                  </p>
                  <p className="font-body text-xs text-text-tertiary">{player.position} · {player.team}</p>
                </div>

                {/* Player stats */}
                <div className="hidden sm:flex items-center gap-6">
                  {displayStats.map((ds) => (
                    <div key={ds.label} className="text-right">
                      <div className="font-heading text-base font-bold text-text-primary">
                        {typeof ds.value === 'number' ? ds.value.toLocaleString() : ds.value}
                      </div>
                      <div className="font-label text-[9px] uppercase tracking-[1px] text-text-tertiary">
                        {ds.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Arrow */}
                <div className="text-text-muted group-hover:text-text-tertiary group-hover:translate-x-1 transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ═══ SHOP SECTION ═══ */}
      {gear.affiliate_url && (
        <div className="rounded-2xl border animate-fade-slide-up stagger-5 p-6 mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,53,0.06) 0%, rgba(18,18,28,0.9) 100%)',
            borderColor: 'rgba(255,107,53,0.12)',
          }}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Gear icon placeholder */}
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shrink-0"
              style={{
                background: `linear-gradient(135deg, ${categoryColor}15, ${categoryColor}05)`,
                border: `1px solid ${categoryColor}20`,
              }}>
              {CATEGORY_ICONS[gear.category] || '🏈'}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-heading text-xl font-bold text-text-primary mb-1">
                {gear.brand} {gear.model}
              </h3>
              <p className="font-body text-sm text-text-secondary mb-1">
                {gear.rank === 1
                  ? `#1 ranked ${gear.category} this season`
                  : `Top ${gear.rank || '?'} ${gear.category} in ${primaryStatLabel?.toLowerCase()}`
                }
              </p>
              <p className="font-body text-xs text-text-muted">
                Used by {gear.players.length} NFL player{gear.players.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <AffiliateButton url={gear.affiliate_url} label={gear.affiliate_source ? `Buy on ${gear.affiliate_source}` : 'Buy on Amazon'} size="lg" />
              <span className="font-body text-[10px] text-text-muted">Affiliate link</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ RELATED GEAR ═══ */}
      {gear.related_gear?.length > 0 && (
        <div className="rounded-2xl border border-border-subtle p-6 animate-fade-slide-up stagger-6"
          style={{ background: 'linear-gradient(135deg, rgba(25,25,38,0.8) 0%, rgba(18,18,28,0.9) 100%)' }}>
          <h2 className="font-heading text-xl font-bold text-text-primary tracking-[0.5px] mb-4">
            OTHER {gear.category === 'gloves' ? 'GLOVES' : `${gear.category.toUpperCase()}S`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {gear.related_gear.map((item) => (
              <Link
                key={item.id}
                to={`/gear/${item.id}`}
                className="p-5 rounded-xl border border-border-subtle transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
                  style={{ background: `radial-gradient(circle at top right, ${categoryColor}08 0%, transparent 70%)` }} />
                <div className="text-3xl mb-3">{CATEGORY_ICONS[item.category] || '🏈'}</div>
                <p className="font-body text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                  {item.brand} {item.model}
                </p>
                <span className="font-label text-[10px] uppercase tracking-[1.5px] text-text-tertiary mt-1 inline-block">
                  {item.category}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
