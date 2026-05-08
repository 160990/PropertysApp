import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, MoreVertical, Clock, Building2, Loader2, Trash2, ChevronRight, Check } from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'
import { useT, usePrefsStore } from '../stores/prefsStore'
import { BottomSheet } from '../components/ui/BottomSheet'

const DealCard = ({ deal, onMore }: any) => {
  const daysSince = Math.floor((Date.now() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24))
  const t = useT()
  const clientName = deal.pa_clients?.full_name || deal.client_name || t.noClient
  const value = deal.deal_value || 0

  return (
    <motion.div layout className="glass p-4 rounded-2xl space-y-3 card-hover border-l-4 border-l-brand-primary active:scale-[0.98] transition-all">
      <div className="flex justify-between items-start">
        <h4 className="text-white font-bold text-sm truncate pr-2">{clientName}</h4>
        <button onClick={() => onMore(deal)} className="text-white/20 p-1 -mr-1 active:scale-90 transition-transform"><MoreVertical size={16} /></button>
      </div>
      {deal.pa_properties?.title && (
        <div className="flex items-center text-white/40 text-[10px] space-x-2">
          <Building2 size={12} className="shrink-0" />
          <span className="truncate">{deal.pa_properties.title}</span>
        </div>
      )}
      <div className="flex justify-between items-center pt-2 border-t border-white/5">
        <span className="text-brand-accent font-bold text-xs">{formatCurrency(value)}</span>
        <div className="flex items-center text-white/20 text-[10px]">
          <Clock size={10} className="mr-1" />{daysSince}d
        </div>
      </div>
    </motion.div>
  )
}

