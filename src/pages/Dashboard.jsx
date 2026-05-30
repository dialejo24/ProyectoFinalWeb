import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../supabase'
import { useAuthReady } from '../hooks/useAuth'

const STATUS_COLORS = {
  'Reportado':  'bg-yellow-100 text-yellow-700',
  'En proceso': 'bg-blue-100 text-blue-700',
  'Resuelto':   'bg-green-100 text-green-700',
}

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, reportado: 0, enProceso: 0, resuelto: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, userRole, ready } = useAuthReady()

  useEffect(() => {
    async function fetchData() {
      try {
        let query = supabase
          .from('incidents')
          .select('id, tipo_id, estado, fecha_creacion, ubicacion_texto, incident_types(nombre)')
          .order('fecha_creacion', { ascending: false })

        if (userRole !== 'administrador') {
          query = query.eq('usuario_id', user.id)
        }

        const { data, error } = await query
        if (error) throw error

        setStats({
          total:     data.length,
          reportado: data.filter(i => i.estado === 'Reportado').length,
          enProceso: data.filter(i => i.estado === 'En proceso').length,
          resuelto:  data.filter(i => i.estado === 'Resuelto').length,
        })

        setRecent(data.slice(0, 5))
      } catch (err) {
        console.error('Error cargando dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    if (ready && user) fetchData()
  }, [ready])

  const cards = [
    { label: 'Total',      value: stats.total,     color: 'border-gray-300  bg-white' },
    { label: 'Reportado',  value: stats.reportado,  color: 'border-yellow-300 bg-yellow-50' },
    { label: 'En proceso', value: stats.enProceso,  color: 'border-blue-300  bg-blue-50' },
    { label: 'Resuelto',   value: stats.resuelto,   color: 'border-green-300 bg-green-50' },
  ]

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Bienvenido{userRole === 'administrador' ? ', Administrador' : ''}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>
        <Link
          to="/incidents/new"
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Reportar incidente
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400">Cargando resumen...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {cards.map(card => (
              <div key={card.label} className={`border rounded-xl p-4 ${card.color}`}>
                <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-700">Últimos incidentes</h2>
              <Link to="/incidents" className="text-sm text-green-600 hover:underline">
                Ver todos
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                No has reportado incidentes aún.{' '}
                <Link to="/incidents/new" className="text-green-600 hover:underline">
                  Reporta el primero
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recent.map(incident => (
                  <li key={incident.id}>
                    <Link
                      to={`/incidents/${incident.id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {incident.incident_types?.nombre ?? 'Sin tipo'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {incident.ubicacion_texto} ·{' '}
                          {new Date(incident.fecha_creacion).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[incident.estado]}`}>
                        {incident.estado}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </AppLayout>
  )
}