import { useState, useEffect } from 'react'
import { indicatorsApi } from '../api/client'
import AfricaMap from '../components/AfricaMap'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function StatCard({ label, value, sub, color = 'text-primary' }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [indicators, setIndicators] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    indicatorsApi.list({ limit: 200 })
      .then((res) => setIndicators(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toDateString()
  const todayCount = indicators.filter((i) => new Date(i.created_at).toDateString() === today).length

  const countryCounts = {}
  const categoryCounts = {}
  const typeCounts = {}

  indicators.forEach((ind) => {
    (ind.country_codes || []).forEach((cc) => { countryCounts[cc] = (countryCounts[cc] || 0) + 1 })
    ;(ind.attack_categories || []).forEach((a) => { categoryCounts[a] = (categoryCounts[a] || 0) + 1 })
    typeCounts[ind.indicator_type] = (typeCounts[ind.indicator_type] || 0) + 1
  })

  const topCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]

  const categoryChartData = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name: name.replace(/_/g, ' '), count }))

  const typeChartData = Object.entries(typeCounts)
    .map(([name, count]) => ({ name, count }))

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Indicators" value={indicators.length} />
        <StatCard label="Today" value={todayCount} color="text-accent" />
        <StatCard
          label="Top Country"
          value={topCountry?.[0] || '—'}
          sub={topCountry ? `${topCountry[1]} indicators` : undefined}
          color="text-blue-400"
        />
        <StatCard
          label="Top Category"
          value={topCategory?.[0]?.replace(/_/g, ' ') || '—'}
          sub={topCategory ? `${topCategory[1]} indicators` : undefined}
          color="text-purple-400"
        />
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Africa Threat Heatmap</h2>
        <AfricaMap indicators={indicators} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">Attack Categories</h2>
          <ResponsiveContainer width="100%" height={220}>
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
          <ResponsiveContainer width="100%" height={220}>
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
