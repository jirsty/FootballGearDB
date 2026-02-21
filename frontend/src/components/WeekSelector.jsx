import { useState, useEffect } from 'react'
import { getWeeks } from '../api'

export default function WeekSelector({ season, week, onSeasonChange, onWeekChange }) {
  const [availableData, setAvailableData] = useState({ seasons: [], weeks: {} })

  useEffect(() => {
    getWeeks().then(setAvailableData).catch(console.error)
  }, [])

  const weeks = availableData.weeks[String(season)] || []

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-400">Season</label>
        <select
          value={season}
          onChange={(e) => onSeasonChange(Number(e.target.value))}
          className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-1.5 text-sm"
        >
          {availableData.seasons.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-400">Week</label>
        <select
          value={week ?? ''}
          onChange={(e) => onWeekChange(e.target.value ? Number(e.target.value) : null)}
          className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-1.5 text-sm"
        >
          <option value="">Full Season</option>
          {weeks.map((w) => (
            <option key={w} value={w}>Week {w}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
