import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Phone, MessageSquare, Mail, Globe, MapPin, Grid, List as ListIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatCurrency, cn } from '../lib/utils'

export const PublicProfile = () => {
  const { username } = useParams()
  const [profile, setProfile] = useState<any>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPublicData = async () => {
      // Buscar perfil por username
      const { data: profileData } = await supabase
        .from('pa_profiles')
        .select('*')
        .eq('username', username)
        .single()
      
      if (profileData) {
        setProfile(profileData)
        // Buscar propiedades públicas de ese agente
        const { data: props } = await supabase
          .from('pa_properties')
          .select('*, pa_property_photos(*)')
          .eq('user_id', profileData.id)
          .eq('is_visible', true)
        
        setProperties(props || [])
      }
      setLoading(false)
    }

    fetchPublicData()
  }, [username])

  if (loading) return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-white text-2xl font-bold">Perfil no encontrado</h1>
      <p className="text-white/40 mt-2">Este enlace no parece ser válido.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-bg pb-24">
      {/* Hero Header */}
      <div className="h-64 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-brand-primary/20 to-brand-bg" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-30" />
      </div>

      <div className="px-6 -mt-32 relative z-10 space-y-6">
        {/* Profile Card */}
        <div className="glass p-8 rounded-[3rem] text-center space-y-4">
          <div className="w-24 h-24 rounded-[2rem] overflow-hidden glass p-1 mx-auto -mt-16">
            <img 
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=6C63FF&color=fff`} 
              alt={profile.full_name} 
              className="w-full h-full object-cover rounded-[1.8rem]"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
            <p className="text-brand-primary font-bold">{profile.agency_name}</p>
            {profile.license_number && <p className="text-white/20 text-xs mt-1 uppercase font-black tracking-widest">Lic. {profile.license_number}</p>}
          </div>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
            {profile.bio || 'Asesor inmobiliario experto en propiedades de lujo en Panamá.'}
          </p>
          
          <div className="flex justify-center space-x-4 pt-2">
            {[
              { icon: Phone, color: 'bg-white/5' },
              { icon: MessageSquare, color: 'bg-green-500/10 text-green-500' },
              { icon: Mail, color: 'bg-white/5' },
              { icon: Globe, color: 'bg-pink-500/10 text-pink-500' },
            ].map((social, i) => (
              <button key={i} className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90", social.color)}>
                <social.icon size={20} />
              </button>
            ))}
          </div>
        </div>

        {/* Property Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold text-white">Mi Catálogo</h2>
            <div className="flex space-x-2 glass p-1 rounded-xl">
              <button className="p-2 bg-brand-primary rounded-lg text-white"><Grid size={18} /></button>
              <button className="p-2 text-white/20"><ListIcon size={18} /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {properties.map((p) => (
              <div key={p.id} className="glass overflow-hidden rounded-[2.5rem] card-hover">
                <div className="h-48 relative">
                  <img 
                    src={p.pa_property_photos?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'} 
                    alt={p.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-brand-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
                    {p.operation_type}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-white font-bold truncate">{p.title}</h3>
                  <p className="text-white/40 text-xs flex items-center mt-1">
                    <MapPin size={12} className="mr-1" /> {p.neighborhood}
                  </p>
                  <div className="mt-4 flex justify-between items-end">
                    <div className="text-brand-primary font-black text-xl">{formatCurrency(p.price)}</div>
                    <button className="bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-xl text-xs font-bold uppercase">
                      Ver Más
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Contact Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bottom-nav-blur safe-area-bottom z-50">
        <div className="flex space-x-4">
          <button className="flex-1 btn-gradient py-4 flex items-center justify-center">
            <MessageSquare size={20} className="mr-2" /> WhatsApp
          </button>
          <button className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-white">
            <Phone size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}
