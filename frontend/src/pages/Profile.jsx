import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { authApi, indicatorsApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

const SEVERITY_COLORS = {
  Info: 'bg-blue-900/40 text-blue-300',
  Low: 'bg-green-900/40 text-green-300',
  Medium: 'bg-yellow-900/40 text-yellow-300',
  High: 'bg-orange-900/40 text-orange-300',
  Critical: 'bg-red-900/40 text-red-300',
}

function TwoFactorSection({ profile, onUpdated }) {
  const [step, setStep] = useState('idle') // idle | setup | confirm | disable
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
          <p className="text-xs text-gray-400">Scan this QR code with <span className="text-white font-semibold">Google Authenticator</span>, <span className="text-white font-semibold">Authy</span>, or any TOTP app.</p>
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
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [editData, setEditData] = useState({})

  const [submissions, setSubmissions] = useState([])
  const [subLoading, setSubLoading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    setLoading(true)
    try {
      const res = await authApi.me()
      setProfile(res.data)
      setEditData(res.data)
      fetchSubmissions(res.data.id)
    } catch (err) {
      setError('Failed to load profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchSubmissions(userId) {
    setSubLoading(true)
    try {
      const res = await indicatorsApi.list({ submitted_by: userId, limit: 50 })
      setSubmissions(res.data)
    } catch (err) {
      console.error('Failed to load submissions', err)
    } finally {
      setSubLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      // Allowed fields for update
      const allowed = [
        'organization', 'org_type', 'department', 'experience_level', 
        'interests', 'phone_number', 'email_notif', 'sms_notif', 
        'push_notif', 'update_frequency', 'full_name', 'pgp_key', 
        'region_state', 'city', 'data_sharing_consent'
      ]
      const payload = {}
      allowed.forEach(key => {
        if (editData[key] !== undefined) payload[key] = editData[key]
      })

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
    <div className="bg-dark-900/50 border border-dark-700 rounded-lg p-4 text-center">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{label}</p>
      <p className={`text-xl font-mono font-bold ${color}`}>{value}</p>
    </div>
  )

  const inputClass = "w-full bg-dark-700 border border-dark-600 rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-primary text-sm"

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden shadow-2xl">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/30 to-purple-900/30 p-8 border-b border-dark-600">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 bg-primary/10 border-4 border-primary/30 rounded-full flex items-center justify-center text-5xl shadow-2xl overflow-hidden">
                {profile.profile_pic ? (
                  <img src={profile.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-dark-800 uppercase">
                {profile.verification_level}
              </div>
            </div>
            <div className="text-center md:text-left flex-1 space-y-2">
              {isEditing ? (
                <input 
                  className="text-3xl font-black text-white bg-dark-700 border border-dark-600 rounded px-3 py-1 w-full max-w-md"
                  value={editData.full_name || ''}
                  onChange={e => setEditData({...editData, full_name: e.target.value})}
                  placeholder="Full Name"
                />
              ) : (
                <h1 className="text-4xl font-black text-white tracking-tight">
                  {profile.full_name || profile.username}
                </h1>
              )}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-md uppercase tracking-wide">
                  {profile.role}
                </span>
                <span className="px-3 py-1 bg-dark-700 text-gray-300 text-xs font-bold rounded-md uppercase tracking-wide border border-dark-600">
                  {profile.org_type || 'External'}
                </span>
                {profile.experience_level && (
                  <span className="px-3 py-1 bg-purple-900/40 text-purple-300 text-xs font-bold rounded-md uppercase tracking-wide border border-purple-800/50">
                    {profile.experience_level}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-xs font-bold uppercase bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg border border-dark-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 text-xs font-bold uppercase bg-primary hover:bg-primary/90 text-white rounded-lg transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-dark-700 hover:bg-dark-600 text-gray-200 text-xs font-black uppercase tracking-widest rounded-lg transition-colors border border-dark-600"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-dark-600 border-b border-dark-600">
          <StatBox label="Trust Score" value={profile.trust_score} color="text-primary" />
          <StatBox label="Reputation" value={profile.reputation_points} color="text-accent" />
          <StatBox label="Reports" value={profile.reputation_points / 10} color="text-blue-400" />
          <StatBox label="Accuracy" value="98.2%" color="text-green-400" />
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-10">
            {/* Organization Section */}
            <section className="space-y-4">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] border-l-4 border-primary pl-4">Institutional Context</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-dark-900/30 p-6 rounded-xl border border-dark-700/50">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-bold uppercase">Organization</p>
                  {isEditing ? (
                    <input 
                      className={inputClass}
                      value={editData.organization || ''}
                      onChange={e => setEditData({...editData, organization: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-200 font-medium">{profile.organization || '—'}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-bold uppercase">Department</p>
                  {isEditing ? (
                    <input 
                      className={inputClass}
                      value={editData.department || ''}
                      onChange={e => setEditData({...editData, department: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-200 font-medium">{profile.department || '—'}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-bold uppercase">City</p>
                  {isEditing ? (
                    <input 
                      className={inputClass}
                      value={editData.city || ''}
                      onChange={e => setEditData({...editData, city: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-200 font-medium">{profile.city || '—'}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-bold uppercase">Region / State</p>
                  {isEditing ? (
                    <input 
                      className={inputClass}
                      value={editData.region_state || ''}
                      onChange={e => setEditData({...editData, region_state: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-200 font-medium">{profile.region_state || '—'}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Interests Section */}
            <section className="space-y-4">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] border-l-4 border-accent pl-4">Expertise & Interests</h3>
              <div className="flex flex-wrap gap-2">
                {isEditing ? (
                  ['Phishing', 'Malware', 'DDoS', 'Ransomware', 'Social Engineering', 'APT', 'Cloud Security'].map(interest => (
                    <button
                      key={interest}
                      onClick={() => {
                        const current = editData.interests || []
                        const updated = current.includes(interest)
                          ? current.filter(i => i !== interest)
                          : [...current, interest]
                        setEditData({...editData, interests: updated})
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        (editData.interests || []).includes(interest)
                          ? 'bg-primary border-primary text-white'
                          : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {interest}
                    </button>
                  ))
                ) : (
                  profile.interests && profile.interests.length > 0 ? (
                    profile.interests.map(i => (
                      <span key={i} className="px-4 py-2 bg-dark-700 text-gray-200 text-xs font-bold rounded-lg border border-dark-600">
                        {i}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No interests specified.</p>
                  )
                )}
              </div>
            </section>

            {/* PGP Key */}
            <section className="space-y-4">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] border-l-4 border-green-500 pl-4">Secure Communication</h3>
              <div className="bg-dark-900 rounded-lg p-4 border border-dark-700">
                <p className="text-[10px] text-gray-500 font-mono mb-2 uppercase font-bold tracking-widest">PGP Public Key</p>
                {isEditing ? (
                  <textarea 
                    className={`${inputClass} font-mono text-[10px]`}
                    rows={5}
                    value={editData.pgp_key || ''}
                    onChange={e => setEditData({...editData, pgp_key: e.target.value})}
                  />
                ) : (
                  <pre className="text-[9px] text-gray-400 font-mono whitespace-pre-wrap overflow-x-auto max-h-32">
                    {profile.pgp_key || 'No PGP key provided.'}
                  </pre>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            {/* Preferences Section */}
            <section className="space-y-6">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Email Alerts</span>
                  {isEditing ? (
                    <input 
                      type="checkbox"
                      checked={editData.email_notif}
                      onChange={e => setEditData({...editData, email_notif: e.target.checked})}
                    />
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${profile.email_notif ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                      {profile.email_notif ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">SMS Alerts</span>
                  {isEditing ? (
                    <input 
                      type="checkbox"
                      checked={editData.sms_notif}
                      onChange={e => setEditData({...editData, sms_notif: e.target.checked})}
                    />
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${profile.sms_notif ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                      {profile.sms_notif ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Update Freq</span>
                  {isEditing ? (
                    <select 
                      className="bg-dark-700 text-xs border border-dark-600 rounded"
                      value={editData.update_frequency}
                      onChange={e => setEditData({...editData, update_frequency: e.target.value})}
                    >
                      <option value="instant">Instant</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="none">None</option>
                    </select>
                  ) : (
                    <span className="text-primary font-bold uppercase text-[10px]">{profile.update_frequency}</span>
                  )}
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section className="space-y-6 pt-6 border-t border-dark-700">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Security</h3>
              <TwoFactorSection profile={profile} onUpdated={fetchProfile} />
            </section>
          </div>
        </div>
      </div>

      {/* My Submissions */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] border-l-4 border-primary pl-4 mb-4">My Submitted Indicators</h3>
        {subLoading && <p className="text-gray-400 text-sm animate-pulse">Loading submissions…</p>}
        {!subLoading && submissions.length === 0 && (
          <p className="text-gray-500 text-sm italic">No indicators submitted yet.</p>
        )}
        {!subLoading && submissions.length > 0 && (
          <div className="space-y-2">
            {submissions.map((ind) => (
              <Link
                key={ind.id}
                to={`/indicators/${ind.id}`}
                className="flex items-center justify-between gap-3 bg-dark-900/50 border border-dark-700 rounded-lg px-4 py-3 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-mono bg-dark-700 text-gray-400 px-2 py-0.5 rounded uppercase flex-shrink-0">{ind.indicator_type}</span>
                  <span className="text-sm font-mono text-gray-200 truncate">{ind.value}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${SEVERITY_COLORS[ind.severity] || 'text-gray-400'}`}>{ind.severity}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${ind.status === 'enriched' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>{ind.status}</span>
                  <span className="text-[10px] text-gray-500">{new Date(ind.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
