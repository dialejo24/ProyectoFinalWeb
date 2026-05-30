import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AppLayout from '../components/layout/AppLayout'
import { getIncidentById, updateIncidentStatus } from '../services/incidents.service'
import { STATUS_COLORS, STATUSES } from '../constants'

export default function IncidentDetail() {
  const { id } = useParams()
  const { userRole } = useAuth()
  const navigate = useNavigate()

  const [incident, setIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    async function fetchIncident() {
      try {
        const data = await getIncidentById(id)
        setIncident(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchIncident()
  }, [id])

  async function handleStatusChange(newStatus) {
    setUpdating(true)
    setError(null)
    setSuccess(null)
    try {
      await updateIncidentStatus(id, newStatus)
      setIncident(prev => ({ ...prev, estado: newStatus }))
      setSuccess('Estado actualizado correctamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <AppLayout><p className="text-sm text-gray-400">Cargando...</p></AppLayout>
  if (error && !incident) return <AppLayout><p className="text-sm text-red-500">{error}</p></AppLayout>

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
        >
          ← Volver
        </button>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

          <img
            src={incident.imagen_url}
            alt="Fotografía del incidente"
            className="w-full h-56 object-cover"
          />

          <div className="p-6 flex flex-col gap-4">

            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold text-gray-800">
                {incident.incident_types?.nombre ?? 'Incidente'}
              </h1>
              <span className={`text-sm font-medium px-3 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[incident.estado]}`}>
                {incident.estado}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Ubicación</p>
                <p className="text-gray-700">{incident.ubicacion_texto}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Fecha</p>
                <p className="text-gray-700">
                  {new Date(incident.fecha_creacion).toLocaleDateString('es-CO', {
                    day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Reportado por</p>
                <p className="text-gray-700">{incident.usuario_email}</p>
              </div>
              {incident.latitud && (
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Coordenadas GPS</p>
                  <p className="text-gray-700">
                    {incident.latitud.toFixed(5)}, {incident.longitud.toFixed(5)}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-1">Descripción</p>
              <p className="text-gray-700 text-sm leading-relaxed">{incident.descripcion}</p>
            </div>

            {userRole === 'administrador' && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Cambiar estado</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={updating || incident.estado === status}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 ${
                        incident.estado === status
                          ? STATUS_COLORS[status]
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                {success && <p className="text-xs text-green-600 mt-2">{success}</p>}
                {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}