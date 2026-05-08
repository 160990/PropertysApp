import { createClient } from '@supabase/supabase-js'

// Sanitización profunda para evitar duplicados por errores de Vite/Entorno
const sanitize = (val: string | undefined) => {
  if (!val) return ''
  const trimmed = val.trim()
  // Si por error de entorno el token se duplicó (ej: token+token), tomamos solo la primera parte
  // Un JWT de Supabase suele tener ~200-500 caracteres y dos puntos (partes)
  if (trimmed.includes('eyJ') && trimmed.lastIndexOf('eyJ') > 0) {
    return trimmed.substring(0, trimmed.indexOf('eyJ', 1)).trim()
  }
  return trimmed.split(',')[0].split(' ')[0].trim()
}

const supabaseUrl = sanitize(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = sanitize(import.meta.env.VITE_SUPABASE_ANON_KEY)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan variables de entorno para Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
