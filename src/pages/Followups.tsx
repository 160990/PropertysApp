import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone, MessageSquare, Building2, Users, Calendar, Plus, Check, Trash2, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '../lib/utils'

const typeConfig: any = {
  llamar:  { icon: Phone,         label: 'Llamada',  color: 'bg-blue-500/10 text-blue-400' },
  whatsapp:{ icon: MessageSquare, label: 'WhatsApp', color: 'bg-green-500/10 text-green-400' },
  visita:  { icon: Building2,     label: 'Visita',   color: 'bg-purple-500/10 text-purple-400' },
  reunion: { icon: Users,         label: 'Reunión',  color: 'bg-amber-500/10 text-amber-400' },
  email:   { icon: Calendar,      label: 'Email',    color: 'bg-indigo-500/10 text-indigo-400' },
}

export const Followups = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toast } = useUIStore()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pendiente' | 'completado'>('pendiente')

  const fetchTasks = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('pa_followups')
      .select('*, pa_clients(full_name, phone)')
      .eq('user_id', user.id)
      .eq('is_completed', filter === 'completado')
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
    setTasks(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchTasks() }, [user, filter])

  const markDone = async (id: string) => {
    await supabase.from('pa_followups').update({ is_completed: true, completed_at: new Date().toISOString() }).eq('id', id)
    toast('Tarea completada ✓', 'success')
    fetchTasks()
  }

  const deleteTask = async (id: string) => {
    await supabase.from('pa_followups').delete().eq('id', id)
    toast('Tarea eliminada', 'info')
    fetchTasks()
  }

  const callClient = (phone: string) => { if (phone) window.open(`tel:${phone}`, '_self') }
  const whatsappClient = (phone: string) => { if (phone) window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank') }

  const today = new Date().toISOString().split('T')[0]
  const overdue = tasks.filter(t => t.scheduled_date < today)
  const todayTasks = tasks.filter(t => t.scheduled_date === today)
  const upcoming = tasks.filter(t => t.scheduled_date > today)

  const TaskCard = ({ task }: { task: any }) => {
    const cfg = typeConfig[task.task_type] || typeConfig.llamar
    const Icon = cfg.icon
    const isOverdue = task.scheduled_date < today

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "glass p-5 rounded-3xl flex items-center space-x-4 card-hover",
          isOverdue && !task.is_completed ? "border border-red-500/20" : ""
        )}
      >
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", cfg.color)}>
          <Icon size={22} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold text-sm truncate">
            {task.title || cfg.label}
          </h4>
          <p className="text-white/40 text-xs">{task.pa_clients?.full_name || 'Sin cliente'}</p>
          <div className="flex items-center space-x-3 mt-1">
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", isOverdue ? "bg-red-500/10 text-red-400" : "bg-brand-primary/10 text-brand-primary")}>
              {format(new Date(task.scheduled_date + 'T00:00:00'), "d MMM", { locale: es })}
              {task.scheduled_time ? ` · ${task.scheduled_time.slice(0, 5)}` : ''}
            </span>
          </div>
        </div>

        <div className="flex flex-col space-y-2 shrink-0">
          {task.task_type === 'llamar' && task.pa_clients?.phone && (
            <button onClick={() => callClient(task.pa_clients.phone)} className="p-2 bg-blue-500/10 rounded-xl text-blue-400 active:scale-90 transition-all">
              <Phone size={16} />
            </button>
          )}
          {task.task_type === 'whatsapp' && task.pa_clients?.phone && (
            <button onClick={() => whatsappClient(task.pa_clients.phone)} className="p-2 bg-green-500/10 rounded-xl text-green-400 active:scale-90 transition-all">
              <MessageSquare size={16} />
            </button>
          )}
          {!task.is_completed && (
            <button onClick={() => markDone(task.id)} className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary active:scale-90 transition-all">
              <Check size={16} />
            </button>
          )}
          <button onClick={() => deleteTask(task.id)} className="p-2 bg-white/5 rounded-xl text-white/20 active:scale-90 transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="p-6 pt-12 space-y-6 animate-slide-up pb-24">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Agenda</h1>
        <button onClick={() => navigate('/followups/new')} className="p-3 glass rounded-2xl text-brand-primary active:scale-90 transition-all">
          <Plus size={24} />
        </button>
      </header>

      <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
        {(['pendiente', 'completado'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn("flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              filter === f ? "bg-brand-primary text-white shadow-lg" : "text-white/40"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass h-24 rounded-3xl animate-pulse" />)
      ) : tasks.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
            <Clock size={40} />
          </div>
          <p className="text-white/40">No hay tareas {filter === 'completado' ? 'completadas' : 'pendientes'}</p>
          {filter === 'pendiente' && (
            <button onClick={() => navigate('/followups/new')} className="btn-gradient px-8 py-3 text-sm">Agendar Tarea</button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-black text-red-400 uppercase tracking-widest ml-2 flex items-center">⚠️ Vencidas</h3>
              {overdue.map(t => <TaskCard key={t.id} task={t} />)}
            </section>
          )}
          {todayTasks.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest ml-2">📅 Hoy</h3>
              {todayTasks.map(t => <TaskCard key={t.id} task={t} />)}
            </section>
          )}
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-black text-white/30 uppercase tracking-widest ml-2">🗓 Próximas</h3>
              {upcoming.map(t => <TaskCard key={t.id} task={t} />)}
            </section>
          )}
        </div>
      )}
    </div>
  )
}