export const Pipeline = () => {
  const { user } = useAuthStore()
  const { toast } = useUIStore()
  const t = useT()
  const lang = usePrefsStore(s => s.lang)
  const [deals, setDeals] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const stages = [
    { id: 'nuevo_lead',         label: lang === 'en' ? 'New Lead' : 'Nuevo Lead',  color: '#6C63FF' },
    { id: 'contactado',         label: lang === 'en' ? 'Contacted' : 'Contactado',  color: '#8A84FF' },
    { id: 'visita_agendada',    label: lang === 'en' ? 'Visit' : 'Visita',      color: '#D4AF37' },
    { id: 'propuesta_enviada',  label: lang === 'en' ? 'Proposal' : 'Propuesta',   color: '#FFD700' },
    { id: 'negociando',         label: lang === 'en' ? 'Negotiating' : 'Negociando',  color: '#4CAF50' },
    { id: 'cerrado_ganado',     label: lang === 'en' ? 'Closed' : 'Cerrado',     color: '#2E7D32' },
  ]

  // Formulario nuevo deal — solo usa columnas reales de la tabla
  const [newDeal, setNewDeal] = useState({
    client_id: '',
    property_id: '',
    client_name: '',
    deal_value: '',
    stage: 'nuevo_lead',
    notes: '',
  })

  const fetchDeals = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('pa_pipeline_deals')
      .select('*, pa_clients(full_name, phone), pa_properties(title)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    if (error) console.error('fetchDeals error:', error)
    setDeals(data || [])
    setLoading(false)
  }

  const fetchResources = async () => {
    if (!user) return
    const [cRes, pRes] = await Promise.all([
      supabase.from('pa_clients').select('id, full_name').eq('user_id', user.id).order('full_name'),
      supabase.from('pa_properties').select('id, title, price').eq('user_id', user.id).order('title'),
    ])
    setClients(cRes.data || [])
    setProperties(pRes.data || [])
  }

  useEffect(() => {
    fetchDeals()
    fetchResources()
  }, [user])

  const moveToNextStage = async () => {
    if (!selectedDeal) return
    const idx = stages.findIndex(s => s.id === selectedDeal.stage)
    if (idx >= stages.length - 1) return toast('Ya está en la última etapa', 'info')
    const nextStage = stages[idx + 1].id
    const { error } = await supabase
      .from('pa_pipeline_deals')
      .update({ stage: nextStage, updated_at: new Date().toISOString() })
      .eq('id', selectedDeal.id)
    if (!error) {
      toast(`Movido a "${stages[idx + 1].label}"`, 'success')
      setShowActionSheet(false)
      fetchDeals()
    }
  }

  const handleDeleteDeal = async () => {
    if (!selectedDeal) return
    await supabase.from('pa_pipeline_deals').delete().eq('id', selectedDeal.id)
    toast('Deal eliminado', 'info')
    setShowActionSheet(false)
    fetchDeals()
  }

  const handleAddDeal = async () => {
    const selectedClient = clients.find(c => c.id === newDeal.client_id)
    const nameToUse = selectedClient?.full_name || newDeal.client_name

    if (!nameToUse) return toast('Selecciona o escribe un cliente', 'error')
    setSaving(true)

    // Solo columnas que EXISTEN en la tabla
    const payload: any = {
      user_id: user?.id,
      stage: newDeal.stage,
      client_name: nameToUse,
      deal_value: newDeal.deal_value ? parseFloat(newDeal.deal_value) : 0,
      notes: newDeal.notes || null,
    }
    if (newDeal.client_id) payload.client_id = newDeal.client_id
    if (newDeal.property_id) payload.property_id = newDeal.property_id

    const { error } = await supabase.from('pa_pipeline_deals').insert(payload)
    setSaving(false)

    if (error) {
      console.error('Pipeline insert error:', error)
      return toast(error.message, 'error')
    }
    setShowAddSheet(false)
    setNewDeal({ client_id: '', property_id: '', client_name: '', deal_value: '', stage: 'nuevo_lead', notes: '' })
    toast('Deal creado en el pipeline', 'success')
    fetchDeals()
  }

  const totalValue = deals.reduce((acc, d) => acc + (d.deal_value || 0), 0)
  const activeDeals = deals.filter(d => d.stage !== 'cerrado_ganado').length

  return (
    <div className="h-screen bg-brand-bg flex flex-col overflow-hidden animate-slide-up">
      {/* Header */}
      <header className="p-6 pt-12 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">{t.pipeline}</h1>
          <button
            onClick={() => setShowAddSheet(true)}
            className="p-3 glass rounded-2xl text-brand-primary active:scale-90 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white">{activeDeals}</span>
            <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">{t.active}</span>
          </div>
          <div className="flex flex-col border-l border-white/10 pl-6">
            <span className="text-2xl font-bold text-brand-primary">{formatCurrency(totalValue)}</span>
            <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">{t.totalValue}</span>
          </div>
          <div className="flex flex-col border-l border-white/10 pl-6">
            <span className="text-2xl font-bold text-white">{deals.length}</span>
            <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">{t.total}</span>
          </div>
        </div>
      </header>

      {/* Columns */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto px-6 pb-6 flex space-x-4 items-start">
          {stages.map((stage) => {
            const stageDeals = deals.filter(d => d.stage === stage.id)
            return (
              <div key={stage.id} className="min-w-[270px] flex flex-col">
                <div className="flex items-center space-x-2 mb-3 px-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-white font-bold text-[10px] uppercase tracking-widest">{stage.label}</span>
                  <span className="bg-white/5 text-white/40 px-2 py-0.5 rounded text-[10px]">{stageDeals.length}</span>
                </div>
                <div className="space-y-3 overflow-y-auto max-h-[60vh] scrollbar-hide pb-4">
                  {stageDeals.map(deal => (
                    <DealCard key={deal.id} deal={deal} onMore={(d: any) => { setSelectedDeal(d); setShowActionSheet(true) }} />
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="border-2 border-dashed border-white/5 rounded-2xl h-20 flex items-center justify-center">
                      <span className="text-[10px] text-white/10 uppercase font-bold tracking-widest">{t.noDeals}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Deal Sheet */}
      <BottomSheet open={showAddSheet} onClose={() => setShowAddSheet(false)} title={t.newOpportunity}>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-white/30 ml-4">{t.existingClient}</label>
            <select
              value={newDeal.client_id}
              onChange={e => setNewDeal({ ...newDeal, client_id: e.target.value })}
              className="input-field appearance-none"
            >
              <option value="" className="bg-brand-bg">{t.selectClient}</option>
              {clients.map(c => <option key={c.id} value={c.id} className="bg-brand-bg">{c.full_name}</option>)}
            </select>
          </div>

          {!newDeal.client_id && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-white/30 ml-4">{t.orManualName}</label>
              <input
                type="text"
                value={newDeal.client_name}
                onChange={e => setNewDeal({ ...newDeal, client_name: e.target.value })}
                placeholder="Ej: Nuevo prospecto"
                className="input-field"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-white/30 ml-4">{t.propOptional}</label>
            <select
              value={newDeal.property_id}
              onChange={e => setNewDeal({ ...newDeal, property_id: e.target.value })}
              className="input-field appearance-none"
            >
              <option value="" className="bg-brand-bg">{t.noPropLinked}</option>
              {properties.map(p => (
                <option key={p.id} value={p.id} className="bg-brand-bg">{p.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-white/30 ml-4">{t.dealValue}</label>
            <input
              type="number"
              value={newDeal.deal_value}
              onChange={e => setNewDeal({ ...newDeal, deal_value: e.target.value })}
              placeholder="250000"
              className="input-field"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-white/30 ml-4">{t.initialStage}</label>
            <select
              value={newDeal.stage}
              onChange={e => setNewDeal({ ...newDeal, stage: e.target.value })}
              className="input-field appearance-none"
            >
              {stages.map(s => <option key={s.id} value={s.id} className="bg-brand-bg">{s.label}</option>)}
            </select>
          </div>

          <button
            onClick={handleAddDeal}
            disabled={saving}
            className="w-full btn-gradient py-4 mt-2 font-bold uppercase tracking-widest text-sm flex items-center justify-center"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : t.createDeal}
          </button>
        </div>
      </BottomSheet>

      {/* Action Sheet */}
      <BottomSheet open={showActionSheet} onClose={() => setShowActionSheet(false)} title={selectedDeal?.pa_clients?.full_name || selectedDeal?.client_name || 'Deal'}>
        <div className="space-y-3">
          <button
            onClick={moveToNextStage}
            className="w-full flex items-center justify-between p-5 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center space-x-4">
              <Check size={20} className="text-brand-primary" />
              <div className="text-left">
                <p className="text-white text-sm font-bold">{t.advanceStage}</p>
                <p className="text-white/30 text-[10px]">
                  {(() => {
                    const idx = stages.findIndex(s => s.id === selectedDeal?.stage)
                    return idx < stages.length - 1 ? `→ ${stages[idx + 1]?.label}` : t.finalStage
                  })()}
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-white/20" />
          </button>

          <button
            onClick={handleDeleteDeal}
            className="w-full flex items-center space-x-4 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 active:scale-[0.98] transition-all"
          >
            <Trash2 size={20} className="text-red-400" />
            <span className="text-red-400 text-sm font-bold">{t.deleteDeal}</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
