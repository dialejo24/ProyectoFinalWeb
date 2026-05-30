import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { getIncidents, updateIncidentStatus } from '../services/incidents.service'
import { useAuth } from '../hooks/useAuth'

const STATUS_COLORS = {
  'Reportado':  'bg-yellow-100 text-yellow-700',
  'En proceso': 'bg-blue-100 text-blue-700',
  'Resuelto':   'bg-green-100 text-green-700',
}

const STATUSES = ['Reportado', 'En proceso', 'Resuelto']
const FILTERS  = ['Todos', 'Reportado', 'En proceso', 'Resuelto']

export default function AdminPanel() {
  const { user } = useAuth()
  const [incidents, setIncidents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [activeFilter, setActiveFilter] = useState('Todos')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null) // ID del incidente actualizándose
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAll() {
      try {
        const data = await getIncidents(user.id, 'administrador')
        setIncidents(data)
        setFiltered(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchAll()
  }, [user])

  function handleFilter(filter) {
    setActiveFilter(filter)
    setFiltered(filter === 'Todos'
      ? incidents
      : incidents.filter(i => i.estado === filter)
    )
  }

  async function handleStatusChange(incidentId, newStatus) {
    setUpdating(incidentId)
    try {
      await updateIncidentStatus(incidentId, newStatus)
      setIncidents(prev =>
        prev.map(i => i.id === incidentId ? { ...i, estado: newStatus } : i)
      )
      setFiltered(prev =>
        prev.map(i => i.id === incidentId ? { ...i, estado: newStatus } : i)
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel de administración</h1>
          <p className="text-sm text-gray-500 mt-1">
            {incidents.length} incidente{incidents.length !== 1 ? 's' : ''} en total
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => handleFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === filter
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {filter}
            {filter !== 'Todos' && (
              <span className="ml-1.5 opacity-70">
                ({incidents.filter(i => i.estado === filter).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Cargando incidentes...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-12 text-center">
          <p className="text-gray-400 text-sm">No hay incidentes con este filtro.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(incident => (
            <div
              key={incident.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4"
            >
              <img
                src={incident.imagen_url}
                alt="Incidente"
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-100"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <Link
                    to={`/incidents/${incident.id}`}
                    className="font-medium text-gray-800 text-sm hover:text-green-600"
                  >
                    {incident.incident_types?.nombre ?? 'Sin tipo'}
                  </Link>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[incident.estado]}`}>
                    {incident.estado}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1 mb-1">
                  {incident.descripcion}
                </p>
                <p className="text-xs text-gray-400">
                  📍 {incident.ubicacion_texto} ·{' '}
                  {new Date(incident.fecha_creacion).toLocaleDateString('es-CO')}
                </p>

                <div className="flex gap-2 mt-3 flex-wrap">
                  {STATUSES.map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(incident.id, status)}
                      disabled={updating === incident.id || incident.estado === status}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${
                        incident.estado === status
                          ? STATUS_COLORS[status]
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {updating === incident.id && incident.estado !== status
                        ? '...'
                        : status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}