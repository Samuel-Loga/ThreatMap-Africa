import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { indicatorsApi } from '../api/client'
import AfricaMap from '../components/AfricaMap'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const TYPE_ICONS = {
  ip: '🖥️',
  domain: '🌐',
  url: '🔗',
  hash_md5: '#️⃣',
  hash_sha256: '#️⃣',
  email: '📧',
}

const SEVERITY_COLORS = {
  Info: 'text-blue-400',
  Low: 'text-green-400',
  Medium: 'text-yellow-400',
  High: 'text-orange-400',
  Critical: 'text-red-500',
}

function StatCard({ label, value, sub, color = 'text-primary' }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-2xl lg:text-3xl font-bold mt-1 truncate ${color}`} title={value}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

function SlimThreatCard({ indicator }) {
  return (
    <Link to={`/indicators/${indicator.id}`} className="block group">
      <div className="bg-dark-700/30 hover:bg-dark-700/60 border border-dark-600/50 rounded-lg p-3 transition-all flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg flex-shrink-0">{TYPE_ICONS[indicator.indicator_type] || '🔍'}</span>
          <div className="min-w-0">
            <p className="text-sm font-mono text-gray-200 truncate group-hover:text-primary transition-colors" title={indicator.value}>
              {indicator.value}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${SEVERITY_COLORS[indicator.severity] || 'text-gray-500'}`}>
                {indicator.severity}
              </span>
              <span className="text-[10px] text-gray-500">•</span>
              <span className="text-[10px] text-gray-500 truncate">
                {new Date(indicator.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <span className="text-[10px] bg-dark-600 text-gray-400 px-1.5 py-0.5 rounded uppercase font-bold">
            {indicator.indicator_type}
          </span>
        </div>
      </div>
    </Link>
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
  const criticalCount = indicators.filter((i) => i.confidence >= 70 || i.severity === 'Critical').length

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
  }).slice(0, 15) // Increased limit but enabled scroll

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

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Heatmap Section */}
        <div className="xl:flex-[2] bg-dark-800 border border-dark-600 rounded-lg p-4 h-[500px] flex flex-col">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Africa Threat Heatmap</h2>
          <div className="flex-1 min-h-0">
            <AfricaMap indicators={indicators} />
          </div>
        </div>

        {/* Recently Reported Section */}
        <div className="xl:flex-1 bg-dark-800 border border-dark-600 rounded-lg p-4 h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Recently Reported</h2>
            <div className="flex bg-dark-900 border border-dark-600 rounded-md p-0.5">
              {['today', 'week', 'month'].map((f) => (
                <button
                  key={f}
                  onClick={() => setRecentFilter(f)}
                  className={`text-[9px] px-2 py-0.5 rounded uppercase font-black transition-colors ${
                    recentFilter === f ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {recentIndicators.length > 0 ? (
              recentIndicators.map((ind) => (
                <SlimThreatCard key={ind.id} indicator={ind} />
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center border border-dark-700 border-dashed rounded-lg p-8 text-center bg-dark-900/20">
                <p className="text-gray-500 text-sm">No indicators reported in this period.</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-3 border-t border-dark-700">
            <Link to="/feed" className="block w-full py-2 text-[10px] text-primary hover:text-primary-hover font-black uppercase tracking-widest transition-colors text-center border border-primary/20 rounded hover:bg-primary/5">
              View All in Threat Feed →
            </Link>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
  )
}
