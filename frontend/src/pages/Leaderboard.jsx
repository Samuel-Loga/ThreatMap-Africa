import { useState, useEffect } from 'react'
import { communityApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

const BADGE_DEFINITIONS = [
  { name: 'First Submission', icon: '🎯' },
  { name: 'Active Contributor', icon: '🔥' },
  { name: 'Threat Hunter', icon: '🦁' },
  { name: 'Community Voice', icon: '💬' },
  { name: 'Trusted Analyst', icon: '🛡️' },
  { name: 'Elite Defender', icon: '⭐' },
  { name: 'Pan-African', icon: '🌍' },
]

const RANK_STYLES = ['text-yellow-400', 'text-gray-300', 'text-amber-600']
const RANK_ICONS = ['🥇', '🥈', '🥉']

const VERIFICATION_COLORS = {
  trusted: 'bg-green-900/40 text-green-300',
  verified: 'bg-blue-900/40 text-blue-300',
  unverified: 'bg-dark-700 text-gray-400',
}

export default function Leaderboard() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [myBadges, setMyBadges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      communityApi.leaderboard(50),
      communityApi.myBadges(),
    ]).then(([lb, badges]) => {
      setEntries(lb.data)
      setMyBadges(badges.data)
    }).finally(() => setLoading(false))
  }, [])

  const myEntry = entries.find(e => e.user_id === user?.id)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-gray-400 text-sm mt-1">Top contributors driving African threat intelligence</p>
      </div>

      {/* My Badges */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Your Badges</h3>
        <div className="flex flex-wrap gap-3">
          {BADGE_DEFINITIONS.map(b => {
            const earned = myBadges.some(ub => ub.badge.name === b.name)
            return (
              <div key={b.name} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${earned ? 'bg-primary/10 border-primary/50 text-white' : 'bg-dark-900/50 border-dark-700 text-gray-600 opacity-50'}`}>
                <span className="text-lg">{b.icon}</span>
                <span className="text-xs font-semibold">{b.name}</span>
                {earned && <span className="text-[10px] text-primary">✓</span>}
              </div>
            )
          })}
        </div>
        {myBadges.length === 0 && !loading && (
          <p className="text-gray-500 text-sm italic mt-2">Submit indicators and participate in forums to earn badges!</p>
        )}
      </div>

      {/* My Rank */}
      {myEntry && (
        <div className="bg-primary/10 border border-primary/40 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-primary">#{myEntry.rank}</span>
            <div>
              <p className="text-sm font-bold text-white">Your Ranking</p>
              <p className="text-xs text-gray-400">{myEntry.reputation_points} reputation points</p>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${VERIFICATION_COLORS[myEntry.verification_level]}`}>
            {myEntry.verification_level}
          </span>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 text-[10px] text-gray-500 uppercase tracking-widest px-5 py-3 border-b border-dark-600 font-bold">
          <span className="col-span-1">Rank</span>
          <span className="col-span-4">Analyst</span>
          <span className="col-span-3">Organization</span>
          <span className="col-span-2 text-right">Rep</span>
          <span className="col-span-1 text-center">Badges</span>
          <span className="col-span-1 text-right">Trust</span>
        </div>

        {loading && <p className="text-center text-gray-400 py-12 animate-pulse">Loading leaderboard…</p>}

        {entries.map((e, i) => (
          <div key={e.user_id} className={`grid grid-cols-12 items-center px-5 py-3 border-b border-dark-700 last:border-0 transition-colors ${e.user_id === user?.id ? 'bg-primary/5' : 'hover:bg-dark-700/30'}`}>
            <div className="col-span-1">
              {i < 3
                ? <span className="text-xl">{RANK_ICONS[i]}</span>
                : <span className={`text-sm font-bold ${RANK_STYLES[i] || 'text-gray-400'}`}>#{e.rank}</span>}
            </div>
            <div className="col-span-4 flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                {e.username[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-200 truncate font-medium">{e.username}</span>
              {e.user_id === user?.id && <span className="text-[10px] text-primary font-bold">(you)</span>}
            </div>
            <div className="col-span-3">
              <span className="text-xs text-gray-400 truncate">{e.organization || '—'}</span>
            </div>
            <div className="col-span-2 text-right">
              <span className="text-sm font-mono font-bold text-accent">{e.reputation_points}</span>
            </div>
            <div className="col-span-1 text-center">
              <span className="text-sm">{e.badge_count > 0 ? `${e.badge_count} 🏅` : '—'}</span>
            </div>
            <div className="col-span-1 text-right">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${VERIFICATION_COLORS[e.verification_level]}`}>
                {e.trust_score}
              </span>
            </div>
          </div>
        ))}

        {!loading && entries.length === 0 && (
          <p className="text-center text-gray-500 py-12">No contributors yet. Be the first!</p>
        )}
      </div>
    </div>
  )
}
