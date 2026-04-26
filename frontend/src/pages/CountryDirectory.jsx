import { useState } from 'react'

const AFRICAN_COUNTRIES = [
  "NG","KE","ZA","GH","ET","TZ","EG","MA","SN","RW",
  "CM","UG","ZM","CI","DZ","AO","BF","BI","BJ","BW",
  "CD","CF","CG","CV","DJ","ER","GA","GM","GN","GQ",
  "GW","KM","LR","LS","LY","MG","ML","MR","MU","MW",
  "MZ","NA","NE","SC","SD","SL","SO","SS","ST","SZ",
  "TD","TG","TN","ZW",
]

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

const COUNTRIES = AFRICAN_COUNTRIES.map((code) => ({
  code,
  name: (() => { try { return regionNames.of(code) } catch { return code } })(),
})).sort((a, b) => a.name.localeCompare(b.name))

export default function CountryDirectory() {
  const [search, setSearch] = useState('')

  const filtered = COUNTRIES.filter(
    ({ code, name }) =>
      name.toLowerCase().includes(search.toLowerCase()) ||
      code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold whitespace-nowrap">Country Directory</h1>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by name or code..."
            className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <p className="text-sm text-gray-400">{filtered.length} African countries tracked on ThreatMap</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filtered.map(({ code, name }) => (
          <div
            key={code}
            className="bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 flex items-center justify-between hover:border-primary/50 transition-colors"
          >
            <span className="text-sm text-gray-200">{name}</span>
            <span className="text-xs font-mono bg-blue-900/30 text-blue-300 border border-blue-800/50 px-2 py-0.5 rounded">
              {code}
            </span>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-400 py-12">No countries match your search.</div>
      )}
    </div>
  )
}
