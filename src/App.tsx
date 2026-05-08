import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { Splash } from './pages/Splash'
import { Onboarding } from './pages/Onboarding'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { AppLayout } from './components/layout/AppLayout'

import { Dashboard } from './pages/Dashboard'
import { Properties } from './pages/Properties'
import { PropertyDetail } from './pages/PropertyDetail'
import { PropertyForm } from './pages/PropertyForm'
import { Clients } from './pages/Clients'
import { ClientForm } from './pages/ClientForm'
import { Pipeline } from './pages/Pipeline'
import { Followups } from './pages/Followups'
import { FollowUpForm } from './pages/FollowUpForm'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'
import { PublicProfile } from './pages/PublicProfile'
import { PrivacyPage } from './pages/PrivacyPage'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore()
  if (loading) return null
  if (!user) return <Navigate to="/login" />
  return <>{children}</>
}

function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:username" element={<PublicProfile />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard"          element={<Dashboard />} />
          <Route path="properties"         element={<Properties />} />
          <Route path="properties/new"     element={<PropertyForm />} />
          <Route path="properties/:id"     element={<PropertyDetail />} />
          <Route path="properties/:id/edit" element={<PropertyForm />} />
          <Route path="clients"            element={<Clients />} />
          <Route path="clients/new"        element={<ClientForm />} />
          <Route path="pipeline"           element={<Pipeline />} />
          <Route path="followups"          element={<Followups />} />
          <Route path="followups/new"      element={<FollowUpForm />} />
          <Route path="analytics"          element={<Analytics />} />
          <Route path="settings"           element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
