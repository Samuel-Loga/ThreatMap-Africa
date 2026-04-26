import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { indicatorsApi } from '../api/client'
import AfricaMap from '../components/AfricaMap'
import ThreatCard from '../components/ThreatCard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function StatCard({ label, value, sub, color = 'text-primary' }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-2xl lg:text-3xl font-bold mt-1 truncate ${color}`} title={value}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

function toTitleCase(str) {
  if (!str) return '—'
  return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

export default function Dashboard() {
  const [indicators, setIndicators] = useState([])
  const [loading, setLoading] = useState(true)
  const [recentFilter, setRecentFilter] = useState('today')

  useEffect(() => {
    indicatorsApi.list({ limit: 500 })
      .then((res) => setIndicators(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  const todayCount = indicators.filter((i) => new Date(i.created_at) >= today).length
  const criticalCount = indicators.filter((i) => i.confidence >= 70).length

  const countryCounts = {}
  const categoryCounts = {}
  const typeCounts = {}

  indicators.forEach((ind) => {
    (ind.country_codes || []).forEach((cc) => { countryCounts[cc] = (countryCounts[cc] || 0) + 1 })
    ;(ind.attack_categories || []).forEach((a) => { categoryCounts[a] = (categoryCounts[a] || 0) + 1 })
    typeCounts[ind.indicator_type] = (typeCounts[ind.indicator_type] || 0) + 1
  })

  const topCountryCode = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]
  let topCountryName = '—'
  if (topCountryCode) {
    try {
      topCountryName = regionNames.of(topCountryCode[0])
    } catch {
      topCountryName = topCountryCode[0]
    }
  }

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]

  const categoryChartData = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name: toTitleCase(name), count }))

  const typeChartData = Object.entries(typeCounts)
    .map(([name, count]) => ({ name: toTitleCase(name), count }))

  const recentIndicators = indicators.filter((ind) => {
    const created = new Date(ind.created_at)
    if (recentFilter === 'today') return created >= today
    if (recentFilter === 'week') return created >= oneWeekAgo
    if (recentFilter === 'month') return created >= oneMonthAgo
    return true
  }).slice(0, 6)

  const COLORS = ['#10b981', '#f97316', '#3b82f6', '#a855f7', '#ec4899', '#eab308']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 animate-pulse">Loading dashboard…</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">African threat intelligence overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Indicators" value={indicators.length} />
        <StatCard label="Today" value={todayCount} color="text-accent" />
        <StatCard label="Critical (High Conf.)" value={criticalCount} color="text-red-500" />
        <StatCard
          label="Top Country"
          value={topCountryName}
          sub={topCountryCode ? `${topCountryCode[1]} indicators` : undefined}
          color="text-blue-400"
        />
        <StatCard
          label="Top Category"
          value={toTitleCase(topCategory?.[0])}
          sub={topCategory ? `${topCategory[1]} indicators` : undefined}
          color="text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-dark-800 border border-dark-600 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Africa Threat Heatmap</h2>
            <AfricaMap indicators={indicators} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Recently Reported</h2>
            <div className="flex bg-dark-800 border border-dark-600 rounded-md p-1">
              {['today', 'week', 'month'].map((f) => (
                <button
                  key={f}
                  onClick={() => setRecentFilter(f)}
                  className={`text-[10px] px-2 py-1 rounded uppercase font-bold transition-colors ${
                    recentFilter === f ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {recentIndicators.length > 0 ? (
              recentIndicators.map((ind) => (
                <ThreatCard key={ind.id} indicator={ind} />
              ))
            ) : (
              <div className="bg-dark-800 border border-dark-600 border-dashed rounded-lg p-8 text-center">
                <p className="text-gray-500 text-sm">No indicators reported in this period.</p>
              </div>
            )}
            {recentIndicators.length > 0 && (
              <Link to="/feed" className="block w-full py-2 text-xs text-primary hover:text-primary-hover font-semibold transition-colors text-center border border-dark-600 rounded-lg hover:bg-dark-700">
                View all indicators →
              </Link>
            )}
          </div>
        </div>

        {/* Charts Row spanning all columns */}
        <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dark-800 border border-dark-600 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Attack Categories</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryChartData} layout="vertical">
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={130} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {categoryChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-dark-800 border border-dark-600 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Indicator Types</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={typeChartData}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {typeChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
