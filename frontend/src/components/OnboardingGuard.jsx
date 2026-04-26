import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function OnboardingGuard() {
  const { user } = useAuth()

  if (user && !user.onboarding_completed) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
