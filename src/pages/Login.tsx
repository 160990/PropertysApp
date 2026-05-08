import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const ensureProfile = async (userId: string, userEmail: string) => {
    // Verificar si ya existe un perfil pa_profiles
    const { data: existing } = await supabase
      .from('pa_profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existing) {
      // Crear perfil automáticamente si no existe
      await supabase.from('pa_profiles').insert({
        id: userId,
        full_name: userEmail.split('@')[0],
        email: userEmail,
        theme: 'dark',
        language: 'es',
      })
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) {
        // Traducir errores comunes
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Credenciales inválidas. Verifica tu email y contraseña.')
        }
        if (authError.message.includes('Email not confirmed')) {
          throw new Error('Tu email no ha sido confirmado. Revisa tu bandeja de entrada.')
        }
        throw authError
      }

      if (data.user) {
        await ensureProfile(data.user.id, data.user.email || email)
      }

      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col px-6 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Bienvenido</h1>
        <p className="text-white/40 mb-10">Ingresa tus credenciales para continuar</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Email</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-14"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-14 pr-14"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 active:text-brand-primary"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-brand-primary text-sm font-medium">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient py-4 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Iniciar Sesión</span>}
          </button>
        </form>

        <div className="mt-10 text-center pb-10">
          <p className="text-white/40 text-sm">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-brand-primary font-bold">
              Regístrate ahora
            </Link>
          </p>
          <p className="text-white/10 text-[10px] mt-10 uppercase tracking-widest">
            Build v1.0.8 - Nuclear Patch Active
          </p>
        </div>
      </motion.div>
    </div>
  )
}
