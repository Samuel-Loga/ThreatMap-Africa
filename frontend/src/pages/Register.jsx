import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import { Globe, UserPlus } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', username: '', password: '', organization: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.register(form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
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
          <p className="text-gray-400 mt-2">Create your analyst account</p>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <UserPlus size={20} className="text-primary" />
            Register
          </h2>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'email', label: 'Email', type: 'email', placeholder: 'analyst@org.com' },
              { key: 'username', label: 'Username', type: 'text', placeholder: 'analyst123' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
              { key: 'organization', label: 'Organization', type: 'text', placeholder: 'CERT Kenya' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm text-gray-400 mb-1">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={set(key)}
                  required={key !== 'organization'}
                  className={inputClass}
                  placeholder={placeholder}
                  minLength={key === 'password' ? 8 : undefined}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold rounded py-2.5 transition-colors shadow-lg shadow-primary/20"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already registered?{' '}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
