import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Rss, 
  PlusCircle, 
  Share, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/feed', label: 'Threat Feed', icon: Rss },
  { to: '/submit', label: 'Submit IOC', icon: PlusCircle },
  { to: '/export', label: 'Export', icon: Share },
  { to: '/forum', label: 'Community', icon: MessageSquare },
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
      className={`bg-dark-800 border-r border-dark-600 transition-all duration-300 flex flex-col sticky top-[61px] h-[calc(100vh-61px)] z-40 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex-1 py-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="flex flex-col gap-2 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center rounded-lg transition-all duration-200 group h-12 ${
                isExpanded ? 'px-4 gap-4' : 'justify-center'
              } ${
                location.pathname === to
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
              title={!isExpanded ? label : ''}
            >
              <div className="flex-shrink-0 flex items-center justify-center">
                <Icon size={20} />
              </div>
              {isExpanded && (
                <span className="font-medium whitespace-nowrap overflow-hidden">
                  {label}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-dark-600">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </aside>
  )
}
