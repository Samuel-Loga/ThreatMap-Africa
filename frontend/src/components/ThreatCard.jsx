import { Link } from 'react-router-dom'

const TLP_COLORS = {
  WHITE: 'bg-gray-200 text-gray-800',
  GREEN: 'bg-green-700 text-green-100',
  AMBER: 'bg-amber-600 text-amber-100',
  RED: 'bg-red-700 text-red-100',
}

const TYPE_ICONS = {
  ip: '🖥️',
  domain: '🌐',
  url: '🔗',
  hash_md5: '#️⃣',
  hash_sha256: '#️⃣',
  email: '📧',
}

function ConfidenceBar({ value }) {
  const color = value >= 70 ? 'bg-red-500' : value >= 40 ? 'bg-amber-500' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-dark-600 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-400">{value}%</span>
    </div>
  )
}

const SEVERITY_COLORS = {
  Low: 'bg-blue-900/40 text-blue-300 border-blue-800',
  Medium: 'bg-yellow-900/40 text-yellow-300 border-yellow-800',
  High: 'bg-orange-900/40 text-orange-300 border-orange-800',
  Critical: 'bg-red-900/40 text-red-300 border-red-800',
}

export default function ThreatCard({ indicator }) {
  const { id, indicator_type, value, tlp, severity, confidence, country_codes, sectors, attack_categories, created_at, status } = indicator

  return (
    <Link to={`/indicators/${id}`} className="block">
      <div className="bg-dark-800 border border-dark-600 rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl flex-shrink-0">{TYPE_ICONS[indicator_type] || '🔍'}</span>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{indicator_type}</p>
              <p className="text-sm font-mono text-gray-200 truncate" title={value}>{value}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${SEVERITY_COLORS[severity] || 'border-dark-600 text-gray-400'}`}>
                {severity?.toUpperCase()}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${TLP_COLORS[tlp] || 'bg-dark-600 text-gray-300'}`}>
                TLP:{tlp}
              </span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${status === 'enriched' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <ConfidenceBar value={confidence} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {(country_codes || []).map((cc) => (
            <span key={cc} className="text-xs bg-dark-700 text-blue-300 px-1.5 py-0.5 rounded">{cc}</span>
          ))}
          {(sectors || []).map((s) => (
            <span key={s} className="text-xs bg-dark-700 text-purple-300 px-1.5 py-0.5 rounded">{s}</span>
          ))}
          {(attack_categories || []).map((a) => (
            <span key={a} className="text-xs bg-dark-700 text-accent px-1.5 py-0.5 rounded">{a.replace(/_/g, ' ')}</span>
          ))}
        </div>

        <p className="mt-2 text-xs text-gray-500">
          {new Date(created_at).toLocaleString()}
        </p>
      </div>
    </Link>
  )
}
