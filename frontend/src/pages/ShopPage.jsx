import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getGearList } from '../api'
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

const CATEGORIES = ['All', 'helmet', 'cleats', 'gloves', 'visor', 'facemask']

export default function ShopPage() {
  const [gear, setGear] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (category !== 'All') params.category = category
    getGearList(params)
      .then((data) => {
        data.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
        setGear(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [category])

  return (
    <div>
      {/* Header */}
      <div className="mb-8 animate-fade-slide-up">
        <h1 className="font-heading text-4xl font-bold text-text-primary tracking-[-0.5px] mb-2">
          SHOP GEAR
        </h1>
        <p className="font-body text-base text-text-tertiary">
          Browse top-ranked NFL gear and shop through our affiliate links
        </p>
      </div>

      {/* Affiliate disclosure */}
      <div className="rounded-xl border p-3 mb-6 animate-fade-slide-up stagger-1"
        style={{ background: 'rgba(255,107,53,0.04)', borderColor: 'rgba(255,107,53,0.1)' }}>
        <p className="font-body text-xs text-text-tertiary">
          <span className="text-accent-primary font-semibold">Affiliate Disclosure:</span> We may earn a commission from purchases made through links on this page. This helps support Cleats & Stats at no extra cost to you.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6 animate-fade-slide-up stagger-2">
        {CATEGORIES.map((cat) => {
          const color = cat === 'All' ? '#FF6B35' : (CATEGORY_COLORS[cat] || '#FF6B35')
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="font-label text-[11px] uppercase tracking-[1.5px] font-semibold px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer"
              style={{
                background: category === cat ? `${color}15` : 'transparent',
                borderColor: category === cat ? `${color}40` : 'rgba(255,255,255,0.08)',
                color: category === cat ? color : 'rgba(255,255,255,0.4)',
              }}
            >
              {cat === 'All' ? 'All Gear' : (cat === 'cleats' || cat === 'gloves') ? cat : `${cat}s`}
            </button>
          )
        })}
      </div>

      {/* Gear grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gear.map((item, i) => {
            const color = CATEGORY_COLORS[item.category] || '#FF6B35'
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-border-subtle p-5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, rgba(25,25,38,0.8) 0%, rgba(18,18,28,0.9) 100%)',
                  animationName: 'fadeSlideUp',
                  animationDuration: '0.5s',
                  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  animationFillMode: 'both',
                  animationDelay: `${Math.min(0.1 + i * 0.04, 0.8)}s`,
                }}
              >
                {/* Atmospheric glow */}
                <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                  style={{ background: `radial-gradient(circle at top right, ${color}0A 0%, transparent 70%)` }} />

                <div className="flex items-start gap-4 mb-3">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${color}20, ${color}08)`,
                      border: `1px solid ${color}30`,
                    }}>
                    {CATEGORY_ICONS[item.category] || '🏈'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/gear/${item.id}`}
                      className="font-body text-base font-semibold text-text-primary group-hover:text-accent-primary transition-colors block truncate"
                    >
                      {item.brand} {item.model}
                    </Link>
                    <span className="font-label text-[10px] uppercase tracking-[1.5px] mt-0.5 inline-block" style={{ color }}>
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Rank + stat */}
                {item.rank && (
                  <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="font-heading text-sm font-bold px-2 py-0.5 rounded-md"
                      style={{
                        background: item.rank <= 3 ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.05)',
                        color: item.rank <= 3 ? '#FF6B35' : 'rgba(255,255,255,0.5)',
                        border: item.rank <= 3 ? '1px solid rgba(255,107,53,0.25)' : '1px solid rgba(255,255,255,0.06)',
                      }}>
                      #{item.rank}
                    </span>
                    <span className="font-body text-xs text-text-tertiary">
                      {item.total_stat_value?.toLocaleString()} {item.primary_stat}
                    </span>
                    <span className="font-label text-[9px] uppercase tracking-[1px] text-text-muted">
                      of {item.total_in_category} {(item.category === 'cleats' || item.category === 'gloves') ? item.category : `${item.category}s`}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Link
                    to={`/gear/${item.id}`}
                    className="font-label text-[10px] uppercase tracking-[1.5px] text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    View Stats →
                  </Link>
                  <AffiliateButton url={item.affiliate_url} label="Buy Now" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
