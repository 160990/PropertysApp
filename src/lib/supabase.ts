import { createClient } from '@supabase/supabase-js'

// Sanitización robusta para evitar duplicados por errores de entorno
const sanitize = (val: string | undefined) => {
  if (!val) return ''
  const trimmed = val.trim()
  
  // Si es un JWT (contiene puntos), nos aseguramos de no enviarlo duplicado
  // Un JWT válido tiene exactamente 2 puntos (header.payload.signature)
  if (trimmed.includes('.')) {
    const parts = trimmed.split('.')
    // Si hay más de 3 partes, es que se ha concatenado el token
    if (parts.length > 3) {
      // Tomamos solo las primeras 3 partes (un solo token)
      return parts.slice(0, 3).join('.')
    }
  }
  
  // Para la URL o si hay otros delimitadores
  return trimmed.split(',')[0].split(' ')[0].trim()
}

const supabaseUrl = sanitize(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = sanitize(import.meta.env.VITE_SUPABASE_ANON_KEY)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan variables de entorno para Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
