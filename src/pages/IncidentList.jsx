import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AppLayout from '../components/layout/AppLayout'
import { getIncidents } from '../services/incidents.service'
import { useAuthReady } from '../hooks/useAuth'
import { STATUS_COLORS, FILTERS } from '../constants'

export default function IncidentList() {
  const [incidents, setIncidents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [activeFilter, setActiveFilter] = useState('Todos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, userRole, ready } = useAuthReady()
  useEffect(() => {
    async function fetchIncidents() {
      try {
        const data = await getIncidents(user.id, userRole)
        setIncidents(data)
        setFiltered(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (ready && user) fetchIncidents()
  }, [ready])

  function handleFilter(filter) {
    setActiveFilter(filter)
    if (filter === 'Todos') {
      setFiltered(incidents)
    } else {
      setFiltered(incidents.filter(i => i.estado === filter))
    }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Incidentes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {incidents.length} incidente{incidents.length !== 1 ? 's' : ''} registrado{incidents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/incidents/new"
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Reportar
        </Link>
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

      {loading ? (
        <div className="text-sm text-gray-400">Cargando incidentes...</div>
      ) : error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-12 text-center">
          <p className="text-gray-400 text-sm">
            {activeFilter === 'Todos'
              ? 'No hay incidentes registrados.'
              : `No hay incidentes con estado "${activeFilter}".`}
          </p>
          {activeFilter === 'Todos' && (
            <Link
              to="/incidents/new"
              className="mt-3 inline-block text-sm text-green-600 hover:underline"
            >
              Reporta el primero
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(incident => (
            <Link
              key={incident.id}
              to={`/incidents/${incident.id}`}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-green-300 hover:shadow-sm transition-all flex gap-4"
            >
              <img
                src={incident.imagen_url}
                alt="Incidente"
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-100"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-gray-800 text-sm">
                    {incident.incident_types?.nombre ?? 'Sin tipo'}
                  </p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[incident.estado]}`}>
                    {incident.estado}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {incident.descripcion}
                </p>
                <p className="text-xs text-gray-400 mt-1.5">
                  📍 {incident.ubicacion_texto} ·{' '}
                  {new Date(incident.fecha_creacion).toLocaleDateString('es-CO', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  )
}