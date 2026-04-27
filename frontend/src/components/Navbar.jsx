import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { Globe, LogOut, Bell, Check, ExternalLink } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const navigate = useNavigate()
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
          <>
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-full transition-all"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-dark-800">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-dark-600 flex items-center justify-between bg-dark-900/50">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-[10px] text-primary hover:text-primary-hover font-bold uppercase"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`px-4 py-3 border-b border-dark-700 last:border-0 hover:bg-dark-700/50 transition-colors cursor-pointer group relative ${!n.is_read ? 'bg-primary/5' : ''}`}
                          onClick={() => {
                            if (n.link) navigate(n.link)
                            markAsRead(n.id)
                            setShowNotifs(false)
                          }}
                        >
                          {!n.is_read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />}
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`text-sm font-semibold ${!n.is_read ? 'text-white' : 'text-gray-300'}`}>{n.title}</h4>
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">{new Date(n.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{n.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              View details <ExternalLink size={10} />
                            </span>
                            {!n.is_read && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(n.id)
                                }}
                                className="p-1 text-gray-500 hover:text-primary transition-colors"
                                title="Mark as read"
                              >
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-8 py-12 text-center">
                        <Bell size={32} className="mx-auto text-dark-600 mb-3" />
                        <p className="text-sm text-gray-500">No notifications yet</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-dark-600 bg-dark-900/50 text-center">
                       <Link to="/profile" onClick={() => setShowNotifs(false)} className="text-[10px] text-gray-500 hover:text-white uppercase font-bold tracking-widest">
                         Notification Settings
                       </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link to="/profile" className="flex items-center gap-2 px-3 py-1 rounded-lg bg-dark-700/50 hover:bg-dark-700 border border-dark-600 transition-all group">
              <span className="text-sm text-gray-400 group-hover:text-gray-200">
                {user.username} (<span className="text-primary">{user.role}</span>)
              </span>
            </Link>
          </>
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
