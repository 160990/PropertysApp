import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, Calendar, Clock, MessageSquare, Phone, Users, Check, Loader2, Tag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'
import { cn } from '../lib/utils'

const taskTypes = [
  { id: 'llamar', label: 'Llamada', icon: Phone, color: 'bg-blue-500' },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'bg-green-500' },
  { id: 'visita', label: 'Visita', icon: Tag, color: 'bg-purple-500' },
  { id: 'reunion', label: 'Reunión', icon: Users, color: 'bg-amber-500' },
  { id: 'email', label: 'Email', icon: Calendar, color: 'bg-indigo-500' },
]

export const FollowUpForm = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toast } = useUIStore()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    task_type: 'llamar',
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '09:00',
    description: '',
  })

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase.from('pa_clients').select('id, full_name').eq('user_id', user?.id).order('full_name')
      setClients(data || [])
    }
    if (user) fetchClients()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.client_id) return toast('Selecciona un cliente', 'error')
    
    setLoading(true)
    try {
      const { error } = await supabase.from('pa_followups').insert({
        user_id: user?.id,
        client_id: formData.client_id,
        title: formData.title || `Seguimiento: ${taskTypes.find(t => t.id === formData.task_type)?.label}`,
        task_type: formData.task_type,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
        description: formData.description,
        is_completed: false
      })

      if (error) throw error

      await supabase.from('pa_activities').insert({
        user_id: user?.id,
        activity_type: 'followup_created',
        description: `Tarea programada: ${formData.title || formData.task_type}`,
      })

      toast('Tarea agendada con éxito', 'success')
      navigate('/dashboard')
    } catch (err: any) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col pb-24 animate-slide-up">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/5 glass sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="text-white/40 active:scale-90 transition-all"><X size={24} /></button>
        <h2 className="text-white font-bold">Nueva Tarea</h2>
        <div className="w-6" />
      </header>

      {/* Contenido principal */}
      <div className="flex-1">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Cliente</label>
            <select 
              value={formData.client_id} 
              onChange={e => setFormData({ ...formData, client_id: e.target.value })}
              className="input-field appearance-none"
              required
            >
              <option value="" className="bg-brand-bg">Seleccionar cliente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id} className="bg-brand-bg">{c.full_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Tipo de Tarea</label>
            <div className="grid grid-cols-5 gap-2">
              {taskTypes.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, task_type: t.id })}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all aspect-square",
                    formData.task_type === t.id ? "bg-brand-primary/10 border-brand-primary text-brand-primary" : "bg-white/5 border-white/10 text-white/40"
                  )}
                >
                  <t.icon size={20} />
                  <span className="text-[8px] mt-1 font-bold uppercase">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Título / Referencia</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })} 
              placeholder="Ej: Llamar para confirmar visita" 
              className="input-field" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Fecha</label>
              <input 
                type="date" 
                value={formData.scheduled_date} 
                onChange={e => setFormData({ ...formData, scheduled_date: e.target.value })} 
                className="input-field" 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Hora</label>
              <input 
                type="time" 
                value={formData.scheduled_time} 
                onChange={e => setFormData({ ...formData, scheduled_time: e.target.value })} 
                className="input-field" 
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Notas Adicionales</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
              placeholder="Detalles sobre lo que se debe hacer..." 
              rows={4} 
              className="input-field resize-none" 
            />
          </div>
        </form>
      </div>

      {/* Footer integrado en el scroll (queda arriba del BottomNav) */}
      <footer className="p-6 mt-4">
        <button 
          onClick={handleSubmit as any} 
          disabled={loading} 
          className="w-full btn-gradient py-4 flex items-center justify-center shadow-xl shadow-brand-primary/20 active:scale-95 transition-all"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} className="mr-2" /> Agendar Tarea</>}
        </button>
      </footer>
    </div>
  )
}
