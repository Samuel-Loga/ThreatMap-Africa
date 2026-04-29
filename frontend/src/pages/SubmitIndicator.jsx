import { useState, useMemo } from 'react'
import { indicatorsApi } from '../api/client'
import { Link } from 'react-router-dom'
import { CheckCircle2, Send, AlertTriangle, Shield, Info, ArrowRight, Globe } from 'lucide-react'

const COUNTRIES = [
  { code: "NG", name: "Nigeria" }, { code: "KE", name: "Kenya" }, { code: "ZA", name: "South Africa" }, 
  { code: "GH", name: "Ghana" }, { code: "ET", name: "Ethiopia" }, { code: "TZ", name: "Tanzania" }, 
  { code: "EG", name: "Egypt" }, { code: "MA", name: "Morocco" }, { code: "SN", name: "Senegal" }, 
  { code: "RW", name: "Rwanda" }, { code: "CM", name: "Cameroon" }, { code: "UG", name: "Uganda" }, 
  { code: "ZM", name: "Zambia" }, { code: "CI", name: "Ivory Coast" }, { code: "DZ", name: "Algeria" },
  { code: "AO", name: "Angola" }, { code: "BF", name: "Burkina Faso" }, { code: "BI", name: "Burundi" }, 
  { code: "BJ", name: "Benin" }, { code: "BW", name: "Botswana" }, { code: "CD", name: "DR Congo" }, 
  { code: "CF", name: "Central African Republic" }, { code: "CG", name: "Congo" }, { code: "CV", name: "Cape Verde" }, 
  { code: "DJ", name: "Djibouti" }, { code: "ER", name: "Eritrea" }, { code: "GA", name: "Gabon" }, 
  { code: "GM", name: "Gambia" }, { code: "GN", name: "Guinea" }, { code: "GQ", name: "Equatorial Guinea" },
  { code: "GW", name: "Guinea-Bissau" }, { code: "KM", name: "Comoros" }, { code: "LR", name: "Liberia" }, 
  { code: "LS", name: "Lesotho" }, { code: "LY", name: "Libya" }, { code: "MG", name: "Madagascar" }, 
  { code: "ML", name: "Mali" }, { code: "MR", name: "Mauritania" }, { code: "MU", name: "Mauritius" }, 
  { code: "MW", name: "Malawi" }, { code: "MZ", name: "Mozambique" }, { code: "NA", name: "Namibia" }, 
  { code: "NE", name: "Niger" }, { code: "SC", name: "Seychelles" }, { code: "SD", name: "Sudan" },
  { code: "SL", name: "Sierra Leone" }, { code: "SO", name: "Somalia" }, { code: "SS", name: "South Sudan" }, 
  { code: "ST", name: "Sao Tome and Principe" }, { code: "SZ", name: "Eswatini" }, { code: "TD", name: "Chad" }, 
  { code: "TG", name: "Togo" }, { code: "TN", name: "Tunisia" }, { code: "ZW", name: "Zimbabwe" },
]
const SECTORS = ["Banking","Telecommunications","Government","Healthcare","Energy","Retail","NGO","Education"]
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
    const optVal = typeof opt === 'object' ? opt.code : opt
    if (value.includes(optVal)) {
      onChange(value.filter((v) => v !== optVal))
    } else {
      onChange([...value, optVal])
    }
  }
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const optVal = typeof opt === 'object' ? opt.code : opt
          const optLabel = typeof opt === 'object' ? opt.code : opt
          const optTitle = typeof opt === 'object' ? opt.name : ''
          
          return (
            <button
              key={optVal}
              type="button"
              onClick={() => toggle(opt)}
              className={`text-xs px-2 py-1 rounded border transition-colors relative group ${
                value.includes(optVal)
                  ? 'bg-primary/20 border-primary text-primary font-bold'
                  : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-gray-500'
              }`}
            >
              {optLabel}
              {optTitle && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-dark-600 shadow-xl">
                  {optTitle}
                </span>
              )}
            </button>
          )
        })}
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
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join('; '))
      } else {
        setError(detail || 'Submission failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2.5 text-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-sm"
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"

  const typeConfigs = {
    ip: { label: 'IP Address', placeholder: 'e.g. 197.232.1.5', icon: Shield },
    domain: { label: 'Domain Name', placeholder: 'e.g. maliciousexample.co.za', icon: Globe },
    url: { label: 'Full URL', placeholder: 'e.g. https://phish-site.ng/login.php', icon: Info },
    hash_md5: { label: 'MD5 Hash', placeholder: 'e.g. 44d88612fea8a8f36de82e1278abb02f', icon: Shield },
    hash_sha256: { label: 'SHA256 Hash', placeholder: 'e.g. e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', icon: Shield },
    email: { label: 'Email Address', placeholder: 'attacker@fraud-service.rw', icon: Shield },
  }

  const activeConfig = typeConfigs[form.indicator_type] || typeConfigs.ip

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="bg-green-900/10 border border-green-700/30 rounded-2xl p-12 text-center shadow-2xl backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <div className="bg-green-500/20 p-4 rounded-full">
              <CheckCircle2 size={64} className="text-green-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Intelligence Published</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-10">
            Thank you for contributing. This indicator has been queued for automated enrichment and is now being shared with the community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={`/indicators/${submitted.id}`} className="flex items-center justify-center gap-2 px-8 py-3 bg-primary rounded-xl text-sm font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
              View Indicator Detail <ArrowRight size={18} />
            </Link>
            <button onClick={() => setSubmitted(null)} className="px-8 py-3 bg-dark-700 border border-dark-600 rounded-xl text-sm font-bold hover:bg-dark-600 transition-all">
              Submit Another Artefact
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Send className="text-primary" size={28} />
            </div>
            Submit Intelligence
          </h1>
          <p className="text-gray-400 mt-1">Contribute new threat indicators to the African cyber-defence community</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-dark-800 px-3 py-1.5 rounded-full border border-dark-600">
          <Shield size={14} className="text-primary" />
          COMMUNITY CONTRIBUTION
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {error && (
            <div className="bg-red-900/20 border border-red-700/50 text-red-400 rounded-xl px-5 py-4 text-sm flex items-start gap-3 shadow-lg">
              <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Submission Error</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Core Identification */}
          <section className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden shadow-xl text-left">
            <div className="bg-dark-700/50 px-6 py-4 border-b border-dark-600">
               <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest flex items-center gap-2">
                 <Shield size={16} className="text-primary" />
                 Artefact Identification
               </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Indicator Type</label>
                  <select className={inputClass} value={form.indicator_type} onChange={set('indicator_type')}>
                    {INDICATOR_TYPES.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Traffic Light Protocol</label>
                  <select className={inputClass} value={form.tlp} onChange={set('tlp')}>
                    {TLP_VALUES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Severity</label>
                  <select 
                    className={`${inputClass} font-bold ${
                      form.severity === 'Critical' ? 'text-red-500' : 
                      form.severity === 'High' ? 'text-orange-400' : 
                      'text-gray-200'
                    }`}
                    value={form.severity} 
                    onChange={set('severity')}
                  >
                    {SEVERITY_VALUES.map((v) => <option key={v} value={v} className="bg-dark-800 text-white">{v}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                   <label className={labelClass}>Confidence Rating</label>
                   <span className="text-sm font-black text-primary">{form.confidence}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.confidence}
                  onChange={set('confidence')}
                  className="w-full h-1.5 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-2 uppercase font-bold">
                  <span>Informational</span>
                  <span>Fully Verified</span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200"></div>
                <div className="relative bg-dark-900/50 border border-dark-600 rounded-xl p-5">
                  <label className="block text-xs font-bold text-primary mb-2 uppercase tracking-widest flex items-center gap-2">
                    <activeConfig.icon size={14} />
                    {activeConfig.label} Value
                  </label>
                  <input
                    type="text"
                    className="w-full bg-transparent border-none p-0 text-xl md:text-2xl font-mono text-white placeholder-dark-500 focus:outline-none focus:ring-0"
                    value={form.value}
                    onChange={set('value')}
                    required
                    placeholder={activeConfig.placeholder}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Context & Description */}
          <section className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden shadow-xl text-left">
             <div className="bg-dark-700/50 px-6 py-4 border-b border-dark-600">
               <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest flex items-center gap-2">
                 <Info size={16} className="text-primary" />
                 Contextual Analysis
               </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className={labelClass}>Initial Discovery</label>
                   <input type="datetime-local" className={inputClass} value={form.first_seen} onChange={set('first_seen')} />
                </div>
                <div>
                   <label className={labelClass}>Last Observed</label>
                   <input type="datetime-local" className={inputClass} value={form.last_seen} onChange={set('last_seen')} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Detailed Technical Analysis</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={6}
                  value={form.description}
                  onChange={set('description')}
                  required
                  placeholder="Describe the threat behavior, observed impact, and any indicators of compromise (IOCs) linked to this artefact..."
                />
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tight italic">Minimum 50 characters for verification</span>
                  <span className={`text-[10px] font-bold ${form.description.length > 1900 ? 'text-red-400' : 'text-gray-500'}`}>{form.description.length} / 2000</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8">
           <section className="bg-dark-800 border border-dark-600 rounded-2xl p-6 shadow-xl space-y-6 text-left">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-dark-700 pb-2">Categorization</h4>
              
              <MultiSelect label="Impacted Countries" options={COUNTRIES} value={form.country_codes} onChange={setArr('country_codes')} />
              <MultiSelect label="Target Sectors" options={SECTORS} value={form.sectors} onChange={setArr('sectors')} />
              <MultiSelect label="Threat Categories" options={ATTACK_CATS} value={form.attack_categories} onChange={setArr('attack_categories')} />
           </section>

           <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full group bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-black rounded-2xl py-5 shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="uppercase tracking-widest text-sm">Transmitting...</span>
                  </>
                ) : (
                  <>
                    <span className="uppercase tracking-widest text-sm">Publish Intelligence</span>
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
              <p className="text-[10px] text-gray-500 text-center mt-4 px-4 leading-relaxed uppercase font-bold tracking-tight">
                By publishing, you agree that this data is shared under the TLP guidelines selected above.
              </p>
           </div>
        </div>
      </form>
    </div>
  )
}
