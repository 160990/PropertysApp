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

// LIMPIEZA AGRESIVA DE HEADERS: Patch global de fetch para interceptar CUALQUIER llamada
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  if (init?.headers) {
    const headers = new Headers(init.headers)
    const deduplicate = (name: string) => {
      const value = headers.get(name)
      if (!value) return
      
      // Buscamos el primer JWT válido (3 partes unidas por puntos que empiezan por eyJ)
      const jwtMatch = value.match(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g)
      if (jwtMatch && jwtMatch.length > 0) {
        const cleanToken = jwtMatch[0]
        // Si el valor actual es diferente al limpio (estaba duplicado o sucio), lo corregimos
        const expectedValue = name === 'Authorization' ? `Bearer ${cleanToken}` : cleanToken
        if (value !== expectedValue) {
          headers.set(name, expectedValue)
        }
      }
    }

    deduplicate('Authorization')
    deduplicate('apikey')
    
    // Sobrescribimos init.headers con los corregidos
    init = { ...init, headers }
  }
  return originalFetch(input, init)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
