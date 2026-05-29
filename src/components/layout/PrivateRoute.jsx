import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function PrivateRoute({ children, requiredRole }) {
  const { user, userRole, loading } = useAuth()

  if (loading) return <div>Cargando...</div>

  if (!user) return <Navigate to="/login" replace />

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}