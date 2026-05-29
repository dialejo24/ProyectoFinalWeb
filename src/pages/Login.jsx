import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Correo o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">

        <h1 className="text-2xl font-bold text-gray-800 mb-1">Iniciar sesión</h1>
        <p className="text-sm text-gray-500 mb-6">Sistema de Reporte de Incidentes · Udla</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo institucional
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@udla.edu.co"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2 text-sm transition-colors"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>

        <p className="text-sm text-center text-gray-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-green-600 font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}