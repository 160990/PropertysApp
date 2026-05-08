import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Users, Calendar, Target, ArrowUpRight, Clock, Plus, Phone, MessageSquare } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useT, usePrefsStore } from '../stores/prefsStore'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

const StatCard = ({ label, value, icon: Icon, onClick }: any) => (
  <button onClick={onClick} className="glass p-5 rounded-[2rem] min-w-[150px] relative overflow-hidden group card-hover text-left">
    <div className="absolute -right-2 -top-2 w-12 h-12 bg-white/5 rounded-full blur-xl group-hover:bg-brand-primary/20 transition-all" />
    <Icon className="text-white/40 mb-3" size={20} />
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-xs text-white/40 uppercase tracking-widest mt-1">{label}</div>
  </button>
)

export const Dashboard = () => {
  const { profile, user } = useAuthStore()
  const navigate = useNavigate()
  const lang = usePrefsStore(s => s.lang)
  const t = useT()
  
  const today = format(new Date(), lang === 'en' ? "EEEE, MMMM d" : "EEEE, d 'de' MMMM", { locale: lang === 'en' ? enUS : es })
  
  const [stats, setStats] = useState({ properties: 0, clients: 0, followups: 0, deals: 0 })
  const [todayTasks, setTodayTasks] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [pipelineCounts, setPipelineCounts] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchDashboard = async () => {
      setLoading(true)

      // Estadísticas
      const [propRes, clientRes, followupRes, dealRes] = await Promise.all([
        supabase.from('pa_properties').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('pa_clients').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('pa_followups').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_completed', false),
        supabase.from('pa_pipeline_deals').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('stage', 'cerrado_ganado'),
      ])

      setStats({
        properties: propRes.count || 0,
        clients: clientRes.count || 0,
        followups: followupRes.count || 0,
        deals: dealRes.count || 0,
      })

      // Tareas de hoy
      const todayStr = format(new Date(), 'yyyy-MM-dd')
      const { data: tasks } = await supabase
        .from('pa_followups')
        .select('*, pa_clients(full_name)')
        .eq('user_id', user.id)
        .eq('scheduled_date', todayStr)
        .eq('is_completed', false)
        .order('scheduled_time', { ascending: true })
        .limit(5)
      setTodayTasks(tasks || [])

      // Actividad reciente
      const { data: activity } = await supabase
        .from('pa_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentActivity(activity || [])

      // Pipeline counts
      const { data: deals } = await supabase
        .from('pa_pipeline_deals')
        .select('stage')
        .eq('user_id', user.id)
      
      const counts: any = {}
      ;(deals || []).forEach((d: any) => { counts[d.stage] = (counts[d.stage] || 0) + 1 })
      setPipelineCounts(counts)

      setLoading(false)
    }
    fetchDashboard()
  }, [user])

  const taskTypeIcons: any = {
    llamar: Phone,
    whatsapp: MessageSquare,
    visita: Building2,
    reunion: Users,
    email: Calendar,
  }

  const pipelineStages = [
    { key: 'nuevo_lead', label: 'Lead' },
    { key: 'contactado', label: 'Contact' },
    { key: 'visita_agendada', label: 'Visita' },
    { key: 'propuesta_enviada', label: 'Oferta' },
    { key: 'cerrado_ganado', label: lang === 'en' ? 'Won' : 'Ganado' },
  ]

  return (
    <div className="p-6 pt-12 space-y-8 animate-slide-up">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-white/40 text-sm font-medium uppercase tracking-[0.2em] mb-1">
            {today}
          </h2>
          <h1 className="text-3xl font-bold text-white">
            {t.goodMorning}, <span className="text-brand-primary">{profile?.full_name?.split(' ')[0] || 'Agente'}</span> 👋
          </h1>
        </div>
        <button onClick={() => navigate('/settings')} className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 glass p-1">
          <img
            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'A')}&background=6C63FF&color=fff`}
            alt="Profile"
            className="w-full h-full object-cover rounded-xl"
          />
        </button>
      </header>

      {/* Stats */}
      <section className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass h-28 min-w-[150px] rounded-[2rem] animate-pulse" />)
        ) : (
          <>
            <StatCard label={t.properties} value={stats.properties} icon={Building2} onClick={() => navigate('/properties')} />
            <StatCard label={t.clients} value={stats.clients} icon={Users} onClick={() => navigate('/clients')} />
            <StatCard label={t.pending} value={stats.followups} icon={Calendar} onClick={() => navigate('/followups')} />
            <StatCard label={t.closed} value={stats.deals} icon={Target} onClick={() => navigate('/pipeline')} />
          </>
        )}
      </section>

      {/* Agenda */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xl font-bold text-white">{t.todaysAgenda}</h3>
          <button onClick={() => navigate('/followups')} className="text-brand-primary text-sm font-semibold flex items-center">
            {t.viewAll} <ArrowUpRight size={16} className="ml-1" />
          </button>
        </div>

        {loading ? (
          <div className="glass h-20 rounded-3xl animate-pulse" />
        ) : todayTasks.length > 0 ? (
          <div className="space-y-3">
            {todayTasks.map((task) => {
              const TaskIcon = taskTypeIcons[task.task_type] || Clock
              return (
                <div key={task.id} className="glass p-5 rounded-3xl flex items-center space-x-4 card-hover">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                    <TaskIcon size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{task.title || task.task_type}</h4>
                    <p className="text-white/40 text-sm">{task.pa_clients?.full_name || t.noClient}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-brand-primary text-xs font-bold bg-brand-primary/10 px-3 py-1 rounded-full">
                      {task.scheduled_time ? task.scheduled_time.slice(0, 5) : '--:--'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="glass p-6 rounded-3xl text-center">
            <p className="text-white/30 text-sm">{t.noTasksToday}</p>
            <button onClick={() => navigate('/followups/new')} className="text-brand-primary text-xs font-bold mt-2">{t.addTask}</button>
          </div>
        )}
      </section>

      {/* Pipeline Snapshot */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-white px-1">{t.pipeline}</h3>
        <button onClick={() => navigate('/pipeline')} className="w-full glass p-6 rounded-[2.5rem] relative overflow-hidden card-hover">
          <div className="flex justify-between items-end mb-4">
            {pipelineStages.map((stage) => {
              const count = pipelineCounts[stage.key] || 0
              const maxHeight = 80
              const height = Math.max(15, count * 20)
              return (
                <div key={stage.key} className="flex flex-col items-center space-y-2">
                  <span className="text-xs font-bold text-white">{count}</span>
                  <div
                    className="w-10 bg-brand-primary rounded-t-lg transition-all duration-1000"
                    style={{ height: `${Math.min(height, maxHeight)}px`, opacity: count > 0 ? 1 : 0.2 }}
                  />
                  <span className="text-[9px] text-white/40 uppercase font-bold">{stage.label}</span>
                </div>
              )
            })}
          </div>
        </button>
      </section>

      {/* Recent Activity */}
      <section className="space-y-4 pb-10">
        <h3 className="text-xl font-bold text-white px-1">{t.recentActivity}</h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-1">
            {recentActivity.map((act) => (
              <div key={act.id} className="flex items-start space-x-4 p-4 rounded-3xl transition-colors hover:bg-white/5">
                <div className="w-2 h-2 rounded-full bg-brand-primary mt-2 shrink-0" />
                <div>
                  <p className="text-white text-sm">{act.description}</p>
                  <p className="text-white/20 text-xs mt-1">{format(new Date(act.created_at), lang === 'en' ? "MMM d, HH:mm" : "d MMM, HH:mm", { locale: lang === 'en' ? enUS : es })}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass p-6 rounded-3xl text-center">
            <p className="text-white/30 text-sm">{t.noRecentActivity}</p>
          </div>
        )}
      </section>
    </div>
  )
}
