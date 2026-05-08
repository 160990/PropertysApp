import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Bell, Moon, Sun, Globe, Shield, LogOut, ChevronRight,
  Camera, Award, Briefcase, Share2, Phone, Link2, Globe2,
  Loader2, Check, Edit3, BellOff
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'
import { usePrefsStore, useT } from '../stores/prefsStore'
import { cn } from '../lib/utils'
import { supabase } from '../lib/supabase'
import { shareOrCopy } from '../lib/share'
import { BottomSheet } from '../components/ui/BottomSheet'

const SettingItem = ({ icon: Icon, label, value, onClick, danger, badge }: any) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-5 glass rounded-3xl card-hover group active:scale-[0.98] transition-all"
  >
    <div className="flex items-center space-x-4">
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
        danger ? "bg-red-500/10 text-red-500" : "bg-white/5 text-white/40 group-hover:bg-brand-primary/20 group-hover:text-brand-primary"
      )}>
        <Icon size={20} />
      </div>
      <div className="text-left">
        <p className={cn("text-sm font-bold", danger ? "text-red-500" : "text-white")}>{label}</p>
        {value && <p className="text-[10px] text-white/30 font-medium mt-0.5">{value}</p>}
      </div>
    </div>
    <div className="flex items-center space-x-2">
      {badge && <span className="bg-brand-primary/20 text-brand-primary text-[9px] font-black uppercase px-2 py-0.5 rounded-full">{badge}</span>}
      <ChevronRight size={18} className="text-white/10" />
    </div>
  </button>
)

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={cn(
      "w-14 h-8 rounded-full transition-all duration-300 relative shrink-0 border-2",
      value ? "bg-brand-primary border-brand-primary" : "bg-white/10 border-white/20"
    )}
  >
    <div className={cn(
      "w-5 h-5 bg-white rounded-full absolute top-[3px] transition-all duration-300 shadow-sm",
      value ? "right-[3px]" : "left-[3px]"
    )} />
  </button>
)

