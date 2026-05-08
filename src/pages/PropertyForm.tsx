import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, X, Camera, Image as ImageIcon,
  MapPin, Check, Save, Building2, Home, Store, TreePine,
  Building, Warehouse, Landmark, Loader2, Eye, EyeOff, Tag, FileText
} from 'lucide-react'
import { cn } from '../lib/utils'
import { usePropertyStore } from '../stores/propertyStore'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'
import { supabase } from '../lib/supabase'
import { compressImage } from '../lib/images'

const steps = ['Información', 'Detalles', 'Ubicación', 'Fotos', 'Finalizar']

const propertyTypes = [
  { id: 'apartamento', label: 'Apartamento', icon: Building2 },
  { id: 'casa', label: 'Casa', icon: Home },
  { id: 'local_comercial', label: 'Local', icon: Store },
  { id: 'terreno', label: 'Terreno', icon: TreePine },
  { id: 'oficina', label: 'Oficina', icon: Building },
  { id: 'ph', label: 'PH', icon: Warehouse },
  { id: 'finca', label: 'Finca', icon: Landmark },
]

const amenitiesList = [
  'Piscina', 'Gimnasio', 'Seguridad 24/7', 'Balcón', 'Terraza', 'Amueblado',
  'Vista al mar', 'Vista a la ciudad', 'Pet-friendly', 'Ascensor', 'BBQ', 'A/C',
  'Generador', 'Cuarto de servicio', 'Bodega', 'Jacuzzi'
]

const provinces = ['Panamá', 'Panamá Oeste', 'Colón', 'Chiriquí', 'Coclé', 'Herrera', 'Los Santos', 'Veraguas', 'Bocas del Toro', 'Darién']

