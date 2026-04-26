import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { indicatorsApi } from '../api/client'
import { ArrowLeft, Shield, Info, Activity, Database, FileText, Calendar, Clock, Globe, Zap } from 'lucide-react'

const AFFECTED_SYSTEMS = {
  ip: ['Firewalls & network perimeter devices', 'SIEM / log aggregation systems', 'Endpoint detection & response (EDR) agents', 'VPN gateways', 'Web application firewalls (WAF)'],
  domain: ['DNS resolvers & recursive servers', 'Email gateways (MX records)', 'Web proxies & content filters', 'Browser-based endpoints', 'Certificate transparency monitors'],
  url: ['Web browsers on user endpoints', 'Email clients that render HTML', 'Web proxies & URL filtering systems', 'Mobile apps with embedded web views'],
  hash_md5: ['Endpoint antivirus / EDR solutions', 'File integrity monitoring (FIM) systems', 'Email attachment scanners', 'Cloud storage & file-sharing platforms'],
  hash_sha256: ['Endpoint antivirus / EDR solutions', 'File integrity monitoring (FIM) systems', 'Email attachment scanners', 'Cloud storage & file-sharing platforms'],
  email: ['Email gateways & spam filters', 'User inboxes (phishing target)', 'Identity & access management (IAM) systems', 'HR & finance systems (BEC target)'],
}

const CATEGORY_ACTIONS = {
  'Phishing': [
    'Block the indicator at your email gateway and DNS layer immediately.',
    'Notify users who may have received emails from this source.',
    'Enable multi-factor authentication (MFA) on all user accounts.',
    'Run a mailbox search to identify any delivered messages and quarantine them.',
  ],
  'Business Email Compromise': [
    'Alert finance and HR teams to verify any pending wire transfers or payroll changes.',
    'Block the sender domain/IP at the email gateway.',
    'Implement DMARC, DKIM, and SPF on your mail domain.',
    'Require out-of-band (phone) confirmation for financial transactions.',
  ],
  'Mobile Money Fraud': [
    'Report the indicator to the relevant mobile money operator (MTN, M-Pesa, Airtel Money, etc.).',
    'Block associated IPs/domains at the API gateway level.',
    'Review transaction logs for anomalous small-value probing transactions.',
    'Enforce rate limiting and device-binding on mobile money APIs.',
  ],
  'SIM Swap': [
    'Alert telecom fraud teams to flag the associated number/account.',
    'Disable SMS-based OTP for high-risk accounts; switch to authenticator apps.',
    'Audit recent SIM swap requests in your subscriber management system.',
    'Implement additional identity verification steps for SIM change requests.',
  ],
  'Ransomware': [
    'Isolate any hosts that communicated with this indicator immediately.',
    'Block the indicator at firewall, DNS, and proxy layers.',
    'Verify offline backups are intact and untouched.',
    'Hunt for lateral movement using EDR telemetry across the environment.',
  ],
  'Data Exfiltration': [
    'Block outbound connections to this indicator at the firewall.',
    'Review DLP alerts for large or unusual data transfers to this destination.',
    'Audit access logs for sensitive data stores (databases, file shares, S3 buckets).',
    'Rotate credentials for any accounts that may have been compromised.',
  ],
  'DDoS': [
    'Activate upstream DDoS mitigation / scrubbing service.',
    'Block the source IP ranges at the network edge.',
    'Enable rate limiting and geo-blocking where appropriate.',
    'Notify your ISP and coordinate null-routing if volumetric.',
  ],
  'SSH Brute Force': [
    'Block the source IP at the firewall and fail2ban immediately.',
    'Disable password-based SSH authentication; enforce key-based auth only.',
    'Move SSH to a non-standard port or restrict access via VPN.',
    'Audit /var/log/auth.log for any successful logins from this IP.',
  ],
  'Credential Stuffing': [
    'Block the source IP at your WAF and application layer.',
    'Force password resets for accounts targeted during the attack window.',
    'Enable MFA on all user-facing login endpoints.',
    'Implement CAPTCHA and account lockout policies.',
  ],
  'Malware Distribution': [
    'Block the URL/domain/IP at DNS, proxy, and email gateway.',
    'Scan endpoints for the associated file hash using EDR.',
    'Alert users who may have visited the URL or downloaded the file.',
    'Submit the sample to your AV vendor for signature update.',
  ],
  'SQL Injection': [
    'Block the source IP at the WAF immediately.',
    'Review web application logs for successful injection attempts.',
    'Audit database query logs for unexpected data access or exfiltration.',
    'Patch the vulnerable endpoint and enforce parameterised queries.',
  ],
  'API Abuse': [
    'Revoke and rotate any API keys that may have been exposed.',
    'Enforce rate limiting and IP allowlisting on sensitive API endpoints.',
    'Review API access logs for data harvesting patterns.',
    'Implement OAuth scopes to limit what each key can access.',
  ],
}

const DEFAULT_ACTIONS = [
  'Block the indicator at your firewall, DNS resolver, and email gateway.',
  'Search your SIEM for any historical hits against this indicator.',
  'Notify your incident response team and open a tracking ticket.',
  'Share the indicator with your sector ISAC or national CERT.',
]

function ImpactSection({ indicatorType, attackCategories }) {
  const systems = AFFECTED_SYSTEMS[indicatorType] || []
  const actions = attackCategories?.length
    ? [...new Set(attackCategories.flatMap((c) => CATEGORY_ACTIONS[c] || DEFAULT_ACTIONS))]
    : DEFAULT_ACTIONS

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-dark-800 border border-orange-800/50 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-orange-300 uppercase tracking-wide mb-3">⚠️ Systems That Could Be Affected</h2>
        <ul className="space-y-2">
          {systems.map((s) => (
            <li key={s} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-orange-400 mt-0.5 flex-shrink-0">▸</span>{s}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-dark-800 border border-green-800/50 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-green-300 uppercase tracking-wide mb-3">🛡️ Actionable Protection Steps</h2>
        <ol className="space-y-2">
          {actions.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-green-400 font-bold flex-shrink-0">{i + 1}.</span>{a}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

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

      <Section title="Details">
        <Field label="ID" value={indicator.id} />
        <Field label="Type" value={indicator.indicator_type} />
        <Field label="Severity" value={indicator.severity} />
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
