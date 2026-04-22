import { useState } from 'react'
import { exportApi } from '../api/client'

const COUNTRIES = [
  "NG","KE","ZA","GH","ET","TZ","EG","MA","SN","RW","CM","UG","ZM","CI","DZ",
  "AO","BF","BI","BJ","BW","CD","CF","CG","CV","DJ","ER","GA","GM","GN","GQ",
  "GW","KM","LR","LS","LY","MG","ML","MR","MU","MW","MZ","NA","NE","SC","SD",
  "SL","SO","SS","ST","SZ","TD","TG","TN","ZW",
]
const SECTORS = ["banking","telecommunications","government","healthcare","energy","retail","ngo","education"]
const ATTACK_CATS = [
  "mobile_money_fraud","sim_swap","business_email_compromise","phishing_localized",
  "ransomware","account_takeover","supply_chain","data_exfiltration",
]

export default function Export() {
  const [filters, setFilters] = useState({ country: '', sector: '', attack_category: '' })
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }))
  const selectClass = "w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary"

  const fetchBundle = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.country) params.country = filters.country
      if (filters.sector) params.sector = filters.sector
      if (filters.attack_category) params.attack_category = filters.attack_category
      const res = await exportApi.stix(params)
      return res.data
    } catch (err) {
      setError(err.response?.data?.detail || 'Export failed')
      return null
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = async () => {
    const bundle = await fetchBundle()
    if (bundle) setPreview(bundle)
  }

  const handleDownload = async () => {
    const bundle = await fetchBundle()
    if (!bundle) return
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `threatmap-africa-stix-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Export</h1>
        <p className="text-gray-400 mt-1">Export threat indicators as STIX 2.1 bundle</p>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Filter Options</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Country</label>
            <select className={selectClass} value={filters.country} onChange={set('country')}>
              <option value="">All Countries</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Sector</label>
            <select className={selectClass} value={filters.sector} onChange={set('sector')}>
              <option value="">All Sectors</option>
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Attack Category</label>
            <select className={selectClass} value={filters.attack_category} onChange={set('attack_category')}>
              <option value="">All Categories</option>
              {ATTACK_CATS.map((a) => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handlePreview}
            disabled={loading}
            className="flex-1 border border-primary text-primary hover:bg-primary/10 disabled:opacity-50 font-semibold rounded py-2.5 transition-colors text-sm"
          >
            {loading ? 'Loading…' : '👁 Preview'}
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold rounded py-2.5 transition-colors text-sm"
          >
            {loading ? 'Loading…' : '⬇ Download STIX Bundle'}
          </button>
        </div>
      </div>

      {preview && (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              Preview — {preview.objects?.length || 0} objects
            </h2>
            <button onClick={() => setPreview(null)} className="text-xs text-gray-400 hover:text-white">
              Close
            </button>
          </div>
          <pre className="text-xs text-gray-300 overflow-auto max-h-96 bg-dark-900 rounded p-3">
            {JSON.stringify(preview, null, 2)}
          </pre>
        </div>
      )}

      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 text-sm text-gray-400 space-y-2">
        <h3 className="text-gray-300 font-semibold">TAXII 2.1 Server</h3>
        <p>Access indicators programmatically via the TAXII 2.1 API:</p>
        <div className="space-y-1 font-mono text-xs bg-dark-900 rounded p-3">
          <p className="text-green-400">GET /taxii/ — Discovery</p>
          <p className="text-green-400">GET /taxii/collections/ — List collections</p>
          <p className="text-green-400">GET /taxii/collections/{'<id>'}/objects/ — Get objects</p>
        </div>
      </div>
    </div>
  )
}
