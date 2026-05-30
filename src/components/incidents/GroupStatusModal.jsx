import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import { updateMultipleIncidentStatus } from '../../services/incidents.service'
import { STATUS_COLORS, STATUSES } from '../../constants'

export default function GroupStatusModal({ onClose, onSuccess }) {
  const [types, setTypes] = useState([])
  const [selectedType, setSelectedType] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [newStatus, setNewStatus] = useState('')
  const [loadingIncidents, setLoadingIncidents] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('incident_types')
      .select('id, nombre')
      .then(({ data }) => setTypes(data ?? []))
  }, [])

  useEffect(() => {
    if (!selectedType) return
    setLoadingIncidents(true)
    setSelectedIds([])
    setIncidents([])

    supabase
      .from('incidents')
      .select('id, descripcion, ubicacion_texto, estado, fecha_creacion')
      .eq('tipo_id', selectedType)
      .order('fecha_creacion', { ascending: false })
      .then(({ data }) => {
        setIncidents(data ?? [])
        setLoadingIncidents(false)
      })
  }, [selectedType])

  function toggleId(id) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  function toggleAll() {
    if (selectedIds.length === incidents.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(incidents.map(i => i.id))
    }
  }

  async function handleSubmit() {
    if (selectedIds.length === 0) return setError('Selecciona al menos un incidente.')
    if (!newStatus) return setError('Selecciona el estado al que pasarán.')

    setSubmitting(true)
    setError(null)

    try {
      await updateMultipleIncidentStatus(selectedIds, newStatus)
      onSuccess(`${selectedIds.length} incidente${selectedIds.length > 1 ? 's' : ''} actualizados a "${newStatus}".`)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Agrupar incidentes</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-4 overflow-y-auto flex-1">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de incidente
            </label>
            <select
              value={selectedType ?? ''}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Selecciona un tipo...</option>
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          {selectedType && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Incidentes ({incidents.length})
                </label>
                {incidents.length > 0 && (
                  <button
                    onClick={toggleAll}
                    className="text-xs text-green-600 hover:underline"
                  >
                    {selectedIds.length === incidents.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  </button>
                )}
              </div>

              {loadingIncidents ? (
                <p className="text-sm text-gray-400">Cargando...</p>
              ) : incidents.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No hay incidentes de este tipo.
                </p>
              ) : (
                <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                  {incidents.map(incident => (
                    <label
                      key={incident.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedIds.includes(incident.id)
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(incident.id)}
                        onChange={() => toggleId(incident.id)}
                        className="mt-0.5 accent-green-600 w-4 h-4 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 line-clamp-1">
                          {incident.descripcion}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          📍 {incident.ubicacion_texto} ·{' '}
                          {new Date(incident.fecha_creacion).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[incident.estado]}`}>
                        {incident.estado}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedIds.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cambiar estado a
              </label>
              <div className="flex gap-2">
                {STATUSES.map(status => (
                  <button
                    key={status}
                    onClick={() => setNewStatus(status)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      newStatus === status
                        ? STATUS_COLORS[status] + ' border-transparent'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || selectedIds.length === 0 || !newStatus}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            {submitting ? 'Actualizando...' : 'Cambiar estado'}
          </button>
        </div>

      </div>
    </div>
  )
}