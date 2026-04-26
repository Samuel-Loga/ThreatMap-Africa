import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: '📊 Dashboard' },
  { to: '/feed', label: '📡 Threat Feed' },
  { to: '/submit', label: '➕ Submit IOC' },
  { to: '/export', label: '📤 Export' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-dark-800 border-b border-dark-600 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-primary text-xl font-bold">🌍 ThreatMap Africa</span>
        </Link>
        <div className="flex gap-1">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'bg-primary/20 text-primary'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <Link to="/profile" className="flex items-center gap-2 px-3 py-1 rounded-lg bg-dark-700/50 hover:bg-dark-700 border border-dark-600 transition-all group">
            <span className="text-sm text-gray-400 group-hover:text-gray-200">
              {user.username} (<span className="text-primary">{user.role}</span>)
            </span>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded border border-dark-600 hover:border-gray-500 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
