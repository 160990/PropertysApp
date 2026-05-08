import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, UserPlus, Phone, MessageSquare, MoreHorizontal, Flame, Snowflake, Sun, ChevronRight, Trash2 } from 'lucide-react'
import { useClientStore } from '../stores/clientStore'
import { useUIStore } from '../stores/uiStore'
import { useT } from '../stores/prefsStore'
import { cn } from '../lib/utils'
import { BottomSheet } from '../components/ui/BottomSheet'
import { supabase } from '../lib/supabase'

const TemperatureBadge = ({ temp }: { temp: string }) => {
  const t = useT()
  const configs: any = {
    hot: { icon: Flame, color: 'text-red-500 bg-red-500/10', label: t.hot },
    warm: { icon: Sun, color: 'text-orange-500 bg-orange-500/10', label: t.warm },
    cold: { icon: Snowflake, color: 'text-blue-500 bg-blue-500/10', label: t.cold },
  }
  const config = configs[temp] || configs.warm
  return (
    <div className={cn("flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", config.color)}>
      <config.icon size={12} className="mr-1" />
      {config.label}
    </div>
  )
}

export const Clients = () => {
  const { clients, loading, fetchClients } = useClientStore()
  const { toast } = useUIStore()
  const t = useT()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [showSheet, setShowSheet] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const filtered = clients.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  const handleWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank')
  }

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const handleDelete = async (clientId: string) => {
    const { error } = await supabase.from('pa_clients').delete().eq('id', clientId)
    if (!error) {
      fetchClients()
      setShowSheet(false)
      toast('Cliente eliminado', 'info')
    }
  }

  return (
    <div className="p-6 pt-12 space-y-6 animate-slide-up">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">{t.clients}</h1>
        <button onClick={() => navigate('/clients/new')} className="p-3 glass rounded-2xl text-brand-primary active:scale-90 transition-all">
          <UserPlus size={24} />
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
        <input
          type="text"
          placeholder={t.searchClient}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-14"
        />
      </div>

      <div className="space-y-4 pb-24">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass h-24 rounded-3xl animate-pulse" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-5 rounded-[2rem] flex items-center space-x-4 card-hover"
            >
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-white/10 to-white/5 flex items-center justify-center text-white/40 text-xl font-bold border border-white/5 shrink-0">
                {client.full_name?.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-white font-bold truncate">{client.full_name}</h3>
                  <TemperatureBadge temp={client.lead_temperature} />
                </div>
                <p className="text-white/40 text-xs mt-1">{client.client_type} {client.phone && `· ${client.phone}`}</p>
              </div>

              <div className="flex space-x-2 shrink-0">
                {client.phone && (
                  <button
                    onClick={() => handleWhatsApp(client.phone)}
                    className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500/20 transition-all active:scale-90"
                  >
                    <MessageSquare size={18} />
                  </button>
                )}
                <button
                  onClick={() => { setSelectedClient(client); setShowSheet(true) }}
                  className="p-3 bg-white/5 text-white/20 rounded-xl active:scale-90"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
              <UserPlus size={40} />
            </div>
            <p className="text-white/40 font-medium">
              {search ? t.noClientsSearch : t.noClients}
              <br />{t.startCapturing}
            </p>
            <button onClick={() => navigate('/clients/new')} className="btn-gradient px-8 py-3 text-sm">{t.addClient}</button>
          </div>
        )}
      </div>

      {/* Client Actions Sheet */}
      <BottomSheet open={showSheet} onClose={() => setShowSheet(false)} title={selectedClient?.full_name}>
        <div className="space-y-3">
          {selectedClient?.phone && (
            <>
              <button onClick={() => handleCall(selectedClient.phone)} className="w-full flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <Phone size={20} className="text-blue-400" />
                <span className="text-white text-sm font-medium">{t.call}</span>
              </button>
              <button onClick={() => handleWhatsApp(selectedClient.phone)} className="w-full flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <MessageSquare size={20} className="text-green-400" />
                <span className="text-white text-sm font-medium">{t.whatsapp}</span>
              </button>
            </>
          )}
          <button onClick={() => handleDelete(selectedClient?.id)} className="w-full flex items-center space-x-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mt-4">
            <Trash2 size={20} className="text-red-400" />
            <span className="text-red-400 text-sm font-medium">{t.deleteClient}</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
