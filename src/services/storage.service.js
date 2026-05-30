import { supabase } from '../supabase'

export async function uploadIncidentImage(file, userId) {
  if (file.size > 2 * 1024 * 1024) {
    console.warn('Imagen grande, considera comprimirla antes de subir')
  }

  const ext = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('incident-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw new Error('No se pudo subir la imagen: ' + error.message)

  const { data: { publicUrl } } = supabase.storage
    .from('incident-images')
    .getPublicUrl(data.path)

  return publicUrl
}