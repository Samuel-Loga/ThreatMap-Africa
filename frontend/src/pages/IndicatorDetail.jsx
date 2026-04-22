import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { indicatorsApi } from '../api/client'

const TLP_COLORS = {
  WHITE: 'bg-gray-200 text-gray-800',
  GREEN: 'bg-green-700 text-green-100',
  AMBER: 'bg-amber-600 text-amber-100',
  RED: 'bg-red-700 text-red-100',
}

function Section({ title, children }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg p-5">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="flex gap-3 py-2 border-b border-dark-700 last:border-0">
      <span className="text-sm text-gray-400 w-40 flex-shrink-0">{label}</span>
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

  if (loading) return <div className="text-center text-gray-400 py-20 animate-pulse">Loading…</div>
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
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/feed" className="text-gray-400 hover:text-white text-sm">← Back to Feed</Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono break-all">{indicator.value}</h1>
          <p className="text-gray-400 mt-1 capitalize">{indicator.indicator_type}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-1 rounded font-semibold ${TLP_COLORS[indicator.tlp] || 'bg-dark-600 text-gray-300'}`}>
            TLP:{indicator.tlp}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${indicator.status === 'enriched' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
            {indicator.status}
          </span>
        </div>
      </div>

      <Section title="Details">
        <Field label="ID" value={indicator.id} />
        <Field label="Type" value={indicator.indicator_type} />
        <Field label="Confidence" value={`${indicator.confidence}%`} />
        <Field label="Countries" value={(indicator.country_codes || []).join(', ') || '—'} />
        <Field label="Sectors" value={(indicator.sectors || []).join(', ') || '—'} />
        <Field label="Attack Categories" value={(indicator.attack_categories || []).join(', ') || '—'} />
        <Field label="First Seen" value={new Date(indicator.first_seen).toLocaleString()} />
        <Field label="Last Seen" value={new Date(indicator.last_seen).toLocaleString()} />
        <Field label="Created" value={new Date(indicator.created_at).toLocaleString()} />
        <Field label="STIX ID" value={indicator.stix_id} />
        {indicator.description && (
          <div className="py-2">
            <p className="text-sm text-gray-400 mb-1">Description</p>
            <p className="text-sm text-gray-200">{indicator.description}</p>
          </div>
        )}
      </Section>

      {indicator.enrichment_results?.length > 0 && (
        <Section title="Enrichment Results">
          {indicator.enrichment_results.map((er) => (
            <div key={er.id} className="border border-dark-600 rounded-lg p-4 mb-3 last:mb-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-primary">{er.source}</span>
                <span className="text-xs text-gray-500">{new Date(er.enriched_at).toLocaleString()}</span>
              </div>
              {er.country && <Field label="Country" value={er.country} />}
              {er.asn && <Field label="ASN" value={er.asn} />}
              {er.malicious_votes > 0 && (
                <Field label="Malicious Votes" value={er.malicious_votes} />
              )}
            </div>
          ))}
        </Section>
      )}

      {Object.keys(indicator.enrichment_data || {}).length > 0 && (
        <Section title="Raw Enrichment Data">
          <pre className="text-xs text-gray-300 overflow-auto max-h-60 bg-dark-900 rounded p-3">
            {JSON.stringify(indicator.enrichment_data, null, 2)}
          </pre>
        </Section>
      )}

      <Section title="STIX 2.1 Representation">
        <button
          onClick={() => setShowStix(!showStix)}
          className="text-sm text-primary hover:underline mb-3"
        >
          {showStix ? 'Hide' : 'Show'} STIX Object
        </button>
        {showStix && (
          <pre className="text-xs text-gray-300 overflow-auto max-h-60 bg-dark-900 rounded p-3">
            {JSON.stringify(stixObj, null, 2)}
          </pre>
        )}
      </Section>
    </div>
  )
}
