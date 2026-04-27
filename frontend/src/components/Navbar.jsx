import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Globe, LogOut } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-dark-800 border-b border-dark-600 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Globe className="text-primary w-6 h-6" />
          <span className="text-primary text-xl font-bold">ThreatMap Africa</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <Link to="/profile" className="flex items-center gap-2 px-3 py-1 rounded-lg bg-dark-700/50 hover:bg-dark-700 border border-dark-600 transition-all group">
            <span className="text-sm text-gray-400 group-hover:text-gray-200">
              {user.username} (<span className="text-primary">{user.role}</span>)
            </span>
          </Link>
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
