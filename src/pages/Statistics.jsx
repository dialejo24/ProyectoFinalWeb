import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import AppLayout from '../components/layout/AppLayout'
import { supabase } from '../supabase'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { useAuthReady } from '../hooks/useAuth'
import { printStats} from '../utils/printStats'
const STATUS_COLORS = {
  'Reportado':  '#FCD34D',
  'En proceso': '#60A5FA',
  'Resuelto':   '#34D399',
}

const TYPE_COLORS = ['#6EE7B7', '#93C5FD', '#FCA5A5', '#FCD34D', '#C4B5FD']

export default function Statistics() {
  const {user, userRole, ready} = useAuthReady()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [period, setPeriod] = useState('all')

  useEffect(() => {
    async function fetchData() {
      try {
        let query = supabase
          .from('incidents')
          .select('id, estado, fecha_creacion, incident_types(nombre)')

        if (userRole !== 'administrador') {
          query = query.eq('usuario_id', user.id)
        }

        const { data, error } = await query
        if (error) throw error
        setIncidents(data ?? [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (ready && user) fetchData()
  }, [ready])

  function filterByPeriod(data) {
    if (period === 'all') return data
    const now = new Date()
    const cutoff = new Date()
    if (period === '7d') cutoff.setDate(now.getDate() - 7)
    if (period === '30d') cutoff.setDate(now.getDate() - 30)
    if (period === '90d') cutoff.setDate(now.getDate() - 90)
    return data.filter(i => new Date(i.fecha_creacion) >= cutoff)
  }

  const filtered = filterByPeriod(incidents)

  const statusData = ['Reportado', 'En proceso', 'Resuelto'].map(estado => ({
    name: estado,
    cantidad: filtered.filter(i => i.estado === estado).length,
  }))

  const typeMap = {}
  filtered.forEach(i => {
    const nombre = i.incident_types?.nombre ?? 'Sin tipo'
    typeMap[nombre] = (typeMap[nombre] ?? 0) + 1
  })
  const typeData = Object.entries(typeMap).map(([name, value]) => ({ name, value }))

  function handlePrint() {
    printStats({ filtered, statusData, typeData })
  }

  if (loading) return <AppLayout><p className="text-sm text-gray-400">Cargando estadísticas...</p></AppLayout>
  if (error) return <AppLayout><p className="text-sm text-red-500">{error}</p></AppLayout>

  return (
    <AppLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Estadísticas</h1>
            <p className="text-sm text-gray-500 mt-1">
              {userRole === 'administrador' ? 'Todos los incidentes' : 'Tus incidentes'}
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors print:hidden"
          >
            🖨️ Imprimir
          </button>
        </div>

        <div className="flex gap-2 mb-6 print:hidden">
          {[
            { value: 'all', label: 'Todo el tiempo' },
            { value: '7d',  label: 'Últimos 7 días' },
            { value: '30d', label: 'Últimos 30 días' },
            { value: '90d', label: 'Últimos 90 días' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                period === opt.value
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-800">{filtered.length}</p>
          </div>
          {statusData.map(s => (
            <div key={s.name} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">{s.name}</p>
              <p className="text-3xl font-bold text-gray-800">{s.cantidad}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Por estado</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                  {statusData.map(entry => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Por tipo</h2>
            {typeData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center mt-8">Sin datos</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={typeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {typeData.map((_, index) => (
                      <Cell key={index} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}