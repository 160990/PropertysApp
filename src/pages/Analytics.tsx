import { useEffect, useState } from 'react'
import { TrendingUp, Users, Building2, Target, Download } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { formatCurrency } from '../lib/utils'

export const Analytics = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<any>({})
  const [pipelineData, setPipelineData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchAnalytics = async () => {
      const [propRes, clientRes, dealRes, wonRes] = await Promise.all([
        supabase.from('pa_properties').select('id, price', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('pa_clients').select('id, lead_temperature', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('pa_pipeline_deals').select('id, stage, deal_value').eq('user_id', user.id),
        supabase.from('pa_pipeline_deals').select('deal_value').eq('user_id', user.id).eq('stage', 'cerrado_ganado'),
      ])

      const totalPortfolio = (propRes.data || []).reduce((a: number, p: any) => a + (p.price || 0), 0)
      const wonValue = (wonRes.data || []).reduce((a: number, d: any) => a + (d.deal_value || 0), 0)
      const hotLeads = (clientRes.data || []).filter((c: any) => c.lead_temperature === 'hot').length

      setStats({
        totalProperties: propRes.count || 0,
        totalClients: clientRes.count || 0,
        totalDeals: (dealRes.data || []).length,
        wonDeals: (wonRes.data || []).length,
        totalPortfolio,
        wonValue,
        hotLeads,
      })

      // Pipeline breakdown
      const stages = ['nuevo_lead', 'contactado', 'visita_agendada', 'propuesta_enviada', 'negociando', 'cerrado_ganado']
      const stageLabels: any = { nuevo_lead: 'Lead', contactado: 'Contacto', visita_agendada: 'Visita', propuesta_enviada: 'Oferta', negociando: 'Negoc.', cerrado_ganado: 'Cerrado' }
      const stageCounts = stages.map(s => ({
        name: stageLabels[s],
        count: (dealRes.data || []).filter((d: any) => d.stage === s).length,
        value: (dealRes.data || []).filter((d: any) => d.stage === s).reduce((a: number, d: any) => a + (d.deal_value || 0), 0),
      }))
      setPipelineData(stageCounts)

      setLoading(false)
    }
    fetchAnalytics()
  }, [user])

  if (loading) return (
    <div className="p-6 pt-12 space-y-6 animate-slide-up pb-24">
      <h1 className="text-3xl font-bold text-white">Análisis</h1>
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass h-28 rounded-3xl animate-pulse" />)}
    </div>
  )

  const maxBar = Math.max(...pipelineData.map(s => s.count), 1)

  return (
    <div className="p-6 pt-12 space-y-8 animate-slide-up pb-24">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Análisis</h1>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Portafolio', value: formatCurrency(stats.totalPortfolio), icon: TrendingUp, color: 'text-green-500' },
          { label: 'Leads Hot', value: stats.hotLeads, icon: Users, color: 'text-red-500' },
          { label: 'Propiedades', value: stats.totalProperties, icon: Building2, color: 'text-brand-primary' },
          { label: 'Deals Ganados', value: stats.wonDeals, icon: Target, color: 'text-brand-accent' },
        ].map((stat, i) => (
          <div key={i} className="glass p-5 rounded-3xl space-y-2">
            <stat.icon className={stat.color} size={20} />
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pipeline Chart (custom, no external dependency) */}
      <section className="glass p-6 rounded-[2.5rem] space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Embudo de Pipeline</h3>
        <div className="space-y-3">
          {pipelineData.map((stage, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/60 font-medium">{stage.name}</span>
                <span className="text-white/40">{stage.count} deal{stage.count !== 1 ? 's' : ''} · {formatCurrency(stage.value)}</span>
              </div>
              <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-1000"
                  style={{ width: `${(stage.count / maxBar) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue Summary */}
      <section className="glass p-6 rounded-[2.5rem] space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Resumen de Ingresos</h3>
        <div className="flex justify-between items-center py-3 border-b border-white/5">
          <span className="text-white/60 text-sm">Valor total en pipeline</span>
          <span className="text-white font-bold">{formatCurrency(pipelineData.reduce((a, s) => a + s.value, 0))}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-white/5">
          <span className="text-white/60 text-sm">Deals cerrados (ganados)</span>
          <span className="text-green-400 font-bold">{formatCurrency(stats.wonValue)}</span>
        </div>
        <div className="flex justify-between items-center py-3">
          <span className="text-white/60 text-sm">Win Rate</span>
          <span className="text-brand-primary font-bold">{stats.totalDeals > 0 ? Math.round((stats.wonDeals / stats.totalDeals) * 100) : 0}%</span>
        </div>
      </section>
    </div>
  )
}
