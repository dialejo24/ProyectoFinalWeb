import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../supabase'
import { createIncident } from '../services/incidents.service'
import { uploadIncidentImage } from '../services/storage.service'

export default function NewIncident() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [types, setTypes] = useState([])
  const [form, setForm] = useState({
    tipoId: '',
    descripcion: '',
    ubicacionTexto: '',
    latitud: null,
    longitud: null,
  })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [locating, setLocating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Cargar tipos de incidente
  useEffect(() => {
    supabase
      .from('incident_types')
      .select('id, nombre')
      .then(({ data }) => setTypes(data ?? []))
  }, [])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  function handleGPS() {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(prev => ({
          ...prev,
          latitud: pos.coords.latitude,
          longitud: pos.coords.longitude,
        }))
        setLocating(false)
      },
      () => {
        setError('No se pudo obtener la ubicación. Ingrésala manualmente.')
        setLocating(false)
      }
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!form.tipoId) return setError('Selecciona un tipo de incidente.')
    if (form.descripcion.length < 20) return setError('La descripción debe tener al menos 20 caracteres.')
    if (!form.ubicacionTexto) return setError('Ingresa la ubicación del incidente.')
    if (!image) return setError('La fotografía es obligatoria.')

    setLoading(true)

    try {
      // 1. Subir imagen
      const imagenURL = await uploadIncidentImage(image, user.id)

      // 2. Crear incidente
      await createIncident({
        usuario_id: user.id,
        usuario_email: user.email,
        tipo_id: form.tipoId,
        descripcion: form.descripcion,
        imagen_url: imagenURL,
        ubicacion_texto: form.ubicacionTexto,
        latitud: form.latitud,
        longitud: form.longitud,
        estado: 'Reportado',
      })

      navigate('/incidents')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Reportar incidente</h1>
        <p className="text-sm text-gray-500 mb-6">
          Completa todos los campos para registrar el incidente.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de incidente <span className="text-red-500">*</span>
            </label>
            <select
              name="tipoId"
              value={form.tipoId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Selecciona un tipo...</option>
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={4}
              placeholder="Describe detalladamente el incidente (mínimo 20 caracteres)..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{form.descripcion.length} caracteres</p>
          </div>

          {/* Fotografía */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fotografía <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImage}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-medium hover:file:bg-green-100"
            />
            {preview && (
              <img
                src={preview}
                alt="Vista previa"
                className="mt-3 rounded-lg w-full max-h-48 object-cover border border-gray-200"
              />
            )}
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="ubicacionTexto"
              value={form.ubicacionTexto}
              onChange={handleChange}
              placeholder="Ej: Bloque B, baño segundo piso"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={handleGPS}
              disabled={locating}
              className="mt-2 text-sm text-green-600 hover:underline disabled:opacity-50"
            >
              {locating ? 'Obteniendo ubicación...' : '📍 Usar mi ubicación GPS'}
            </button>
            {form.latitud && (
              <p className="text-xs text-gray-400 mt-1">
                GPS: {form.latitud.toFixed(5)}, {form.longitud.toFixed(5)}
              </p>
            )}
          </div>

          {/* Botón */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
          >
            {loading ? 'Enviando reporte...' : 'Enviar reporte'}
          </button>

        </div>
      </div>
    </AppLayout>
  )
}