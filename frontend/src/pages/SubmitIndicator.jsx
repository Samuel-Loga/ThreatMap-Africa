import { useState, useMemo } from 'react'
import { indicatorsApi } from '../api/client'
import { Link } from 'react-router-dom'

const COUNTRIES = [
  "NG","KE","ZA","GH","ET","TZ","EG","MA","SN","RW","CM","UG","ZM","CI","DZ",
  "AO","BF","BI","BJ","BW","CD","CF","CG","CV","DJ","ER","GA","GM","GN","GQ",
  "GW","KM","LR","LS","LY","MG","ML","MR","MU","MW","MZ","NA","NE","SC","SD",
  "SL","SO","SS","ST","SZ","TD","TG","TN","ZW",
]
const SECTORS = ["banking","telecommunications","government","healthcare","energy","retail","ngo","education"]
const ATTACK_CATS = [
  "Phishing", "Business Email Compromise", "Mobile Money Fraud", "SIM Swap", 
  "Ransomware", "Data Exfiltration", "DDoS", "SSH Brute Force", 
  "Supply Chain Attack", "Credential Stuffing", "Social Engineering", 
  "Malware Distribution", "Cryptojacking", "SQL Injection", "XSS", 
  "API Abuse", "Other"
]
const INDICATOR_TYPES = ["ip","domain","url","hash_md5","hash_sha256","email"]
const TLP_VALUES = ["WHITE","GREEN","AMBER","RED"]
const SEVERITY_VALUES = ["Info", "Low", "Medium", "High", "Critical"]

const defaultForm = {
  indicator_type: 'ip',
  value: '',
  tlp: 'GREEN',
  severity: 'Medium',
  confidence: 50,
  country_codes: [],
  sectors: [],
  attack_categories: [],
  description: '',
  first_seen: '',
  last_seen: '',
}

function MultiSelect({ label, options, value, onChange }) {
  const toggle = (opt) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt))
    } else {
      onChange([...value, opt])
    }
  }
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              value.includes(opt)
                ? 'bg-primary/20 border-primary text-primary'
                : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-gray-500'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function SubmitIndicator() {
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setArr = (key) => (val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form, confidence: Number(form.confidence) }
      if (!payload.first_seen) delete payload.first_seen
      if (!payload.last_seen) delete payload.last_seen
      const res = await indicatorsApi.create(payload)
      setSubmitted(res.data)
      setForm(defaultForm)
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-gray-200 focus:outline-none focus:border-primary text-sm"
  const labelClass = "block text-sm text-gray-400 mb-1"

  // Dynamic placeholders and labels based on indicator type
  const typeConfigs = {
    ip: { label: 'IP Address', placeholder: 'e.g. 197.232.1.5' },
    domain: { label: 'Domain Name', placeholder: 'e.g. maliciousexample.co.za' },
    url: { label: 'Full URL', placeholder: 'e.g. https://phish-site.ng/login.php' },
    hash_md5: { label: 'MD5 Hash', placeholder: 'e.g. 44d88612fea8a8f36de82e1278abb02f' },
    hash_sha256: { label: 'SHA256 Hash', placeholder: 'e.g. e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
    email: { label: 'Email Address', placeholder: 'e.g. attacker@fraud-service.rw' },
  }

  const activeConfig = typeConfigs[form.indicator_type] || typeConfigs.ip

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submit Indicator</h1>
        <p className="text-gray-400 mt-1">Report a new threat indicator for African networks</p>
      </div>

      {submitted && (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-center">
          <p className="text-green-300 font-semibold text-lg">✅ Indicator submitted successfully!</p>
          <p className="text-sm text-gray-400 mt-1">
            The indicator has been queued for automated enrichment.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Link to={`/indicators/${submitted.id}`} className="px-4 py-2 bg-primary rounded text-sm font-semibold hover:bg-primary/90">
              View Threat Detail
            </Link>
            <button onClick={() => setSubmitted(null)} className="px-4 py-2 border border-dark-600 rounded text-sm font-semibold hover:bg-dark-700">
              Submit Another
            </button>
          </div>
        </div>
      )}

      {!submitted && (
        <form onSubmit={handleSubmit} className="bg-dark-800 border border-dark-600 rounded-xl p-6 space-y-6 shadow-xl">
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Indicator Type *</label>
              <select className={inputClass} value={form.indicator_type} onChange={set('indicator_type')}>
                {INDICATOR_TYPES.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>TLP *</label>
              <select className={inputClass} value={form.tlp} onChange={set('tlp')}>
                {TLP_VALUES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Severity *</label>
              <select 
                className={`${inputClass} ${
                  form.severity === 'Critical' ? 'text-red-400 border-red-900' : 
                  form.severity === 'High' ? 'text-orange-400' : ''
                }`} 
                value={form.severity} 
                onChange={set('severity')}
              >
                {SEVERITY_VALUES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-dark-700/30 p-4 rounded-lg border border-dark-600/50">
            <label className="block text-sm font-semibold text-primary mb-2">
              {activeConfig.label} Content *
            </label>
            <input
              type="text"
              className={`${inputClass} text-lg py-3`}
              value={form.value}
              onChange={set('value')}
              required
              placeholder={activeConfig.placeholder}
            />
            <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">
              Please ensure the {form.indicator_type} is defanged if necessary or provided in raw format.
            </p>
          </div>

          <div>
            <label className={labelClass}>Confidence Score: <span className="text-primary font-bold">{form.confidence}%</span></label>
            <input
              type="range"
              min="0"
              max="100"
              value={form.confidence}
              onChange={set('confidence')}
              className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-gray-600 mt-1 uppercase">
              <span>Low Confidence</span>
              <span>Fully Verified</span>
            </div>
          </div>

          <div className="space-y-4">
            <MultiSelect label="Impacted African Countries" options={COUNTRIES} value={form.country_codes} onChange={setArr('country_codes')} />
            <MultiSelect label="Targeted Sectors" options={SECTORS} value={form.sectors} onChange={setArr('country_codes')} />
            <MultiSelect label="Threat Categories" options={ATTACK_CATS} value={form.attack_categories} onChange={setArr('attack_categories')} />
          </div>

          <div>
            <label className={labelClass}>Contextual Description *</label>
            <textarea
              className={inputClass}
              rows={4}
              value={form.description}
              onChange={set('description')}
              required
              maxLength={2000}
              placeholder="Provide details on how this threat was identified, potential impact, and any mitigation steps taken."
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">Required for Analyst review</p>
              <p className="text-xs text-gray-400">{form.description.length}/2000</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className={labelClass}>Discovery Date</label>
              <input type="datetime-local" className={inputClass} value={form.first_seen} onChange={set('first_seen')} />
            </div>
            <div>
              <label className={labelClass}>Last Observed</label>
              <input type="datetime-local" className={inputClass} value={form.last_seen} onChange={set('last_seen')} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-lg py-3 shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing Intelligence...
              </span>
            ) : 'Publish Intelligence'}
          </button>
        </form>
      )}
    </div>
  )
}
