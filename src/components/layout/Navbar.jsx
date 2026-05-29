import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user, userRole, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const links = [
    { to: '/dashboard', label: 'Inicio' },
    { to: '/incidents', label: 'Incidentes' },
    { to: '/incidents/new', label: 'Reportar' },
    { to: '/statistics', label: 'Estadísticas' },
    ...(userRole === 'administrador' ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
          <span className="font-semibold text-gray-800 hidden sm:block">
            Udla Incidentes
          </span>
        </Link>

        {/* Links — desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Usuario y logout */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">
            {user?.email}
          </span>
          {userRole === 'administrador' && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              Admin
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-red-600 transition-colors font-medium"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Links — mobile */}
      <div className="md:hidden border-t border-gray-100 px-4 py-2 flex gap-1 overflow-x-auto">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              location.pathname === link.to
                ? 'bg-green-50 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}