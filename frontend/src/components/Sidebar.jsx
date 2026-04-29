import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Rss,
  PlusCircle,
  Share,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Trophy,
  Lock,
  User,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/feed', label: 'Threat Feed', icon: Rss },
  { to: '/submit', label: 'Submit IOC', icon: PlusCircle },
  { to: '/forum', label: 'Forum', icon: MessageSquare },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/workspaces', label: 'Workspaces', icon: Lock },
  { to: '/export', label: 'Export', icon: Share },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebar-expanded')
    return saved !== null ? JSON.parse(saved) : false
  })
  const location = useLocation()

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', JSON.stringify(isExpanded))
  }, [isExpanded])

  return (
    <aside
      className={`bg-dark-800 border-r border-dark-600 transition-all duration-300 flex flex-col sticky top-[57px] h-[calc(100vh-57px)] z-40 flex-shrink-0 ${
        isExpanded ? 'w-48' : 'w-16'
      }`}
    >
      <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-1 px-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              title={!isExpanded ? label : ''}
              className={`flex items-center rounded-lg transition-all duration-200 h-11 ${
                isExpanded ? 'px-3 gap-3' : 'justify-center'
              } ${
                location.pathname === to
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              {isExpanded && (
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                  {label}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="p-2 border-t border-dark-600">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
    </aside>
  )
}
