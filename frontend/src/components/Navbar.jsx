import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: '📊 Dashboard' },
  { to: '/feed', label: '📡 Threat Feed' },
  { to: '/submit', label: '➕ Submit IOC' },
  { to: '/forum', label: '💬 Forum' },
  { to: '/leaderboard', label: '🏆 Leaderboard' },
  { to: '/workspaces', label: '🔒 Workspaces' },
  { to: '/export', label: '📤 Export' },
  { to: '/countries', label: '🗺️ Countries' },
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
    <nav className="bg-dark-800 border-b border-dark-600 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4 min-w-0">
        <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-primary text-lg font-bold whitespace-nowrap">🌍 ThreatMap Africa</span>
        </Link>
        <div className="flex gap-0.5 overflow-x-auto scrollbar-hide">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
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
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {user && (
          <Link to="/profile" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-700/50 hover:bg-dark-700 border border-dark-600 transition-all group">
            <span className="text-xs text-gray-400 group-hover:text-gray-200 whitespace-nowrap">
              {user.username} <span className="text-primary">({user.role})</span>
            </span>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-white px-2.5 py-1.5 rounded border border-dark-600 hover:border-gray-500 transition-colors whitespace-nowrap"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
