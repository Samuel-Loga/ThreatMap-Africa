import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { authApi, indicatorsApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

const TYPE_ICONS = {
  ip: '🖥️', domain: '🌐', url: '🔗',
  hash_md5: '#️⃣', hash_sha256: '#️⃣', email: '📧',
}

const SEVERITY_COLORS = {
  Info: 'text-blue-400', Low: 'text-green-400',
  Medium: 'text-yellow-400', High: 'text-orange-400', Critical: 'text-red-500',
}

function SlimThreatCard({ indicator }) {
  return (
    <Link to={`/indicators/${indicator.id}`} className="block group">
      <div className="bg-dark-700/30 hover:bg-dark-700/60 border border-dark-600/50 rounded-lg p-3 transition-all flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg flex-shrink-0">{TYPE_ICONS[indicator.indicator_type] || '🔍'}</span>
          <div className="min-w-0">
            <p className="text-sm font-mono text-gray-200 truncate group-hover:text-primary transition-colors" title={indicator.value}>
              {indicator.value}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${SEVERITY_COLORS[indicator.severity] || 'text-gray-500'}`}>
                {indicator.severity}
              </span>
              <span className="text-[10px] text-gray-500">•</span>
              <span className="text-[10px] text-gray-500">{new Date(indicator.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <span className="text-[10px] bg-dark-600 text-gray-400 px-1.5 py-0.5 rounded uppercase font-bold flex-shrink-0">
          {indicator.indicator_type}
        </span>
      </div>
    </Link>
  )
}

function TwoFactorSection({ profile, onUpdated }) {
  const [step, setStep] = useState('idle')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inputClass = "w-full bg-dark-700 border border-dark-600 rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-primary text-sm"

  async function startSetup() {
    setError('')
    setLoading(true)
    try {
      const res = await authApi.setup2fa()
      setQrCode(res.data.qr_code)
      setSecret(res.data.secret)
      setStep('setup')
    } catch { setError('Failed to start 2FA setup') }
    finally { setLoading(false) }
  }

  async function confirmSetup() {
    setError('')
    setLoading(true)
    try {
      await authApi.verifySetup2fa(code)
      setStep('idle')
      setCode('')
      onUpdated()
    } catch (err) { setError(err.response?.data?.detail || 'Invalid code') }
    finally { setLoading(false) }
  }

  async function confirmDisable() {
    setError('')
    setLoading(true)
    try {
      await authApi.disable2fa(password)
      setStep('idle')
      setPassword('')
      onUpdated()
    } catch (err) { setError(err.response?.data?.detail || 'Incorrect password') }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-dark-900/50 p-4 rounded-xl border border-dark-700 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${profile.two_factor_enabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-tight">Two-Factor Auth</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold">{profile.two_factor_enabled ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
        {step === 'idle' && (
          profile.two_factor_enabled
            ? <button onClick={() => { setStep('disable'); setError('') }} className="text-[10px] px-2 py-1 rounded border border-red-800 text-red-400 hover:bg-red-900/30 transition-colors">Disable</button>
            : <button onClick={startSetup} disabled={loading} className="text-[10px] px-2 py-1 rounded border border-primary text-primary hover:bg-primary/10 transition-colors disabled:opacity-50">{loading ? '…' : 'Enable'}</button>
        )}
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {step === 'setup' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Scan with <span className="text-white font-semibold">Google Authenticator</span>, <span className="text-white font-semibold">Authy</span>, or any TOTP app.</p>
          <div className="flex justify-center bg-white p-2 rounded-lg">
            <img src={qrCode} alt="2FA QR Code" className="w-40 h-40" />
          </div>
          <p className="text-[10px] text-gray-500 text-center">Or enter manually: <span className="font-mono text-gray-300 select-all">{secret}</span></p>
          <p className="text-xs text-gray-400">Enter the 6-digit code from your app to confirm:</p>
          <input
            type="text" inputMode="numeric" maxLength={6}
            value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className={`${inputClass} text-center font-mono tracking-widest text-lg`}
            placeholder="000000"
          />
          <div className="flex gap-2">
            <button onClick={() => { setStep('idle'); setCode('') }} className="flex-1 text-xs py-1.5 rounded border border-dark-600 text-gray-400 hover:bg-dark-700">Cancel</button>
            <button onClick={confirmSetup} disabled={loading || code.length !== 6} className="flex-1 text-xs py-1.5 rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50">{loading ? 'Verifying…' : 'Confirm & Enable'}</button>
          </div>
        </div>
      )}

      {step === 'disable' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">Enter your password to disable 2FA:</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Your password" />
          <div className="flex gap-2">
            <button onClick={() => { setStep('idle'); setPassword('') }} className="flex-1 text-xs py-1.5 rounded border border-dark-600 text-gray-400 hover:bg-dark-700">Cancel</button>
            <button onClick={confirmDisable} disabled={loading || !password} className="flex-1 text-xs py-1.5 rounded bg-red-700 text-white hover:bg-red-600 disabled:opacity-50">{loading ? 'Disabling…' : 'Disable 2FA'}</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Profile() {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [myIndicators, setMyIndicators] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [indicatorsLoading, setIndicatorsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [editData, setEditData] = useState({})

  useEffect(() => { fetchProfile() }, [])

  async function fetchProfile() {
    setLoading(true)
    try {
      const res = await authApi.me()
      setProfile(res.data)
      setEditData(res.data)
      fetchMyIndicators(res.data.id)
    } catch (err) {
      setError('Failed to load profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchMyIndicators(userId) {
    setIndicatorsLoading(true)
    try {
      const res = await indicatorsApi.list({ submitted_by: userId, limit: 50 })
      setMyIndicators(res.data)
    } catch (err) {
      console.error('Failed to load shared indicators', err)
    } finally {
      setIndicatorsLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const allowed = [
        'organization', 'org_type', 'department', 'experience_level',
        'interests', 'phone_number', 'email_notif', 'sms_notif',
        'push_notif', 'update_frequency', 'full_name', 'pgp_key',
        'region_state', 'city', 'data_sharing_consent',
      ]
      const payload = {}
      allowed.forEach(key => { if (editData[key] !== undefined) payload[key] = editData[key] })
      const res = await authApi.updateMe(payload)
      setProfile(res.data)
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to update profile', err)
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400 animate-pulse">Loading profile...</div>
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>
  if (!profile) return null

  const StatBox = ({ label, value, color }) => (
    <div className="bg-dark-800 border border-dark-600 rounded-lg p-5 text-center">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{label}</p>
      <p className={`text-2xl font-mono font-bold ${color}`}>{value}</p>
    </div>
  )

  const inputClass = "w-full bg-dark-700 border border-dark-600 rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-primary text-sm"

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Profile</h1>
          <p className="text-gray-400 mt-1">Manage your professional identity and preferences</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs font-bold uppercase bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg border border-dark-600 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-xs font-bold uppercase bg-primary hover:bg-primary/90 text-white rounded-lg transition-all disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-primary/20">
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary/30 to-purple-900/30 p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 bg-primary/10 border-4 border-primary/30 rounded-full flex items-center justify-center text-5xl overflow-hidden">
                {profile.profile_pic ? <img src={profile.profile_pic} alt="Profile" className="w-full h-full object-cover" /> : '👤'}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-dark-800 uppercase">
                {profile.verification_level}
              </div>
            </div>
            <div className="text-center md:text-left flex-1 space-y-2">
              {isEditing ? (
                <input className="text-3xl font-black text-white bg-dark-700 border border-dark-600 rounded px-3 py-1 w-full max-w-md"
                  value={editData.full_name || ''} onChange={e => setEditData({ ...editData, full_name: e.target.value })} placeholder="Full Name" />
              ) : (
                <h1 className="text-4xl font-black text-white tracking-tight">{profile.full_name || profile.username}</h1>
              )}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-md uppercase">{profile.role}</span>
                <span className="px-3 py-1 bg-dark-700 text-gray-300 text-xs font-bold rounded-md uppercase border border-dark-600">{profile.org_type || 'External'}</span>
                <span className="px-3 py-1 bg-dark-700 text-gray-300 text-xs font-bold rounded-md uppercase border border-dark-600">{profile.username}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Trust Score" value={profile.trust_score} color="text-primary" />
        <StatBox label="Reputation" value={profile.reputation_points} color="text-accent" />
        <StatBox label="Indicators Shared" value={myIndicators.length} color="text-blue-400" />
        <StatBox label="Verification" value={profile.verification_level.toUpperCase()} color="text-green-400" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Institutional + Shared Indicators */}
        <div className="xl:col-span-2 space-y-6">
          <section className="bg-dark-800 border border-dark-600 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide border-b border-dark-600 pb-2">Institutional Context</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[['Organization', 'organization'], ['Department', 'department'], ['City', 'city'], ['Region / State', 'region_state']].map(([label, key]) => (
                <div key={key} className="space-y-1">
                  <p className="text-xs text-gray-500 font-bold uppercase">{label}</p>
                  {isEditing
                    ? <input className={inputClass} value={editData[key] || ''} onChange={e => setEditData({ ...editData, [key]: e.target.value })} />
                    : <p className="text-gray-200 font-medium">{profile[key] || '—'}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-dark-800 border border-dark-600 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide border-b border-dark-600 pb-2">Shared Indicators</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {indicatorsLoading ? (
                <div className="text-center py-8 text-gray-500 text-sm animate-pulse">Loading shared indicators...</div>
              ) : myIndicators.length > 0 ? (
                myIndicators.map(ind => <SlimThreatCard key={ind.id} indicator={ind} />)
              ) : (
                <div className="border border-dark-700 border-dashed rounded-lg p-8 text-center">
                  <p className="text-gray-500 text-sm italic">You haven't shared any indicators yet.</p>
                  <Link to="/submit" className="text-primary text-xs font-bold mt-2 inline-block uppercase tracking-wider hover:underline">Submit your first IOC →</Link>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right: Interests, Preferences, Security */}
        <div className="space-y-6">
          <section className="bg-dark-800 border border-dark-600 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide border-b border-dark-600 pb-2">Expertise & Interests</h3>
            <div className="flex flex-wrap gap-2">
              {isEditing ? (
                ['Phishing', 'Malware', 'DDoS', 'Ransomware', 'Social Engineering', 'APT', 'Cloud Security'].map(interest => (
                  <button key={interest}
                    onClick={() => {
                      const current = editData.interests || []
                      const updated = current.includes(interest) ? current.filter(i => i !== interest) : [...current, interest]
                      setEditData({ ...editData, interests: updated })
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${(editData.interests || []).includes(interest) ? 'bg-primary border-primary text-white' : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-gray-500'}`}
                  >{interest}</button>
                ))
              ) : (
                profile.interests?.length > 0
                  ? profile.interests.map(i => <span key={i} className="px-3 py-1 bg-dark-700 text-gray-200 text-xs font-bold rounded border border-dark-600">{i}</span>)
                  : <p className="text-gray-500 text-sm italic">No interests specified.</p>
              )}
            </div>
          </section>

          <section className="bg-dark-800 border border-dark-600 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide border-b border-dark-600 pb-2">Preferences</h3>
            <div className="space-y-4">
              {[['Email Alerts', 'email_notif', 'checkbox'], ['SMS Alerts', 'sms_notif', 'checkbox']].map(([label, key]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{label}</span>
                  {isEditing
                    ? <input type="checkbox" checked={editData[key]} onChange={e => setEditData({ ...editData, [key]: e.target.checked })} />
                    : <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${profile[key] ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>{profile[key] ? 'Enabled' : 'Disabled'}</span>}
                </div>
              ))}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Update Freq</span>
                {isEditing
                  ? <select className="bg-dark-700 text-xs border border-dark-600 rounded" value={editData.update_frequency} onChange={e => setEditData({ ...editData, update_frequency: e.target.value })}>
                      <option value="instant">Instant</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="none">None</option>
                    </select>
                  : <span className="text-primary font-bold uppercase text-[10px]">{profile.update_frequency}</span>}
              </div>
            </div>
            <div className="pt-4 border-t border-dark-700 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">PGP Public Key</p>
              {isEditing
                ? <textarea className={`${inputClass} font-mono text-[10px]`} rows={4} value={editData.pgp_key || ''} onChange={e => setEditData({ ...editData, pgp_key: e.target.value })} placeholder="PGP Public Key" />
                : <pre className="text-[9px] text-gray-500 font-mono whitespace-pre-wrap overflow-x-auto max-h-24 bg-dark-900 p-3 rounded border border-dark-700">{profile.pgp_key || 'No PGP key provided.'}</pre>}
            </div>
          </section>

          <section className="bg-dark-800 border border-dark-600 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide border-b border-dark-600 pb-2">Security</h3>
            <TwoFactorSection profile={profile} onUpdated={fetchProfile} />
          </section>
        </div>
      </div>
    </div>
  )
}
