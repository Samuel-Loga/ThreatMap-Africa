import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/client'
import { Globe } from 'lucide-react'

export default function Login() {
  const { login, finalizeLogin } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 2FA step
  const [requires2fa, setRequires2fa] = useState(false)
  const [preAuthToken, setPreAuthToken] = useState('')
  const [totpCode, setTotpCode] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result?.requires_2fa) {
        setPreAuthToken(result.pre_auth_token)
        setRequires2fa(true)
      } else {
        if (result && !result.onboarding_completed) {
          navigate('/onboarding')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handle2faSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await finalizeLogin(preAuthToken, totpCode)
      if (result && !result.onboarding_completed) {
        navigate('/onboarding')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid 2FA code')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-gray-200 focus:outline-none focus:border-primary"

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <Globe className="text-primary w-12 h-12 mb-3" />
          <h1 className="text-3xl font-bold text-primary">ThreatMap Africa</h1>
          <p className="text-gray-400 mt-2">African Cyber Threat Intelligence Platform</p>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-xl p-8">
          {!requires2fa ? (
            <>
              <h2 className="text-xl font-semibold mb-6">Sign In</h2>
              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 mb-4 text-sm">{error}</div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="analyst@org.com" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} placeholder="••••••••" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold rounded py-2 transition-colors">
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-400">
                No account?{' '}<Link to="/register" className="text-primary hover:underline">Register</Link>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🔐</div>
                <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
                <p className="text-gray-400 text-sm mt-2">Enter the 6-digit code from your authenticator app</p>
              </div>
              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 mb-4 text-sm">{error}</div>
              )}
              <form onSubmit={handle2faSubmit} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  required
                  className={`${inputClass} text-center text-2xl font-mono tracking-[0.5em]`}
                  placeholder="000000"
                  autoFocus
                />
                <button type="submit" disabled={loading || totpCode.length !== 6} className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold rounded py-2 transition-colors">
                  {loading ? 'Verifying…' : 'Verify'}
                </button>
                <button type="button" onClick={() => { setRequires2fa(false); setError('') }} className="w-full text-sm text-gray-400 hover:text-white py-1">
                  ← Back to login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
