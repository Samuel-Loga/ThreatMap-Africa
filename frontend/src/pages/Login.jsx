import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Globe, LogIn } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <Globe className="text-primary w-12 h-12 mb-3" />
          <h1 className="text-3xl font-bold text-primary">ThreatMap Africa</h1>
          <p className="text-gray-400 mt-2">African Cyber Threat Intelligence Platform</p>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <LogIn size={20} className="text-primary" />
            Sign In
          </h2>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-gray-200 focus:outline-none focus:border-primary"
                placeholder="analyst@org.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-dark-700 border border-dark-600 rounded px-3 py-2 text-gray-200 focus:outline-none focus:border-primary"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold rounded py-2.5 transition-colors shadow-lg shadow-primary/20"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            No account?{' '}
            <Link to="/register" className="text-primary hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
