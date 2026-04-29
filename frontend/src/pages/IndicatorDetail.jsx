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

const SOURCE_NAMES = {
  'virustotal': 'VirusTotal',
  'abuseipdb': 'AbuseIPDB',
  'ip-api.com': 'IP-API.COM',
  'shodan_internetdb': 'Shodan InternetDB',
  'greynoise': 'GreyNoise',
  'urlscan.io': 'URLScan.io',
  'otx': 'AlienVault OTX',
  'securitytrails': 'SecurityTrails',
  'emailrep.io': 'EmailRep.io',
  'malwarebazaar': 'MalwareBazaar',
}

function formatSourceName(source) {
  return SOURCE_NAMES[source] || source.toUpperCase()
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

  const SEVERITY_COLORS = {
    Info: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    Low: 'text-green-400 bg-green-400/10 border-green-400/20',
    Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    High: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    Critical: 'text-red-500 bg-red-500/10 border-red-500/20',
  }

  const uniqueEnrichmentResults = indicator.enrichment_results?.reduce((acc, current) => {
    const x = acc.find(item => item.source === current.source);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/feed" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft size={16} />
          Back to Feed
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-dark-800 border border-dark-600 p-6 rounded-xl shadow-xl">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="uppercase text-[10px] font-bold tracking-widest bg-dark-700 text-primary px-2 py-1 rounded border border-primary/20">{indicator.indicator_type}</span>
            <span className={`text-[10px] px-2 py-1 rounded border font-bold tracking-tight uppercase ${SEVERITY_COLORS[indicator.severity] || 'bg-dark-600 text-gray-300 border-dark-500'}`}>
              {indicator.severity} Severity
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-mono break-all text-gray-100">{indicator.value}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-gray-400">
            <span className="text-sm flex items-center gap-1.5">
              <Shield size={14} className="text-primary" />
              {indicator.confidence}% Confidence
            </span>
            <span className="hidden md:block text-gray-600">•</span>
            <span className="text-sm flex items-center gap-1.5">
              <Globe size={14} className="text-blue-400" />
              {(indicator.country_codes || []).join(', ') || 'Global'}
            </span>
            <span className="hidden md:block text-gray-600">•</span>
            <span className="text-sm flex items-center gap-1.5">
              <Activity size={14} className="text-purple-400" />
              {(indicator.attack_categories || []).join(', ') || 'General Threat'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-dark-700">
          <div className="text-right mr-3 hidden md:block">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Status</p>
            <p className="text-sm text-gray-200 capitalize font-medium">{indicator.status}</p>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-bold tracking-tight ${TLP_COLORS[indicator.tlp] || 'bg-dark-600 text-gray-300'}`}>
            TLP:{indicator.tlp}
          </span>
          <span className={`text-xs px-3 py-1.5 rounded-full font-bold tracking-tight flex items-center gap-1.5 ${indicator.status === 'enriched' ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-yellow-900/40 text-yellow-400 border border-yellow-800'}`}>
            <span className={`w-2 h-2 rounded-full ${indicator.status === 'enriched' ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
            {indicator.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Section title="Artefact Threat Intelligence" icon={Info}>
            <div className="space-y-6">
              {indicator.description && (
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-wider">Description</p>
                  <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-primary/30 pl-4 py-1">
                    "{indicator.description}"
                  </p>
                </div>
              )}

              <div className={indicator.description ? "pt-4 border-t border-dark-700/50" : ""}>
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-wider">Metadata</p>
                <div className="flex flex-col">
                  <Field label="STIX ID" value={indicator.stix_id} />
                  <Field label="Target Sectors" value={(indicator.sectors || []).join(', ') || 'All Sectors'} />
                  <Field label="Attack Context" value={(indicator.attack_categories || []).join(', ') || 'N/A'} />
                  <Field label="Submitter ID" value={indicator.submitted_by} />
                </div>
              </div>
              
              <div className="pt-4 border-t border-dark-700/50">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-wider">Timeline</p>
                <div className="flex flex-col">
                  <Field label="First Observed" value={new Date(indicator.first_seen).toLocaleString()} icon={Clock} />
                  <Field label="Last Observed" value={new Date(indicator.last_seen).toLocaleString()} icon={Clock} />
                  <div className="flex items-center gap-3 py-2">
                    <span className="text-sm text-gray-400 w-40 flex-shrink-0 flex items-center gap-2">
                      <Activity size={14} />
                      Observation Window
                    </span>
                    <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      {Math.ceil(Math.abs(new Date(indicator.last_seen) - new Date(indicator.first_seen)) / (1000 * 60 * 60 * 24))} Days Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {uniqueEnrichmentResults.length > 0 && (
            <Section title="External Enrichment Data" icon={Zap}>
              <div className="overflow-x-auto -mx-5 -mb-5 mt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-dark-900/40 border-y border-dark-600/50 text-[10px] text-gray-500 uppercase tracking-widest">
                      <th className="py-3 px-5 font-bold">Source</th>
                      <th className="py-3 px-5 font-bold">Detected Country</th>
                      <th className="py-3 px-5 font-bold">ASN / Network</th>
                      <th className="py-3 px-5 font-bold">Threat Verdict</th>
                      <th className="py-3 px-5 font-bold text-right">Last Check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700/50">
                    {uniqueEnrichmentResults.map((er) => (
                      <tr key={er.id} className="hover:bg-dark-700/30 transition-colors group">
                        <td className="py-4 px-5">
                          <span className="text-sm font-bold text-primary group-hover:text-primary-hover">
                            {formatSourceName(er.source)}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-sm text-gray-300">{er.country || '—'}</span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-[11px] text-gray-400 font-mono bg-dark-900/50 px-2 py-1 rounded border border-dark-700">
                            {er.asn || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          {er.malicious_votes > 0 ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-400/10 px-2.5 py-1 rounded-full border border-red-400/20">
                              <Shield size={10} />
                              {er.malicious_votes} Malicious Votes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-green-400 font-medium bg-green-400/10 px-2.5 py-1 rounded-full border border-green-400/20">
                              <Shield size={10} />
                              No Issues Found
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <span className="text-[11px] text-gray-500 font-medium">
                            {new Date(er.enriched_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          <div className="bg-dark-800 border border-dark-600 rounded-lg p-1 overflow-hidden">
             <div className="bg-dark-700/50 px-5 py-3 border-b border-dark-600">
               <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                 <Shield size={16} className="text-green-400" />
                 Impact & Mitigation Strategy
               </h2>
             </div>
             <div className="p-5">
               <ImpactSection indicatorType={indicator.indicator_type} attackCategories={indicator.attack_categories} />
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <Section title="Quick Actions" icon={Activity}>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-start gap-3 text-sm text-gray-300 bg-dark-700 hover:bg-dark-600 rounded-lg px-4 py-2.5 transition-colors border border-dark-600">
                <FileText size={16} className="text-blue-400" />
                Generate Report (PDF)
              </button>
              <button className="w-full flex items-center justify-start gap-3 text-sm text-gray-300 bg-dark-700 hover:bg-dark-600 rounded-lg px-4 py-2.5 transition-colors border border-dark-600">
                <Shield size={16} className="text-green-400" />
                Add to Blocklist
              </button>
              <button className="w-full flex items-center justify-start gap-3 text-sm text-gray-300 bg-dark-700 hover:bg-dark-600 rounded-lg px-4 py-2.5 transition-colors border border-dark-600">
                <Activity size={16} className="text-orange-400" />
                Investigate in SIEM
              </button>
            </div>
          </Section>

          <Section title="Data Portability" icon={Database}>
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Export this indicator in STIX 2.1 format for integration with TIPs and SIEMs.
              </p>
              <button
                onClick={() => setShowStix(!showStix)}
                className="w-full flex items-center justify-center gap-2 text-sm text-primary border border-primary/20 hover:bg-primary/10 rounded-lg py-2 transition-colors"
              >
                {showStix ? 'Hide' : 'Show'} STIX 2.1 JSON
              </button>
              {showStix && (
                <div className="relative">
                   <div className="absolute top-2 right-2 flex gap-2">
                      <button 
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(stixObj, null, 2))}
                        className="p-1.5 bg-dark-700 hover:bg-dark-600 rounded border border-dark-500 text-gray-400 hover:text-white transition-colors"
                        title="Copy to clipboard"
                      >
                        <Database size={12} />
                      </button>
                   </div>
                  <pre className="text-[10px] text-gray-400 font-mono overflow-auto max-h-96 bg-dark-900 rounded-lg p-3 border border-dark-700 custom-scrollbar">
                    {JSON.stringify(stixObj, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Section>
          
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
             <h3 className="text-xs font-bold text-primary uppercase mb-2">Confidence Rating</h3>
             <div className="w-full bg-dark-700 h-2 rounded-full overflow-hidden mb-3">
                <div 
                  className="bg-primary h-full" 
                  style={{ width: `${indicator.confidence}%` }}
                />
             </div>
             <p className="text-[11px] text-gray-400 leading-relaxed">
               This indicator has a confidence score of {indicator.confidence}%, based on its prevalence and verified reporting sources.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
