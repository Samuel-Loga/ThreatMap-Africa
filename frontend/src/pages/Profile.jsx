import { useState, useEffect } from 'react'
import { authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await authApi.me()
        setProfile(res.data)
      } catch (err) {
        setError('Failed to load profile')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-400 animate-pulse">Loading profile...</div>
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>
  if (!profile) return null

  const StatBox = ({ label, value, color }) => (
    <div className="bg-dark-900/50 border border-dark-700 rounded-lg p-4 text-center">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{label}</p>
      <p className={`text-xl font-mono font-bold ${color}`}>{value}</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-4xl font-black text-white tracking-tight">
                {profile.full_name || profile.username}
              </h1>
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
                  <p className="text-gray-200 font-medium">{profile.organization || '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-bold uppercase">Department</p>
                  <p className="text-gray-200 font-medium">{profile.department || '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-bold uppercase">Location</p>
                  <p className="text-gray-200 font-medium">{profile.city}{profile.region_state ? `, ${profile.region_state}` : '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-bold uppercase">Member Since</p>
                  <p className="text-gray-200 font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </section>

            {/* Interests Section */}
            <section className="space-y-4">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] border-l-4 border-accent pl-4">Expertise & Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests && profile.interests.length > 0 ? (
                  profile.interests.map(i => (
                    <span key={i} className="px-4 py-2 bg-dark-700 text-gray-200 text-xs font-bold rounded-lg border border-dark-600">
                      {i}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic">No interests specified.</p>
                )}
              </div>
            </section>

            {/* PGP Key */}
            {profile.pgp_key && (
              <section className="space-y-4">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] border-l-4 border-green-500 pl-4">Secure Communication</h3>
                <div className="bg-dark-900 rounded-lg p-4 border border-dark-700">
                  <p className="text-[10px] text-gray-500 font-mono mb-2 uppercase font-bold tracking-widest">PGP Public Key</p>
                  <pre className="text-[9px] text-gray-400 font-mono whitespace-pre-wrap overflow-x-auto max-h-32">
                    {profile.pgp_key}
                  </pre>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            {/* Preferences Section */}
            <section className="space-y-6">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Email Alerts</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${profile.email_notif ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                    {profile.email_notif ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">SMS Alerts</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${profile.sms_notif ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                    {profile.sms_notif ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Update Freq</span>
                  <span className="text-primary font-bold uppercase text-[10px]">{profile.update_frequency}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Data Sharing</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${profile.data_sharing_consent ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                    {profile.data_sharing_consent ? 'Agreed' : 'Refused'}
                  </span>
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section className="space-y-6 pt-6 border-t border-dark-700">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Security</h3>
              <div className="bg-dark-900/50 p-4 rounded-xl border border-dark-700 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${profile.two_factor_enabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-tight">Two-Factor Auth</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{profile.two_factor_enabled ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
                {!profile.two_factor_enabled && (
                  <button className="w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors border border-primary/30">
                    Enable 2FA
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
