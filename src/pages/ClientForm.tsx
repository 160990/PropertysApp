import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, User, Mail, Phone, Loader2, Check, Target } from 'lucide-react'
import { cn } from '../lib/utils'
import { useClientStore } from '../stores/clientStore'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'
import { supabase } from '../lib/supabase'

export const ClientForm = () => {
  const navigate = useNavigate()
  const { addClient } = useClientStore()
  const { user } = useAuthStore()
  const { toast } = useUIStore()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    client_type: 'comprador',
    budget_min: '',
    budget_max: '',
    preferred_zones: '',
    lead_temperature: 'warm',
    source: '',
    notes: '',
    create_pipeline_deal: true,
  })

  const update = (field: string, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const client = await addClient({
        user_id: user?.id,
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        client_type: formData.client_type,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        preferred_zones: formData.preferred_zones
          ? formData.preferred_zones.split(',').map(z => z.trim())
          : [],
        lead_temperature: formData.lead_temperature,
        source: formData.source || null,
        notes: formData.notes || null,
      })

      await supabase.from('pa_activities').insert({
        user_id: user?.id,
        activity_type: 'client_added',
        entity_type: 'client',
        entity_id: client.id,
        description: `Nuevo cliente "${formData.full_name}" agregado`,
      })

      if (formData.create_pipeline_deal) {
        await supabase.from('pa_pipeline_deals').insert({
          user_id: user?.id,
          client_id: client.id,
          client_name: formData.full_name,
          deal_value: formData.budget_max
            ? parseFloat(formData.budget_max)
            : formData.budget_min
            ? parseFloat(formData.budget_min)
            : 0,
          stage: 'nuevo_lead',
        })
      }

      toast(
        'Cliente ' +
          (formData.create_pipeline_deal ? 'agregado y enviado al pipeline ✓' : 'agregado ✓'),
        'success'
      )
      navigate('/clients')
    } catch (err: any) {
      toast(err.message || 'Error al guardar', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col pb-24 animate-slide-up">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/5 glass sticky top-0 z-40">
        <button onClick={() => navigate('/clients')} className="text-white/40 active:scale-90 transition-all">
          <X size={24} />
        </button>
        <h2 className="text-white font-bold">Nuevo Cliente</h2>
        <div className="w-6" />
      </header>

      {/* Scroll area */}
      <div className="flex-1">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Nombre Completo</label>
          <div className="relative">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="text"
              value={formData.full_name}
              onChange={e => update('full_name', e.target.value)}
              placeholder="Nombre del cliente"
              className="input-field pl-14"
            />
          </div>
        </div>

        {/* Teléfono + Email */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input
                type="tel"
                value={formData.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="+507..."
                className="input-field pl-14"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Email</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input
                type="email"
                value={formData.email}
                onChange={e => update('email', e.target.value)}
                placeholder="email@..."
                className="input-field pl-14"
              />
            </div>
          </div>
        </div>

        {/* Tipo de cliente */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Tipo de Cliente</label>
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
            {['comprador', 'arrendatario', 'inversionista'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => update('client_type', t)}
                className={cn(
                  'flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all',
                  formData.client_type === t ? 'bg-brand-primary text-white shadow-lg' : 'text-white/40'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Pipeline toggle */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-brand-primary ml-4 flex items-center">
            <Target size={14} className="mr-2" /> Pipeline
          </label>
          <div className="glass p-5 rounded-2xl flex items-center justify-between border border-brand-primary/20">
            <div>
              <p className="text-white font-bold text-sm">Enviar al Pipeline</p>
              <p className="text-white/30 text-[10px]">Crea una oportunidad automáticamente</p>
            </div>
            <button
              type="button"
              onClick={() => update('create_pipeline_deal', !formData.create_pipeline_deal)}
              className={cn(
                'w-14 h-8 rounded-full transition-all duration-300 relative border-2',
                formData.create_pipeline_deal
                  ? 'bg-brand-primary border-brand-primary'
                  : 'bg-white/10 border-white/20'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 bg-white rounded-full absolute top-[3px] transition-all duration-300 shadow-sm',
                  formData.create_pipeline_deal ? 'right-[3px]' : 'left-[3px]'
                )}
              />
            </button>
          </div>
        </div>

        {/* Temperatura */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Temperatura del Lead</label>
          <div className="flex gap-3">
            {[
              { id: 'hot', label: '🔥 Hot', color: 'border-red-500 bg-red-500/10 text-red-400' },
              { id: 'warm', label: '🌤 Warm', color: 'border-orange-500 bg-orange-500/10 text-orange-400' },
              { id: 'cold', label: '❄️ Cold', color: 'border-blue-500 bg-blue-500/10 text-blue-400' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => update('lead_temperature', t.id)}
                className={cn(
                  'flex-1 py-3 rounded-2xl text-xs font-bold border-2 transition-all',
                  formData.lead_temperature === t.id ? t.color : 'border-white/10 bg-white/5 text-white/40'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Presupuesto */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Presupuesto Mín (USD)</label>
            <input
              type="number"
              value={formData.budget_min}
              onChange={e => update('budget_min', e.target.value)}
              placeholder="50,000"
              className="input-field"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Presupuesto Máx (USD)</label>
            <input
              type="number"
              value={formData.budget_max}
              onChange={e => update('budget_max', e.target.value)}
              placeholder="500,000"
              className="input-field"
            />
          </div>
        </div>

        {/* Zonas */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Zonas de Interés</label>
          <input
            type="text"
            value={formData.preferred_zones}
            onChange={e => update('preferred_zones', e.target.value)}
            placeholder="Costa del Este, Punta Pacífica..."
            className="input-field"
          />
        </div>

        {/* Fuente */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Fuente del Lead</label>
          <select
            value={formData.source}
            onChange={e => update('source', e.target.value)}
            className="input-field appearance-none"
          >
            <option value="" className="bg-brand-bg">Seleccionar...</option>
            <option value="referido" className="bg-brand-bg">Referido</option>
            <option value="portal" className="bg-brand-bg">Portal Inmobiliario</option>
            <option value="redes_sociales" className="bg-brand-bg">Redes Sociales</option>
            <option value="whatsapp" className="bg-brand-bg">WhatsApp</option>
            <option value="llamada_fria" className="bg-brand-bg">Llamada Fría</option>
            <option value="otro" className="bg-brand-bg">Otro</option>
          </select>
        </div>

        {/* Notas */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Notas</label>
          <textarea
            value={formData.notes}
            onChange={e => update('notes', e.target.value)}
            placeholder="Notas sobre el cliente..."
            rows={3}
            className="input-field resize-none"
          />
        </div>
        </form>
      </div>

      {/* Footer integrado en el scroll */}
      <footer className="p-6 mt-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full btn-gradient py-4 flex items-center justify-center shadow-xl shadow-brand-primary/20 active:scale-95 transition-all"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Check size={18} className="mr-2" /> Guardar Cliente
            </>
          )}
        </button>
      </footer>
    </div>
  )
}
