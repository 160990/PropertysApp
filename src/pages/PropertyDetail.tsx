import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, MapPin, Bed, Bath, Maximize, Edit2, Share2, MessageSquare, Copy } from 'lucide-react'
import { usePropertyStore } from '../stores/propertyStore'
import { useUIStore } from '../stores/uiStore'
import { formatCurrency, cn } from '../lib/utils'
import { shareOrCopy } from '../lib/share'
import { useT } from '../stores/prefsStore'

const SWIPE_CONFIDENCE_THRESHOLD = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export const PropertyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const t = useT()
  const { properties } = usePropertyStore()
  const { toast } = useUIStore()
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const property = properties.find(p => p.id === id)

  useEffect(() => {
    if (!property && properties.length > 0) {
      navigate('/properties')
    }
  }, [property, properties, navigate])

  if (!property) return null

  const photos = property.pa_property_photos || []
  const hasPhotos = photos.length > 0

  const paginate = (newDirection: number) => {
    let newIndex = currentImageIndex + newDirection
    if (newIndex < 0) newIndex = photos.length - 1
    if (newIndex >= photos.length) newIndex = 0
    setCurrentImageIndex(newIndex)
  }

  const shareUrl = `${window.location.origin}/profile/me?property=${property.id}`

  const handleCopyLink = async () => {
    try {
      const result = await shareOrCopy(property.title, property.description || '', shareUrl)
      if (result === 'copied' || result === 'shared') {
        toast('Enlace copiado al portapapeles', 'success')
      } else {
        toast('Error al copiar el enlace', 'error')
      }
    } catch (e) {
      toast('Error al copiar el enlace', 'error')
    }
  }

  const handleWhatsAppShare = () => {
    const text = `¡Mira esta propiedad! ${property.title} - ${formatCurrency(property.price)} ${shareUrl}`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col animate-slide-up pb-24">
      {/* Galería de imágenes (Limpia) */}
      <div className="relative h-[50vh] w-full bg-black overflow-hidden shrink-0">
        {hasPhotos ? (
          <>
            <AnimatePresence initial={false} mode="wait">
              <motion.img
                key={currentImageIndex}
                src={photos[currentImageIndex].url}
                alt={`${property.title} - ${currentImageIndex + 1}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) {
                    paginate(1);
                  } else if (swipe > SWIPE_CONFIDENCE_THRESHOLD) {
                    paginate(-1);
                  }
                }}
                className="w-full h-full object-cover touch-pan-y"
              />
            </AnimatePresence>
            
            {/* Indicadores (Único elemento en la imagen para saber que hay más fotos) */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10 pointer-events-none">
                {photos.map((_, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300 shadow-sm",
                      idx === currentImageIndex ? "w-6 bg-brand-primary" : "w-2 bg-white/40"
                    )}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <img 
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800" 
            alt="Default" 
            className="w-full h-full object-cover opacity-50"
          />
        )}
      </div>

      {/* Panel Blanco (Detalles y Controles) */}
      <div className="flex-1 bg-brand-bg px-6 pt-6 pb-12">
        
        {/* Top Bar (Botón Atrás, Badges, Botón Editar) */}
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex space-x-2">
            <span className="bg-brand-primary/20 text-brand-primary text-[10px] font-black uppercase px-3 py-1.5 rounded-full">
              {property.operation_type}
            </span>
            <span className="bg-white/5 text-white/60 text-[10px] font-black uppercase px-3 py-1.5 rounded-full">
              {property.status}
            </span>
          </div>

          <button 
            onClick={() => navigate(`/properties/${property.id}/edit`)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <Edit2 size={16} />
          </button>
        </div>

        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-4">
            <h1 className="text-3xl font-bold text-white leading-tight mb-2">{property.title}</h1>
            <p className="text-white/40 flex items-center text-sm">
              <MapPin size={16} className="mr-1" />
              {[property.neighborhood, property.district, property.province].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>

        <div className="text-4xl font-black text-brand-primary mb-6">
          {formatCurrency(property.price)}
        </div>

        {/* Botones de Compartir integrados al panel */}
        <div className="flex gap-3 mb-8">
          <button 
            onClick={handleWhatsAppShare}
            className="flex-1 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] py-3 rounded-2xl flex items-center justify-center font-bold text-sm space-x-2 active:scale-[0.98] transition-transform"
          >
            <MessageSquare size={18} />
            <span>WhatsApp</span>
          </button>
          <button 
            onClick={handleCopyLink}
            className="flex-1 bg-white/5 border border-white/10 text-white py-3 rounded-2xl flex items-center justify-center font-bold text-sm space-x-2 active:scale-[0.98] transition-transform"
          >
            <Copy size={18} />
            <span>Copiar Link</span>
          </button>
        </div>

        {/* Características principales */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <Bed size={24} className="text-white/40 mb-2" />
            <span className="text-white font-bold text-lg">{property.bedrooms}</span>
            <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Habitaciones</span>
          </div>
          <div className="glass p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <Bath size={24} className="text-white/40 mb-2" />
            <span className="text-white font-bold text-lg">{property.bathrooms}</span>
            <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Baños</span>
          </div>
          <div className="glass p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <Maximize size={24} className="text-white/40 mb-2" />
            <span className="text-white font-bold text-lg">{property.area_m2}</span>
            <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Metros²</span>
          </div>
        </div>

        {/* Descripción */}
        {property.description && (
          <div className="mb-8">
            <h3 className="text-white font-bold text-lg mb-3">Descripción</h3>
            <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
              {property.description}
            </p>
          </div>
        )}

        {/* Detalles Adicionales */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-lg mb-3">Detalles</h3>
          <div className="glass p-5 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-white/40 text-sm">Tipo de Propiedad</span>
              <span className="text-white font-bold capitalize">{property.property_type?.replace('_', ' ') || 'No especificado'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-white/40 text-sm">Visibilidad</span>
              <span className={cn("font-bold text-sm", property.is_visible ? "text-green-400" : "text-amber-400")}>
                {property.is_visible ? 'Pública' : 'Privada'}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-white/40 text-sm">Zona/Barrio</span>
              <span className="text-white font-bold text-right pl-4">{property.neighborhood || 'No especificado'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-sm">Provincia</span>
              <span className="text-white font-bold">{property.province || 'No especificado'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
