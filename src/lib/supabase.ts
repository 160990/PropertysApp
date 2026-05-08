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

// LIMPIEZA DE SESIÓN CORRUPTA: Si el navegador guardó un token triplicado en localStorage, lo borramos
try {
  const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
  const stored = localStorage.getItem(storageKey)
  if (stored && (stored.match(/\.eyJ/g) || []).length > 2) {
    localStorage.removeItem(storageKey)
  }
} catch (e) { /* ignore */ }

// CUSTOM FETCH: Forzamos a que los headers de Auth nunca vayan duplicados
const customFetch = async (url: string, options: any = {}) => {
  if (options.headers) {
    const headers = new Headers(options.headers)
    const deduplicate = (name: string) => {
      const value = headers.get(name)
      if (value && value.includes('Bearer ')) {
        const parts = value.split('Bearer ').pop()?.split('.') || []
        if (parts.length > 3) headers.set(name, `Bearer ${parts.slice(0, 3).join('.')}`)
      } else if (value && value.includes('.') && value.split('.').length > 3) {
        headers.set(name, value.split('.').slice(0, 3).join('.'))
      }
    }
    deduplicate('Authorization')
    deduplicate('apikey')
    options.headers = headers
  }
  return fetch(url, options)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: customFetch }
})
