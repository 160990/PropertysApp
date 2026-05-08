import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, Grid, List as ListIcon, Plus, MapPin, Share2, MoreVertical, Edit2, Building2, Trash2, Eye, EyeOff } from 'lucide-react'
import { usePropertyStore } from '../stores/propertyStore'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'
import { formatCurrency, cn } from '../lib/utils'
import { BottomSheet } from '../components/ui/BottomSheet'
import { shareOrCopy } from '../lib/share'
import { useT } from '../stores/prefsStore'

const FilterChip = ({ label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
      active
        ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20"
        : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
    )}
  >
    {label}
  </button>
)

// PropertyCard recibe toast como prop para evitar problemas de scope
const PropertyCard = ({ property, view, onMore, onShare }: any) => {
  const navigate = useNavigate()
  const coverPhoto =
    property.pa_property_photos?.find((p: any) => p.is_cover)?.url ||
    property.pa_property_photos?.[0]?.url ||
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'

  return (
    <motion.div
      layout
      onClick={() => navigate(`/properties/${property.id}`)}
      className={cn(
        "glass overflow-hidden card-hover rounded-[2rem] cursor-pointer",
        view === 'grid' ? "flex flex-col" : "flex flex-row h-40"
      )}
    >
      <div className={cn("relative", view === 'grid' ? "h-48 w-full" : "w-40 h-full shrink-0")}>
        <img src={coverPhoto} alt={property.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 bg-brand-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
          {property.status}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-white font-bold text-lg leading-tight line-clamp-1">{property.title}</h3>
            <button
              onClick={() => onMore(property)}
              className="text-white/20 p-1 -mr-1 active:scale-90 transition-transform"
            >
              <MoreVertical size={18} />
            </button>
          </div>
          <div className="flex items-center text-white/40 text-xs mt-1">
            <MapPin size={12} className="mr-1" />
            {[property.neighborhood, property.province].filter(Boolean).join(', ') || 'Ubicación no especificada'}
          </div>
        </div>

        <div className="mt-4 flex justify-between items-end">
          <div>
            <div className="text-brand-primary font-black text-xl">{formatCurrency(property.price)}</div>
            <div className="flex items-center space-x-3 text-white/40 text-[10px] mt-1 font-bold uppercase">
              {property.bedrooms > 0 && <span>{property.bedrooms} Hab</span>}
              {property.bathrooms > 0 && <span>{property.bathrooms} Bañ</span>}
              {property.area_m2 && <span>{property.area_m2} m²</span>}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onShare(property)}
              className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-brand-primary transition-colors active:scale-90"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export const Properties = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toast } = useUIStore()
  const t = useT()
  const { properties, fetchProperties, deleteProperty, updateProperty, loading } = usePropertyStore()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  
  const filters = [t.all, t.forSale, t.forRent, t.available, t.reserved, t.sold]
  const [filter, setFilter] = useState(filters[0])
  const [search, setSearch] = useState('')

  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [showSheet, setShowSheet] = useState(false)

  useEffect(() => {
    if (user) fetchProperties()
  }, [user])

  const filtered = properties.filter(p => {
    let matchesFilter = true
    if (filter === t.forSale) matchesFilter = p.operation_type === 'venta'
    if (filter === t.forRent) matchesFilter = p.operation_type === 'alquiler'
    if (filter === t.available) matchesFilter = p.status === 'disponible'
    if (filter === t.reserved) matchesFilter = p.status === 'reservada'
    if (filter === t.sold) matchesFilter = p.status === 'vendida'

    let matchesSearch = true
    if (search.trim()) {
      const q = search.toLowerCase()
      matchesSearch = 
        (p.title?.toLowerCase().includes(q)) ||
        (p.neighborhood?.toLowerCase().includes(q)) ||
        (p.district?.toLowerCase().includes(q))
    }

    return matchesFilter && matchesSearch
  })

  const handleShareProperty = async (prop: any) => {
    const url = `${window.location.origin}/property/${prop.id}`
    const result = await shareOrCopy(`Propiedad: ${prop.title}`, `Mira esta propiedad: ${prop.title}`, url)
    if (result === 'copied') toast('Enlace copiado al portapapeles', 'success')
    else if (result === 'error') toast('Error al intentar compartir', 'error')
  }

  const handleDelete = async () => {
    if (!selectedProperty) return
    try {
      await deleteProperty(selectedProperty.id)
      toast('Propiedad eliminada', 'info')
      setShowSheet(false)
    } catch (err: any) {
      toast(err.message, 'error')
    }
  }

  const toggleVisibility = async () => {
    if (!selectedProperty) return
    try {
      const newVisibility = !selectedProperty.is_visible
      await updateProperty(selectedProperty.id, { is_visible: newVisibility })
      toast(newVisibility ? 'Propiedad ahora es pública ✓' : 'Propiedad ahora es privada', 'success')
      setShowSheet(false)
    } catch (err: any) {
      toast(err.message, 'error')
    }
  }

  return (
    <div className="p-6 pt-12 space-y-6 animate-slide-up">
      <header className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">{t.properties}</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/properties/new')}
              className="p-3 glass rounded-2xl text-brand-primary active:scale-90 transition-all"
            >
              <Plus size={24} />
            </button>
            <div className="flex glass p-1 rounded-2xl">
              <button
                onClick={() => setView('grid')}
                className={cn("p-2 rounded-xl transition-all", view === 'grid' ? "bg-brand-primary text-white" : "text-white/20")}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setView('list')}
                className={cn("p-2 rounded-xl transition-all", view === 'list' ? "bg-brand-primary text-white" : "text-white/20")}
              >
                <ListIcon size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input
            type="text"
            placeholder={t.searchProp}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-14 pr-12"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-primary">
            <Filter size={20} />
          </button>
        </div>
      </header>

      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
        {filters.map((f) => (
          <FilterChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
        ))}
      </div>

      <div className={cn("grid gap-6 pb-24", view === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass h-64 rounded-[2rem] animate-pulse" />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              view={view}
              onMore={(prop: any) => { setSelectedProperty(prop); setShowSheet(true) }}
              onShare={handleShareProperty}
            />
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-4">
              <Building2 size={40} />
            </div>
            <p className="text-white/40 font-medium whitespace-pre-line">{t.noProperties}</p>
            <button onClick={() => navigate('/properties/new')} className="btn-gradient px-8 py-3 mt-4">{t.addProp}</button>
          </div>
        )}
      </div>

      <BottomSheet open={showSheet} onClose={() => setShowSheet(false)} title={selectedProperty?.title}>
        <div className="space-y-3">
          <button
            onClick={() => { setShowSheet(false); navigate(`/properties/${selectedProperty?.id}/edit`) }}
            className="w-full flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/5 active:scale-[0.98] transition-all"
          >
            <Edit2 size={20} className="text-brand-primary" />
            <span className="text-white text-sm font-medium">{t.editDetails}</span>
          </button>

          <button
            onClick={() => { setShowSheet(false); handleShareProperty(selectedProperty) }}
            className="w-full flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/5 active:scale-[0.98] transition-all"
          >
            <Share2 size={20} className="text-blue-400" />
            <span className="text-white text-sm font-medium">{t.shareLink}</span>
          </button>

          <button
            onClick={toggleVisibility}
            className="w-full flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/5 active:scale-[0.98] transition-all"
          >
            {selectedProperty?.is_visible
              ? <EyeOff size={20} className="text-amber-400" />
              : <Eye size={20} className="text-green-400" />}
            <span className="text-white text-sm font-medium">
              {selectedProperty?.is_visible ? t.makePrivate : t.makePublic}
            </span>
          </button>

          <button
            onClick={handleDelete}
            className="w-full flex items-center space-x-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 active:scale-[0.98] transition-all mt-4"
          >
            <Trash2 size={20} className="text-red-400" />
            <span className="text-red-400 text-sm font-medium">{t.deleteProp}</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