export const PropertyForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addProperty, updateProperty, properties, fetchProperties } = usePropertyStore()
  const { user } = useAuthStore()
  const { toast } = useUIStore()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoURLs, setPhotoURLs] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    property_type: 'apartamento',
    operation_type: 'venta',
    status: 'disponible',
    price: '',
    area_m2: '',
    bedrooms: 0,
    bathrooms: 0,
    half_bathrooms: 0,
    parking_spots: 0,
    building_floors: '',
    unit_floor: '',
    amenities: [] as string[],
    province: 'Panamá',
    district: '',
    corregimiento: '',
    neighborhood: '',
    full_address: '',
    public_description: '',
    internal_notes: '',
    is_visible: true,
    tags: '',
    video_url: '',
  })

  useEffect(() => {
    if (id) {
      fetchProperties().then(() => {
        const existing = usePropertyStore.getState().properties.find(p => p.id === id)
        if (existing) {
          setFormData({
            ...existing,
            price: existing.price?.toString() || '',
            area_m2: existing.area_m2?.toString() || '',
            building_floors: existing.building_floors?.toString() || '',
            unit_floor: existing.unit_floor?.toString() || '',
            tags: existing.tags?.join(', ') || '',
            amenities: existing.amenities || [],
          })
        }
      })
    }
  }, [id])

  const nextStep = () => setStep(s => Math.min(s + 1, steps.length))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleToggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setPhotos(prev => [...prev, ...newFiles])
      newFiles.forEach(file => {
        setPhotoURLs(prev => [...prev, URL.createObjectURL(file)])
      })
    }
  }

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
    setPhotoURLs(prev => prev.filter((_, i) => i !== idx))
  }

  const uploadPhotos = async (propertyId: string) => {
    for (let i = 0; i < photos.length; i++) {
      const compressed = await compressImage(photos[i])
      const ext = photos[i].name.split('.').pop()
      const path = `properties/${user?.id}/${propertyId}/${Date.now()}_${i}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('property-photos')
        .upload(path, compressed)

      if (uploadError) {
        console.error('Error subiendo foto:', uploadError)
        continue
      }

      const { data: urlData } = supabase.storage.from('property-photos').getPublicUrl(path)

      await supabase.from('pa_property_photos').insert({
        property_id: propertyId,
        url: urlData.publicUrl,
        storage_path: path,
        is_cover: i === 0,
        sort_order: i,
      })
    }
  }

  const handleSubmit = async (isDraft = false) => {
    setLoading(true)
    try {
      const payload = {
        user_id: user?.id,
        title: formData.title,
        property_type: formData.property_type,
        operation_type: formData.operation_type,
        status: isDraft ? 'borrador' : formData.status,
        price: formData.price ? parseFloat(formData.price) : null,
        area_m2: formData.area_m2 ? parseFloat(formData.area_m2) : null,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        half_bathrooms: formData.half_bathrooms,
        parking_spots: formData.parking_spots,
        building_floors: formData.building_floors ? parseInt(formData.building_floors) : null,
        unit_floor: formData.unit_floor ? parseInt(formData.unit_floor) : null,
        amenities: formData.amenities,
        province: formData.province,
        district: formData.district,
        corregimiento: formData.corregimiento,
        neighborhood: formData.neighborhood,
        full_address: formData.full_address,
        public_description: formData.public_description,
        internal_notes: formData.internal_notes,
        is_visible: formData.is_visible,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        video_url: formData.video_url,
        is_draft: isDraft,
      }

      let propertyId: string
      if (id) {
        await updateProperty(id, payload)
        propertyId = id
      } else {
        const result = await addProperty(payload)
        propertyId = result.id
      }

      if (photos.length > 0) {
        await uploadPhotos(propertyId)
      }

      // Registrar actividad
      await supabase.from('pa_activities').insert({
        user_id: user?.id,
        activity_type: id ? 'property_updated' : 'property_added',
        entity_type: 'property',
        entity_id: propertyId,
        description: id ? `Propiedad "${formData.title}" actualizada` : `Nueva propiedad "${formData.title}" agregada`,
      })

      toast(isDraft ? 'Borrador guardado' : (id ? 'Propiedad actualizada' : 'Propiedad publicada'), 'success')
      navigate('/properties')
    } catch (error: any) {
      toast(error.message || 'Error al guardar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const update = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }))

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col pb-24">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/5 glass sticky top-0 z-50">
        <button onClick={() => navigate('/properties')} className="text-white/40"><X size={24} /></button>
        <div className="flex-1 px-6">
          <div className="flex gap-1 mb-2">
            {steps.map((_, i) => (
              <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", i + 1 <= step ? "bg-brand-primary" : "bg-white/10")} />
            ))}
          </div>
          <p className="text-[10px] text-center uppercase tracking-[0.2em] font-bold text-white/40">
            Paso {step}/{steps.length}: <span className="text-brand-primary">{steps[step - 1]}</span>
          </p>
        </div>
      </header>

      {/* Form Content */}
      <div className="flex-1 p-6">
        <AnimatePresence mode="wait">
          {/* PASO 1: Información Básica */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Título de la Propiedad</label>
                <input type="text" value={formData.title} onChange={e => update('title', e.target.value)} placeholder="Ej: Penthouse con vista al mar" className="input-field" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Tipo de Propiedad</label>
                <div className="grid grid-cols-4 gap-3">
                  {propertyTypes.map(type => (
                    <button key={type.id} onClick={() => update('property_type', type.id)}
                      className={cn("flex flex-col items-center justify-center p-3 rounded-2xl border transition-all aspect-square",
                        formData.property_type === type.id ? "bg-brand-primary/10 border-brand-primary text-brand-primary" : "bg-white/5 border-white/10 text-white/40"
                      )}>
                      <type.icon size={24} />
                      <span className="text-[9px] mt-2 font-bold uppercase">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Operación</label>
                <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                  {['venta', 'alquiler', 'ambos'].map(op => (
                    <button key={op} onClick={() => update('operation_type', op)}
                      className={cn("flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                        formData.operation_type === op ? "bg-brand-primary text-white shadow-lg" : "text-white/40"
                      )}>{op}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Estado</label>
                <div className="flex flex-wrap gap-2">
                  {['disponible', 'reservada', 'vendida', 'en_construccion'].map(s => (
                    <button key={s} onClick={() => update('status', s)}
                      className={cn("px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all",
                        formData.status === s ? "bg-brand-primary border-brand-primary text-white" : "bg-white/5 border-white/10 text-white/40"
                      )}>{s.replace('_', ' ')}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* PASO 2: Detalles */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Precio (USD)</label>
                  <input type="number" value={formData.price} onChange={e => update('price', e.target.value)} placeholder="0.00" className="input-field" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Área (m²)</label>
                  <input type="number" value={formData.area_m2} onChange={e => update('area_m2', e.target.value)} placeholder="0" className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[{ id: 'bedrooms', label: 'Habitaciones' }, { id: 'bathrooms', label: 'Baños' }, { id: 'parking_spots', label: 'Parking' }, { id: 'half_bathrooms', label: 'Medio Baños' }].map(feat => (
                  <div key={feat.id} className="glass p-4 rounded-2xl flex items-center justify-between">
                    <span className="text-xs text-white font-medium">{feat.label}</span>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => update(feat.id, Math.max(0, (formData as any)[feat.id] - 1))} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 active:scale-90">-</button>
                      <span className="text-white font-bold w-4 text-center">{(formData as any)[feat.id]}</span>
                      <button onClick={() => update(feat.id, (formData as any)[feat.id] + 1)} className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white active:scale-90">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Amenidades</label>
                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map(am => (
                    <button key={am} onClick={() => handleToggleAmenity(am)}
                      className={cn("px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all",
                        formData.amenities.includes(am) ? "bg-brand-primary border-brand-primary text-white" : "bg-white/5 border-white/10 text-white/40"
                      )}>{am}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* PASO 3: Ubicación */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Provincia</label>
                <select value={formData.province} onChange={e => update('province', e.target.value)} className="input-field appearance-none">
                  {provinces.map(p => <option key={p} value={p} className="bg-brand-bg">{p}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Distrito</label>
                  <input type="text" value={formData.district} onChange={e => update('district', e.target.value)} placeholder="Ej: Panamá" className="input-field" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Corregimiento</label>
                  <input type="text" value={formData.corregimiento} onChange={e => update('corregimiento', e.target.value)} placeholder="Ej: San Francisco" className="input-field" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Barrio / Urbanización</label>
                <input type="text" value={formData.neighborhood} onChange={e => update('neighborhood', e.target.value)} placeholder="Ej: Costa del Este" className="input-field" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Dirección Completa</label>
                <input type="text" value={formData.full_address} onChange={e => update('full_address', e.target.value)} placeholder="Calle, edificio, piso..." className="input-field" />
              </div>
            </motion.div>
          )}

          {/* PASO 4: Fotos */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex gap-4">
                <label className="flex-1 glass p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer card-hover border-2 border-dashed border-white/10">
                  <Camera size={32} className="text-brand-primary mb-2" />
                  <span className="text-xs font-bold text-white/40 uppercase">Tomar Foto</span>
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelect} />
                </label>
                <label className="flex-1 glass p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer card-hover border-2 border-dashed border-white/10">
                  <ImageIcon size={32} className="text-brand-accent mb-2" />
                  <span className="text-xs font-bold text-white/40 uppercase">Galería</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
                </label>
              </div>

              <p className="text-center text-white/30 text-xs">{photoURLs.length} / 20 fotos</p>

              {photoURLs.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {photoURLs.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                      <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && (
                        <div className="absolute top-2 left-2 bg-brand-accent text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-full">⭐ Cover</div>
                      )}
                      <button onClick={() => removePhoto(i)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Video / Tour Virtual (URL)</label>
                <input type="url" value={formData.video_url} onChange={e => update('video_url', e.target.value)} placeholder="https://youtube.com/..." className="input-field" />
              </div>
            </motion.div>
          )}

          {/* PASO 5: Finalizar */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Descripción Pública</label>
                <textarea value={formData.public_description} onChange={e => update('public_description', e.target.value)}
                  placeholder="Describe la propiedad para tus clientes..." rows={4} className="input-field resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 ml-4 flex items-center">🔒 Notas Internas</label>
                <textarea value={formData.internal_notes} onChange={e => update('internal_notes', e.target.value)}
                  placeholder="Solo visibles para ti..." rows={3} className="input-field resize-none border-amber-500/20" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 ml-4">Etiquetas (separadas por coma)</label>
                <input type="text" value={formData.tags} onChange={e => update('tags', e.target.value)} placeholder="oportunidad, negociable, banco" className="input-field" />
              </div>
              <div className="glass p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-sm">{formData.is_visible ? '👁 Visible en perfil público' : '🔒 Solo uso interno'}</p>
                  <p className="text-white/30 text-xs">Tus clientes podrán ver esta propiedad</p>
                </div>
                <button onClick={() => update('is_visible', !formData.is_visible)}
                  className={cn("w-14 h-8 rounded-full transition-all relative", formData.is_visible ? "bg-brand-primary" : "bg-white/10")}>
                  <div className={cn("w-6 h-6 bg-white rounded-full absolute top-1 transition-all", formData.is_visible ? "right-1" : "left-1")} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer integrado en el scroll */}
      <footer className="p-6 mt-4 flex space-x-4">
        {step > 1 && (
          <button onClick={prevStep} className="flex-1 bg-white/5 text-white/60 py-4 rounded-2xl font-bold text-sm flex items-center justify-center active:scale-95 transition-all">
            <ChevronLeft size={20} className="mr-1" /> Atrás
          </button>
        )}
        {step < steps.length ? (
          <button onClick={nextStep} className="flex-[2] btn-gradient py-4 flex items-center justify-center">
            Siguiente <ChevronRight size={20} className="ml-1" />
          </button>
        ) : (
          <div className="flex-[2] flex gap-3">
            <button onClick={() => handleSubmit(true)} disabled={loading} className="flex-1 bg-white/5 text-white/60 py-4 rounded-2xl font-bold text-xs flex items-center justify-center">
              <Save size={16} className="mr-1" /> Borrador
            </button>
            <button onClick={() => handleSubmit(false)} disabled={loading} className="flex-[2] btn-gradient py-4 flex items-center justify-center">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Check size={18} className="mr-1" /> Publicar</>}
            </button>
          </div>
        )}
      </footer>
    </div>
  )
}
