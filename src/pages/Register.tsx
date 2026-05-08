import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Phone, Briefcase, Award, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    agencyName: '',
    licenseNumber: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Primero intentar registrar en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          }
        }
      })

      let userId: string | null = null

      if (authError) {
        // Si el usuario ya existe, intentar iniciar sesión
        if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          })

          if (loginError) {
            throw new Error('Este email ya tiene cuenta. Intenta iniciar sesión con tu contraseña existente.')
          }

          userId = loginData.user?.id || null
        } else {
          throw authError
        }
      } else {
        userId = authData.user?.id || null
      }

      if (!userId) throw new Error('No se pudo obtener el ID del usuario')

      // Verificar si ya existe un perfil
      const { data: existingProfile } = await supabase
        .from('pa_profiles')
        .select('id')
        .eq('id', userId)
        .single()

      if (!existingProfile) {
        // Crear perfil en pa_profiles
        const { error: profileError } = await supabase
          .from('pa_profiles')
          .insert({
            id: userId,
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            agency_name: formData.agencyName || null,
            license_number: formData.licenseNumber || null,
            theme: 'dark',
            language: 'es'
          })

        if (profileError) {
          console.error('Error creando perfil:', profileError)
          // Si ya existe, no es un error fatal
          if (!profileError.message.includes('duplicate')) {
            throw profileError
          }
        }
      } else {
        // Actualizar perfil existente con los nuevos datos
        await supabase
          .from('pa_profiles')
          .update({
            full_name: formData.fullName,
            phone: formData.phone,
            agency_name: formData.agencyName || null,
            license_number: formData.licenseNumber || null,
          })
          .eq('id', userId)
      }

      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Error en el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col px-6 py-20 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white mb-2">Crear Cuenta</h1>
        <p className="text-white/40 mb-10">Únete a la red más exclusiva de Panamá</p>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 ml-4">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input
                type="text"
                placeholder="Juan Pérez"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="input-field pl-14"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 ml-4">Email</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field pl-14"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 ml-4">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input
                type="tel"
                placeholder="+507 6XXX-XXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field pl-14"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 ml-4">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field pl-14"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 ml-4">Agencia (opcional)</label>
              <div className="relative">
                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="text"
                  placeholder="Nombre"
                  value={formData.agencyName}
                  onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                  className="input-field pl-14"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 ml-4">Licencia (opcional)</label>
              <div className="relative">
                <Award className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="text"
                  placeholder="PN-XXXX"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="input-field pl-14"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient py-4 flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Crear Mi Cuenta</span>}
          </button>
        </form>

        <div className="mt-8 text-center pb-10">
          <p className="text-white/40 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-brand-primary font-bold">
              Inicia sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
