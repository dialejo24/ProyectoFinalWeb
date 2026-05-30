import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute } from './components/layout/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/AdminPanel'
import NewIncident from './pages/NewIncident'
import IncidentList from './pages/IncidentList'
import IncidentDetail from './pages/IncidentDetail'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route path="/admin" element={
            <PrivateRoute requiredRole="administrador">
              <AdminPanel />
            </PrivateRoute>
          } />

          <Route path="/incidents/new" element={
            <PrivateRoute>
              <NewIncident />
            </PrivateRoute>
          } />

          <Route path="/incidents" element={
            <PrivateRoute>
              <IncidentList />
            </PrivateRoute>
          } />

          <Route path="/incidents/:id" element={
            <PrivateRoute>
              <IncidentDetail />
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}