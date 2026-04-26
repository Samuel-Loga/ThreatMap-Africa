import { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '../api/client'

const AuthContext = createContext(null)

function parseToken(token) {
  const payload = JSON.parse(atob(token.split('.')[1]))
  return {
    id: payload.sub,
    role: payload.role,
    username: payload.username,
    onboarding_completed: payload.onboarding_completed ?? false,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password)
    // 2FA required — return the flag without storing a token
    if (res.data.requires_2fa) {
      return { requires_2fa: true, pre_auth_token: res.data.pre_auth_token }
    }
    const token = res.data.access_token
    const userData = { ...parseToken(token), email }
    localStorage.setItem('access_token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const finalizeLogin = useCallback(async (preAuthToken, code) => {
    const res = await authApi.verify2fa(preAuthToken, code)
    const token = res.data.access_token
    localStorage.setItem('access_token', token)
    
    // Fetch full user data to get email and other fields not in token
    const userRes = await authApi.me()
    const userData = {
      ...parseToken(token),
      email: userRes.data.email,
      ...userRes.data
    }
    
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, login, finalizeLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
