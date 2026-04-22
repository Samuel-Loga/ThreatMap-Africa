import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ThreatFeed from './pages/ThreatFeed'
import SubmitIndicator from './pages/SubmitIndicator'
import IndicatorDetail from './pages/IndicatorDetail'
import Export from './pages/Export'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/feed" element={<ThreatFeed />} />
              <Route path="/submit" element={<SubmitIndicator />} />
              <Route path="/indicators/:id" element={<IndicatorDetail />} />
              <Route path="/export" element={<Export />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
