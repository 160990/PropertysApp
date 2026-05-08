import { useNavigate } from 'react-router-dom'
import { X, Shield, FileText, Lock, Eye, Trash2, Download, Phone, Mail, ExternalLink } from 'lucide-react'

export const PrivacyPage = () => {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 bg-brand-bg flex flex-col z-50">
      <header className="p-6 flex items-center space-x-4 border-b border-white/5 glass shrink-0">
        <button onClick={() => navigate(-1)} className="text-white/40 active:scale-90 transition-all"><X size={24} /></button>
        <div>
          <h1 className="text-white font-bold text-lg">Privacidad y Seguridad</h1>
          <p className="text-white/30 text-xs">Conforme a la Ley 81 de 2019 de Panamá</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8 pb-16">

          {/* Política General */}
          <section className="glass p-6 rounded-[2rem] space-y-4 border border-brand-primary/10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-white font-bold">Política de Privacidad</h2>
                <p className="text-white/30 text-xs">Última actualización: Mayo 2025</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              PropertysApp trata tus datos personales conforme a la <strong className="text-white">Ley 81 de 26 de marzo de 2019</strong> sobre Protección de Datos Personales de la República de Panamá y su reglamentación vigente.
            </p>
          </section>

          {/* Datos que recopilamos */}
          <section className="space-y-3">
            <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-2 flex items-center">
              <Eye size={14} className="mr-2" /> Datos que Recopilamos
            </h3>
            <div className="glass p-5 rounded-3xl space-y-3 text-sm text-white/60 leading-relaxed">
              <p>• <strong className="text-white">Datos de cuenta:</strong> nombre, email, teléfono, foto de perfil</p>
              <p>• <strong className="text-white">Datos profesionales:</strong> agencia, número de licencia, especializaciones</p>
              <p>• <strong className="text-white">Datos de clientes:</strong> información de contacto de tus prospectos</p>
              <p>• <strong className="text-white">Datos de propiedades:</strong> ubicación, precio, fotos</p>
              <p>• <strong className="text-white">Datos de uso:</strong> actividad en la plataforma para mejorar el servicio</p>
            </div>
          </section>

          {/* Base legal */}
          <section className="space-y-3">
            <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-2 flex items-center">
              <FileText size={14} className="mr-2" /> Base Legal (Art. 14, Ley 81/2019)
            </h3>
            <div className="glass p-5 rounded-3xl space-y-3 text-sm text-white/60 leading-relaxed">
              <p>• <strong className="text-white">Consentimiento:</strong> al registrarte, aceptas el tratamiento de tus datos</p>
              <p>• <strong className="text-white">Ejecución contractual:</strong> necesario para proveer el servicio CRM</p>
              <p>• <strong className="text-white">Interés legítimo:</strong> análisis de uso para mejorar la plataforma</p>
            </div>
          </section>

          {/* Tus derechos */}
          <section className="space-y-3">
            <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-2 flex items-center">
              <Lock size={14} className="mr-2" /> Tus Derechos (Arts. 18-22, Ley 81/2019)
            </h3>
            <div className="space-y-2">
              {[
                { title: 'Derecho de Acceso', desc: 'Solicitar copia de todos tus datos personales', icon: Eye },
                { title: 'Derecho de Rectificación', desc: 'Corregir datos inexactos desde tu perfil', icon: FileText },
                { title: 'Derecho de Supresión', desc: '"Derecho al olvido" — eliminar tu cuenta y datos', icon: Trash2 },
                { title: 'Derecho de Portabilidad', desc: 'Exportar tus datos en formato legible', icon: Download },
                { title: 'Derecho a Oponerte', desc: 'Oponerte al tratamiento para fines específicos', icon: Shield },
              ].map(({ title, desc, icon: Icon }) => (
                <div key={title} className="glass p-4 rounded-2xl flex items-center space-x-4">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{title}</p>
                    <p className="text-white/40 text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Seguridad */}
          <section className="space-y-3">
            <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-2 flex items-center">
              <Lock size={14} className="mr-2" /> Medidas de Seguridad
            </h3>
            <div className="glass p-5 rounded-3xl space-y-3 text-sm text-white/60 leading-relaxed">
              <p>• <strong className="text-white">Cifrado:</strong> todos los datos se transmiten por HTTPS/TLS 1.3</p>
              <p>• <strong className="text-white">Almacenamiento:</strong> base de datos con Row Level Security (RLS)</p>
              <p>• <strong className="text-white">Autenticación:</strong> sistema seguro con tokens JWT de corta duración</p>
              <p>• <strong className="text-white">Contraseñas:</strong> nunca se almacenan en texto plano (hash bcrypt)</p>
              <p>• <strong className="text-white">Proveedor:</strong> Supabase, certificado SOC2 Tipo 2</p>
            </div>
          </section>

          {/* Retención de datos */}
          <section className="space-y-3">
            <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-2">Retención de Datos</h3>
            <div className="glass p-5 rounded-3xl text-sm text-white/60 leading-relaxed space-y-2">
              <p>Mantenemos tus datos mientras tengas cuenta activa. Al eliminar tu cuenta, borramos todos tus datos personales en un plazo máximo de <strong className="text-white">30 días</strong>, excepto donde la ley panameña exija conservarlos por más tiempo.</p>
            </div>
          </section>

          {/* Autoridad de control */}
          <section className="glass p-5 rounded-3xl border border-amber-500/20 space-y-3">
            <h3 className="text-sm font-bold text-amber-400">Autoridad de Control en Panamá</h3>
            <p className="text-white/60 text-sm">
              Puedes presentar reclamaciones ante la <strong className="text-white">Autoridad Nacional de Transparencia y Acceso a la Información (ANTAI)</strong>.
            </p>
            <a
              href="https://www.antai.gob.pa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-brand-primary text-sm font-bold"
            >
              www.antai.gob.pa <ExternalLink size={14} className="ml-2" />
            </a>
          </section>

          {/* Contacto */}
          <section className="space-y-3">
            <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] ml-2">Ejercer tus Derechos</h3>
            <div className="glass p-5 rounded-3xl space-y-3">
              <p className="text-white/60 text-sm">Para ejercer cualquier derecho o hacer consultas sobre privacidad:</p>
              <a href="mailto:privacidad@propertysapp.pa" className="flex items-center space-x-3 text-brand-primary font-bold text-sm">
                <Mail size={18} /> <span>privacidad@propertysapp.pa</span>
              </a>
              <p className="text-white/30 text-xs">Tiempo de respuesta: máximo 15 días hábiles (Art. 21, Ley 81/2019)</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
