import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { notificationsApi } from '../api/client'
import { useAuth } from './AuthContext'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await notificationsApi.list({ limit: 50 })
      setNotifications(res.data)
      setUnreadCount(res.data.filter(n => !n.is_read).length)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (!user) return

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws/enrichment`)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        // Enrichment complete or new notification are candidates for a real-time notification
        if (data.event === 'enrichment_complete' || data.event === 'new_notification') {
          // If it's a notification for a specific user, we could check if it matches current user
          // but fetchNotifications already checks for user context.
          if (data.user_id && user && data.user_id !== String(user.id)) {
            return // Not for us
          }
          fetchNotifications()
        }
      } catch (err) {
        console.error('WebSocket message error:', err)
      }
    }

    return () => ws.close()
  }, [user, fetchNotifications])

  const markAsRead = async (id) => {
    try {
      await notificationsApi.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead, 
      loading,
      refresh: fetchNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
