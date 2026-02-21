import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getLeaderboard } from '../api'
import AffiliateButton from './AffiliateButton'

const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

const STAT_LABELS = {
  rushing_yards: 'Rush Yds',
  rushing_tds: 'Rush TDs',
  receiving_yards: 'Rec Yds',
  receiving_tds: 'Rec TDs',
  receptions: 'Receptions',
  passing_yards: 'Pass Yds',
  passing_tds: 'Pass TDs',
  fg_made: 'FG Made',
  fantasy_points_ppr: 'Fantasy Pts',
}

export default function LeaderboardCard({ category, stat, season, week, title }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = { stat, season, limit: 8 }
    if (week) params.week = week
    getLeaderboard(category, params)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [category, stat, season, week])

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-3/4 mb-4" />
        <div className="h-48 bg-gray-800 rounded" />
      </div>
    )
  }

  if (!data || !data.items.length) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    )
  }

  const chartData = data.items.slice(0, 5).map((item) => ({
    name: `${item.brand} ${item.model}`,
    value: item.total_stat,
    gear_id: item.gear_id,
  }))

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <h3 className="text-lg font-bold text-white mb-1">{data.leaderboard_title}</h3>
      <p className="text-xs text-gray-500 mb-4">
        {week ? `Week ${week}` : 'Full Season'} {season}
      </p>

      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#22c55e' }}
              formatter={(value) => [value.toLocaleString(), STAT_LABELS[stat] || stat]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {data.items.map((item, i) => (
          <div key={item.gear_id} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-800 last:border-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-gray-500 w-5">{i + 1}</span>
              <Link
                to={`/gear/${item.gear_id}`}
                className="text-sm font-medium text-white hover:text-green-400 transition-colors truncate"
              >
                {item.brand} {item.model}
              </Link>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-sm font-bold text-white">{item.total_stat.toLocaleString()}</span>
                <span className="text-xs text-gray-500 ml-1">{STAT_LABELS[stat] || stat}</span>
              </div>
              <AffiliateButton url={item.affiliate_url} />
            </div>
          </div>
        ))}
      </div>

      {data.items[0]?.top_player && (
        <p className="text-xs text-gray-500 mt-3">
          Top performer: {data.items[0].top_player.name} ({data.items[0].top_player.team}) - {data.items[0].top_player.stat_value.toLocaleString()}
        </p>
      )}
    </div>
  )
}
