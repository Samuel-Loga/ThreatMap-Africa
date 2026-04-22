import { useState } from 'react'
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
  "mobile_money_fraud","sim_swap","business_email_compromise","phishing_localized",
  "ransomware","account_takeover","supply_chain","data_exfiltration",
]
const INDICATOR_TYPES = ["ip","domain","url","hash_md5","hash_sha256","email"]
const TLP_VALUES = ["WHITE","GREEN","AMBER","RED"]

const defaultForm = {
  indicator_type: 'ip',
  value: '',
  tlp: 'GREEN',
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
            {opt.replace(/_/g, ' ')}
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submit Indicator</h1>
        <p className="text-gray-400 mt-1">Report a new threat indicator for African networks</p>
      </div>

      {submitted && (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
          <p className="text-green-300 font-semibold">✅ Indicator submitted successfully!</p>
          <p className="text-sm text-gray-400 mt-1">
            ID: <code className="text-green-400">{submitted.id}</code> — Status: <span className="text-yellow-400">{submitted.status}</span>
          </p>
          <div className="mt-3 flex gap-3">
            <Link to={`/indicators/${submitted.id}`} className="text-sm text-primary hover:underline">
              View Detail →
            </Link>
            <button onClick={() => setSubmitted(null)} className="text-sm text-gray-400 hover:text-white">
              Submit Another
            </button>
          </div>
        </div>
      )}

      {!submitted && (
        <form onSubmit={handleSubmit} className="bg-dark-800 border border-dark-600 rounded-xl p-6 space-y-5">
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Indicator Type *</label>
              <select className={inputClass} value={form.indicator_type} onChange={set('indicator_type')}>
                {INDICATOR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>TLP *</label>
              <select className={inputClass} value={form.tlp} onChange={set('tlp')}>
                {TLP_VALUES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Value *</label>
            <input
              type="text"
              className={inputClass}
              value={form.value}
              onChange={set('value')}
              required
              placeholder="e.g. 192.0.2.1, evil.co.ke, abc123..."
            />
          </div>

          <div>
            <label className={labelClass}>Confidence: {form.confidence}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={form.confidence}
              onChange={set('confidence')}
              className="w-full accent-primary"
            />
          </div>

          <MultiSelect label="Countries (African)" options={COUNTRIES} value={form.country_codes} onChange={setArr('country_codes')} />
          <MultiSelect label="Sectors" options={SECTORS} value={form.sectors} onChange={setArr('sectors')} />
          <MultiSelect label="Attack Categories" options={ATTACK_CATS} value={form.attack_categories} onChange={setArr('attack_categories')} />

          <div>
            <label className={labelClass}>Description (max 2000 chars)</label>
            <textarea
              className={inputClass}
              rows={4}
              value={form.description}
              onChange={set('description')}
              maxLength={2000}
              placeholder="Describe the threat context..."
            />
            <p className="text-xs text-gray-500 mt-1">{form.description.length}/2000</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Seen</label>
              <input type="datetime-local" className={inputClass} value={form.first_seen} onChange={set('first_seen')} />
            </div>
            <div>
              <label className={labelClass}>Last Seen</label>
              <input type="datetime-local" className={inputClass} value={form.last_seen} onChange={set('last_seen')} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold rounded py-2.5 transition-colors"
          >
            {loading ? 'Submitting…' : 'Submit Indicator'}
          </button>
        </form>
      )}
    </div>
  )
}
