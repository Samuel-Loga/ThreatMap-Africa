import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Globe, LayoutDashboard, Rss, PlusCircle, Share, LogOut } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/feed', label: 'Threat Feed', icon: Rss },
  { to: '/submit', label: 'Submit IOC', icon: PlusCircle },
  { to: '/export', label: 'Export', icon: Share },
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
          <Globe className="text-primary w-6 h-6" />
          <span className="text-primary text-xl font-bold">ThreatMap Africa</span>
        </Link>
        <div className="flex gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'bg-primary/20 text-primary'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-400">
            <span className="text-primary uppercase text-xs font-bold tracking-wider">{user.role}</span>
          </span>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded border border-dark-600 hover:border-gray-500 transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  )
}
