import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { indicatorsApi } from '../api/client'
import { ArrowLeft, Shield, Info, Activity, Database, FileText, Calendar, Clock, Globe, Zap } from 'lucide-react'

const TLP_COLORS = {
  WHITE: 'bg-gray-200 text-gray-800',
  GREEN: 'bg-green-700 text-green-100',
  AMBER: 'bg-amber-600 text-amber-100',
  RED: 'bg-red-700 text-red-100',
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg p-5 shadow-lg">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
        {Icon && <Icon size={16} className="text-primary" />}
        {title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-dark-700 last:border-0">
      <span className="text-sm text-gray-400 w-40 flex-shrink-0 flex items-center gap-2">
        {Icon && <Icon size={14} />}
        {label}
      </span>
      <span className="text-sm text-gray-200 flex-1 font-mono break-all">{String(value ?? '—')}</span>
    </div>
  )
}

export default function IndicatorDetail() {
  const { id } = useParams()
  const [indicator, setIndicator] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showStix, setShowStix] = useState(false)

  useEffect(() => {
    indicatorsApi.get(id)
      .then((res) => setIndicator(res.data))
      .catch(() => setError('Indicator not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <div className="text-gray-400">Loading intelligence...</div>
    </div>
  )
  
  if (error) return <div className="text-center text-red-400 py-20">{error}</div>
  if (!indicator) return null

  const stixObj = {
    type: 'indicator',
    spec_version: '2.1',
    id: indicator.stix_id,
    name: `${indicator.indicator_type}: ${indicator.value}`,
    pattern_type: 'stix',
    valid_from: indicator.first_seen,
    confidence: indicator.confidence,
    created: indicator.created_at,
    modified: indicator.last_seen,
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/feed" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft size={16} />
          Back to Feed
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-800 border border-dark-600 p-6 rounded-xl shadow-xl">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold font-mono break-all text-gray-100">{indicator.value}</h1>
          <div className="flex items-center gap-2 mt-2 text-gray-400">
            <span className="uppercase text-xs font-bold tracking-widest bg-dark-700 px-2 py-1 rounded">{indicator.indicator_type}</span>
            <span className="text-sm">•</span>
            <span className="text-sm flex items-center gap-1">
              <Shield size={14} className="text-primary" />
              {indicator.confidence}% Confidence
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <span className={`text-xs px-3 py-1.5 rounded-full font-bold tracking-tight ${TLP_COLORS[indicator.tlp] || 'bg-dark-600 text-gray-300'}`}>
            TLP:{indicator.tlp}
          </span>
          <span className={`text-xs px-3 py-1.5 rounded-full font-bold tracking-tight flex items-center gap-1.5 ${indicator.status === 'enriched' ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-yellow-900/40 text-yellow-400 border border-yellow-800'}`}>
            <span className={`w-2 h-2 rounded-full ${indicator.status === 'enriched' ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
            {indicator.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Intelligence Details" icon={Info}>
            <Field label="STIX ID" value={indicator.stix_id} icon={FileText} />
            <Field label="Indicator Type" value={indicator.indicator_type} icon={Activity} />
            <Field label="Target Countries" value={(indicator.country_codes || []).join(', ') || '—'} icon={Globe} />
            <Field label="Impacted Sectors" value={(indicator.sectors || []).join(', ') || '—'} icon={Database} />
            <Field label="Attack Categories" value={(indicator.attack_categories || []).join(', ') || '—'} icon={Zap} />
          </Section>

          {indicator.description && (
            <Section title="Description" icon={FileText}>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{indicator.description}</p>
            </Section>
          )}

          {indicator.enrichment_results?.length > 0 && (
            <Section title="Automated Enrichment" icon={Zap}>
              <div className="space-y-4">
                {indicator.enrichment_results.map((er) => (
                  <div key={er.id} className="bg-dark-700/30 border border-dark-600 rounded-lg p-4 transition-hover hover:border-primary/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-primary">{er.source}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(er.enriched_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      {er.country && <Field label="Detected Country" value={er.country} />}
                      {er.asn && <Field label="ASN" value={er.asn} />}
                      {er.malicious_votes > 0 && (
                        <div className="flex items-center gap-2 py-2">
                          <span className="text-sm text-red-400 font-bold">Malicious Votes: {er.malicious_votes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="space-y-6">
          <Section title="Temporal Context" icon={Calendar}>
            <Field label="First Seen" value={new Date(indicator.first_seen).toLocaleString()} icon={Clock} />
            <Field label="Last Seen" value={new Date(indicator.last_seen).toLocaleString()} icon={Clock} />
            <Field label="Reported At" value={new Date(indicator.created_at).toLocaleString()} icon={Calendar} />
          </Section>

          <Section title="Export & API" icon={Database}>
            <div className="space-y-4">
              <button
                onClick={() => setShowStix(!showStix)}
                className="w-full flex items-center justify-center gap-2 text-sm text-primary border border-primary/20 hover:bg-primary/10 rounded-lg py-2 transition-colors"
              >
                {showStix ? 'Hide' : 'Show'} STIX 2.1 JSON
              </button>
              {showStix && (
                <pre className="text-[10px] text-gray-400 overflow-auto max-h-96 bg-dark-900 rounded-lg p-3 border border-dark-700">
                  {JSON.stringify(stixObj, null, 2)}
                </pre>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
