import { supabase } from '../supabase'

export async function createIncident(incident) {
  const { data, error } = await supabase
    .from('incidents')
    .insert(incident)
    .select()
    .single()

  if (error) throw new Error('No se pudo crear el incidente: ' + error.message)
  return data
}

export async function getIncidents(userId, userRole) {
  let query = supabase
    .from('incidents')
    .select(`
      id, estado, descripcion, ubicacion_texto,
      fecha_creacion, imagen_url,
      incident_types(nombre)
    `)
    .order('fecha_creacion', { ascending: false })

  if (userRole !== 'administrador') {
    query = query.eq('usuario_id', userId)
  }

  const { data, error } = await query
  if (error) throw new Error('No se pudieron cargar los incidentes: ' + error.message)
  return data
}

export async function getIncidentById(id) {
  const { data, error } = await supabase
    .from('incidents')
    .select(`
      *, incident_types(nombre)
    `)
    .eq('id', id)
    .single()

  if (error) throw new Error('No se encontró el incidente: ' + error.message)
  return data
}

export async function updateIncidentStatus(id, estado) {
  const { error } = await supabase
    .from('incidents')
    .update({ estado })
    .eq('id', id)

  if (error) throw new Error('No se pudo actualizar el estado: ' + error.message)
}