export const Settings = () => {
  const { profile, signOut, setProfile } = useAuthStore()
  const { toast } = useUIStore()
  const t = useT()
  const {
    theme, lang, notifPush, notifEmail, notifWhatsapp,
    setTheme, setLang, setNotifPush, setNotifEmail, setNotifWhatsapp
  } = usePrefsStore()

  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showSocialSheet, setShowSocialSheet] = useState(false)
  const [showNotifSheet, setShowNotifSheet] = useState(false)
  const [showLangSheet, setShowLangSheet] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [editData, setEditData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    agency_name: profile?.agency_name || '',
    license_number: profile?.license_number || '',
    username: profile?.username || '',
  })

  const [socialData, setSocialData] = useState({
    social_instagram: profile?.social_instagram || '',
    social_facebook: profile?.social_facebook || '',
    social_linkedin: profile?.social_linkedin || '',
  })

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleShareProfile = async () => {
    const handle = profile?.username || profile?.id
    const url = `${window.location.origin}/profile/${handle}`
    const result = await shareOrCopy('Mi Perfil PropertysApp', 'Visita mi perfil de propiedades', url)
    if (result === 'copied') toast('Enlace de perfil copiado ✓', 'success')
    else if (result === 'error') toast('No se pudo compartir', 'error')
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${profile.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage.from('property-photos').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('property-photos').getPublicUrl(path)
      await supabase.from('pa_profiles').update({ avatar_url: data.publicUrl }).eq('id', profile.id)
      setProfile({ ...profile, avatar_url: data.publicUrl })
      toast('Foto actualizada ✓', 'success')
    } catch (err: any) {
      toast(err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const { error } = await supabase.from('pa_profiles').update({
        ...editData,
        username: editData.username || null,
        updated_at: new Date().toISOString(),
      }).eq('id', profile.id)
      if (error) throw error
      setProfile({ ...profile, ...editData })
      toast('Perfil actualizado ✓', 'success')
      setShowEditSheet(false)
    } catch (err: any) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSocial = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const { error } = await supabase.from('pa_profiles').update(socialData).eq('id', profile.id)
      if (error) throw error
      setProfile({ ...profile, ...socialData })
      toast('Redes actualizadas ✓', 'success')
      setShowSocialSheet(false)
    } catch (err: any) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleTheme = (isDark: boolean) => {
    const newTheme = isDark ? 'dark' : 'light'
    setTheme(newTheme)
    toast(isDark ? '🌙 Modo oscuro activado' : '☀️ Modo claro activado', 'success')
  }

  const handleSetLang = (newLang: 'es' | 'en') => {
    setLang(newLang)
    toast(newLang === 'es' ? '🇵🇦 Español activado' : '🇺🇸 English activated', 'success')
    setShowLangSheet(false)
  }

  return (
    <div className="p-6 pt-12 space-y-8 animate-slide-up pb-24">
      {/* Avatar */}
      <header className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-28 h-28 rounded-[2rem] overflow-hidden glass p-1 mx-auto relative">
            <img
              src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'A')}&background=6C63FF&color=fff&size=200`}
              alt="Profile"
              className="w-full h-full object-cover rounded-[1.8rem]"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-[1.8rem]">
                <Loader2 className="animate-spin text-white" size={24} />
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-primary rounded-2xl flex items-center justify-center text-white border-4 border-brand-bg active:scale-90 transition-all"
          >
            <Camera size={18} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{profile?.full_name || 'Agente'}</h1>
          <p className="text-brand-primary text-sm font-bold">{profile?.agency_name || 'Agencia Independiente'}</p>
          {profile?.username && <p className="text-white/20 text-xs mt-1">@{profile.username}</p>}
        </div>
        <div className="flex justify-center space-x-3">
          <button onClick={handleShareProfile} className="btn-gradient px-6 py-2 text-xs flex items-center active:scale-95 transition-all">
            <Share2 size={14} className="mr-2" />
            {lang === 'en' ? 'Share Profile' : 'Compartir Perfil'}
          </button>
          <button onClick={() => setShowEditSheet(true)} className="glass px-6 py-2 text-xs text-white/60 flex items-center rounded-2xl border border-white/10 active:scale-95 transition-all">
            <Edit3 size={14} className="mr-2" />
            {lang === 'en' ? 'Edit' : 'Editar'}
          </button>
        </div>
      </header>

      {/* Cuenta */}
      <section className="space-y-3">
        <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.3em] ml-4">
          {lang === 'en' ? 'Account' : 'Cuenta'}
        </h3>
        <SettingItem icon={User} label={lang === 'en' ? 'Personal Info' : 'Información Personal'} value={profile?.bio ? profile.bio.substring(0, 40) + '…' : (lang === 'en' ? 'Add bio and data' : 'Agregar bio y datos')} onClick={() => setShowEditSheet(true)} />
        <SettingItem icon={Briefcase} label={lang === 'en' ? 'Agency Details' : 'Datos de Agencia'} value={profile?.license_number ? `Lic. ${profile.license_number}` : (lang === 'en' ? 'No license registered' : 'Sin licencia registrada')} onClick={() => setShowEditSheet(true)} />
        <SettingItem icon={Link2} label={lang === 'en' ? 'Social Media' : 'Redes Sociales'} value={profile?.social_instagram || (lang === 'en' ? 'Connect Instagram, Facebook...' : 'Conectar Instagram, Facebook...')} onClick={() => setShowSocialSheet(true)} />
      </section>

      {/* Preferencias */}
      <section className="space-y-3">
        <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.3em] ml-4">
          {lang === 'en' ? 'Preferences' : 'Preferencias'}
        </h3>

        {/* Notificaciones */}
        <SettingItem
          icon={notifPush ? Bell : BellOff}
          label={t.notifications}
          value={`Push ${notifPush ? (lang === 'en' ? 'on' : 'activo') : (lang === 'en' ? 'off' : 'desactivado')} · WhatsApp ${notifWhatsapp ? (lang === 'en' ? 'yes' : 'sí') : 'no'}`}
          onClick={() => setShowNotifSheet(true)}
        />

        {/* Tema — Toggle real */}
        <div className="w-full flex items-center justify-between p-5 glass rounded-3xl">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center">
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">{t.theme}</p>
              <p className="text-[10px] text-white/30">
                {theme === 'dark' ? t.darkMode : t.lightMode}
              </p>
            </div>
          </div>
          <Toggle value={theme === 'dark'} onChange={handleToggleTheme} />
        </div>

        {/* Idioma */}
        <SettingItem
          icon={Globe}
          label={t.language}
          value={lang === 'es' ? '🇵🇦 Español (Panamá)' : '🇺🇸 English (US)'}
          onClick={() => setShowLangSheet(true)}
        />
      </section>

      {/* Seguridad */}
      <section className="space-y-3">
        <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.3em] ml-4">
          {lang === 'en' ? 'Security & Legal' : 'Seguridad y Legal'}
        </h3>
        <SettingItem icon={Shield} label={t.privacy} value={lang === 'en' ? 'Law 81 of 2019 · Panama' : 'Ley 81 de 2019 · Panamá'} onClick={() => navigate('/privacy')} />
        <SettingItem icon={LogOut} label={t.signOut} onClick={handleSignOut} danger />
      </section>

      <div className="text-center pt-4">
        <p className="text-[10px] text-white/10 uppercase font-black tracking-widest">PropertysApp v1.0.0 · Premium</p>
      </div>

      {/* === Edit Profile Sheet === */}
      <BottomSheet open={showEditSheet} onClose={() => setShowEditSheet(false)} title={lang === 'en' ? 'Edit Profile' : 'Editar Perfil'}>
        <div className="space-y-4 pb-4">
          {[
            { field: 'full_name', label: lang === 'en' ? 'Full Name' : 'Nombre Completo', placeholder: lang === 'en' ? 'Your name' : 'Tu nombre', icon: User },
            { field: 'phone', label: lang === 'en' ? 'Phone' : 'Teléfono', placeholder: '+507 6XXX-XXXX', icon: Phone },
            { field: 'agency_name', label: lang === 'en' ? 'Agency' : 'Agencia', placeholder: lang === 'en' ? 'Agency name' : 'Nombre de agencia', icon: Briefcase },
            { field: 'license_number', label: lang === 'en' ? 'License No.' : 'N° de Licencia', placeholder: 'PN-XXXX', icon: Award },
            { field: 'username', label: lang === 'en' ? 'Public Username' : 'Username (perfil público)', placeholder: 'miperfil', icon: User },
          ].map(({ field, label, placeholder, icon: Icon }) => (
            <div key={field} className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-white/30 ml-4">{label}</label>
              <div className="relative">
                <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input
                  type="text"
                  value={(editData as any)[field]}
                  onChange={e => setEditData({ ...editData, [field]: e.target.value })}
                  placeholder={placeholder}
                  className="input-field pl-14"
                />
              </div>
            </div>
          ))}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-white/30 ml-4">Bio</label>
            <textarea
              value={editData.bio}
              onChange={e => setEditData({ ...editData, bio: e.target.value })}
              placeholder={lang === 'en' ? 'Tell your clients about yourself...' : 'Cuéntale a tus clientes sobre ti...'}
              rows={3}
              className="input-field resize-none"
            />
          </div>
          <button onClick={handleSaveProfile} disabled={saving} className="w-full btn-gradient py-4 flex items-center justify-center active:scale-95 transition-all">
            {saving ? <Loader2 className="animate-spin" size={20} /> : <><Check size={18} className="mr-2" /> {t.saveChanges}</>}
          </button>
        </div>
      </BottomSheet>

      {/* === Social Sheet === */}
      <BottomSheet open={showSocialSheet} onClose={() => setShowSocialSheet(false)} title={lang === 'en' ? 'Social Media' : 'Redes Sociales'}>
        <div className="space-y-4 pb-4">
          {[
            { field: 'social_instagram', label: 'Instagram', placeholder: '@tuusuario', icon: Link2 },
            { field: 'social_facebook', label: 'Facebook', placeholder: 'facebook.com/tu-página', icon: Globe2 },
            { field: 'social_linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/tu-perfil', icon: Globe2 },
          ].map(({ field, label, placeholder, icon: Icon }) => (
            <div key={field} className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-white/30 ml-4">{label}</label>
              <div className="relative">
                <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input
                  type="text"
                  value={(socialData as any)[field]}
                  onChange={e => setSocialData({ ...socialData, [field]: e.target.value })}
                  placeholder={placeholder}
                  className="input-field pl-14"
                />
              </div>
            </div>
          ))}
          <button onClick={handleSaveSocial} disabled={saving} className="w-full btn-gradient py-4 flex items-center justify-center active:scale-95 transition-all">
            {saving ? <Loader2 className="animate-spin" size={20} /> : <><Check size={18} className="mr-2" /> {t.saveChanges}</>}
          </button>
        </div>
      </BottomSheet>

      {/* === Notifications Sheet === */}
      <BottomSheet open={showNotifSheet} onClose={() => setShowNotifSheet(false)} title={t.notifications}>
        <div className="space-y-4 pb-4">
          <p className="text-white/40 text-xs px-2">
            {lang === 'en'
              ? 'Configure what notifications you want to receive.'
              : 'Configura qué notificaciones deseas recibir.'}
          </p>
          {[
            {
              label: t.pushNotif,
              desc: lang === 'en' ? 'Tasks and reminders on this device' : 'Tareas y recordatorios en este dispositivo',
              value: notifPush,
              onChange: (v: boolean) => {
                setNotifPush(v)
                if (v && 'Notification' in window) {
                  Notification.requestPermission().then(perm => {
                    if (perm === 'granted') toast('✓ Notificaciones Push activadas', 'success')
                    else if (perm === 'denied') toast('Permiso denegado en el navegador', 'error')
                  })
                } else if (!v) {
                  toast('Notificaciones Push desactivadas', 'info')
                }
              }
            },
            {
              label: t.whatsappNotif,
              desc: lang === 'en' ? 'Alert when a task expires' : 'Alerta cuando vence una tarea',
              value: notifWhatsapp,
              onChange: (v: boolean) => { setNotifWhatsapp(v); toast(v ? '✓ Alertas WhatsApp activadas' : 'Alertas WhatsApp desactivadas', 'success') }
            },
            {
              label: t.emailNotif,
              desc: lang === 'en' ? 'Weekly activity summary by email' : 'Resumen semanal de actividad por email',
              value: notifEmail,
              onChange: (v: boolean) => { setNotifEmail(v); toast(v ? '✓ Resumen por email activado' : 'Resumen por email desactivado', 'success') }
            },
          ].map(({ label, desc, value, onChange }) => (
            <div key={label} className="flex items-center justify-between p-5 glass rounded-2xl">
              <div className="flex-1 pr-4">
                <p className="text-white font-bold text-sm">{label}</p>
                <p className="text-white/30 text-xs mt-0.5">{desc}</p>
              </div>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* === Language Sheet === */}
      <BottomSheet open={showLangSheet} onClose={() => setShowLangSheet(false)} title={t.language}>
        <div className="space-y-3 pb-4">
          {[
            { id: 'es' as const, label: 'Español', region: 'Panamá / Latinoamérica', flag: '🇵🇦' },
            { id: 'en' as const, label: 'English', region: 'United States', flag: '🇺🇸' },
          ].map(({ id, label, region, flag }) => (
            <button
              key={id}
              onClick={() => handleSetLang(id)}
              className={cn(
                "w-full flex items-center space-x-4 p-5 rounded-2xl border transition-all active:scale-[0.98]",
                lang === id ? "bg-brand-primary/10 border-brand-primary" : "bg-white/5 border-white/5"
              )}
            >
              <span className="text-2xl">{flag}</span>
              <div className="text-left flex-1">
                <p className="text-white font-bold text-sm">{label}</p>
                <p className="text-white/30 text-xs">{region}</p>
              </div>
              {lang === id && <Check size={20} className="text-brand-primary" />}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  )
}
