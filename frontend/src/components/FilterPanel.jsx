const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

const COUNTRIES = [
  "NG","KE","ZA","GH","ET","TZ","EG","MA","SN","RW","CM","UG","ZM","CI","DZ",
  "AO","BF","BI","BJ","BW","CD","CF","CG","CV","DJ","ER","GA","GM","GN","GQ",
  "GW","KM","LR","LS","LY","MG","ML","MR","MU","MW","MZ","NA","NE","SC","SD",
  "SL","SO","SS","ST","SZ","TD","TG","TN","ZW",
].map(code => ({
  code,
  name: regionNames.of(code)
})).sort((a, b) => a.name.localeCompare(b.name))

const SECTORS = ["Banking","Telecommunications","Government","Healthcare","Energy","Retail","NGO","Education"]
const ATTACK_CATS = [
  "Phishing", "Business Email Compromise", "Mobile Money Fraud", "SIM Swap", 
  "Ransomware", "Data Exfiltration", "DDoS", "SSH Brute Force", 
  "Supply Chain Attack", "Credential Stuffing", "Social Engineering", 
  "Malware Distribution", "Cryptojacking", "SQL Injection", "XSS", 
  "API Abuse", "Other"
]
const INDICATOR_TYPES = [
  { value: "ip", label: "IP" },
  { value: "domain", label: "Domain" },
  { value: "url", label: "URL" },
  { value: "hash_md5", label: "MD5 Hash" },
  { value: "hash_sha256", label: "SHA256 Hash" },
  { value: "email", label: "Email" }
]
const TLP_VALUES = ["White","Green","Amber","Red"]
const SEVERITY_VALUES = ["Critical", "High", "Medium", "Low", "Info"]

export default function FilterPanel({ filters, onChange }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value })
  const selectClass = "w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary"
  const labelClass = "block text-xs text-gray-400 mb-1"

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Filters</h3>

      <div>
        <label className={labelClass}>Country</label>
        <select className={selectClass} value={filters.country || ''} onChange={set('country')}>
          <option value="">All Countries</option>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>Severity</label>
        <select className={selectClass} value={filters.severity || ''} onChange={set('severity')}>
          <option value="">All Severities</option>
          {SEVERITY_VALUES.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>Sector</label>
        <select className={selectClass} value={filters.sector || ''} onChange={set('sector')}>
          <option value="">All Sectors</option>
          {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>Attack Category</label>
        <select className={selectClass} value={filters.attack_category || ''} onChange={set('attack_category')}>
          <option value="">All Categories</option>
          {ATTACK_CATS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>Indicator Type</label>
        <select className={selectClass} value={filters.indicator_type || ''} onChange={set('indicator_type')}>
          <option value="">All Types</option>
          {INDICATOR_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>TLP</label>
        <select className={selectClass} value={filters.tlp || ''} onChange={set('tlp')}>
          <option value="">All TLP</option>
          {TLP_VALUES.map((t) => <option key={t.toUpperCase()} value={t.toUpperCase()}>{t}</option>)}
        </select>
      </div>

      <button
        onClick={() => onChange({})}
        className="w-full text-sm text-gray-400 hover:text-white border border-dark-600 hover:border-gray-500 rounded py-2 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  )
}
