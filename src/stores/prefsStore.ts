import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light'
export type Lang = 'es' | 'en'

interface PrefsState {
  theme: Theme
  lang: Lang
  notifPush: boolean
  notifEmail: boolean
  notifWhatsapp: boolean
  setTheme: (theme: Theme) => void
  setLang: (lang: Lang) => void
  setNotifPush: (v: boolean) => void
  setNotifEmail: (v: boolean) => void
  setNotifWhatsapp: (v: boolean) => void
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      lang: 'es',
      notifPush: true,
      notifEmail: false,
      notifWhatsapp: true,

      setTheme: (theme) => {
        set({ theme })
        const root = document.documentElement
        if (theme === 'light') {
          root.classList.add('light-mode')
        } else {
          root.classList.remove('light-mode')
        }
      },

      setLang: (lang) => {
        set({ lang })
        document.documentElement.setAttribute('lang', lang)
      },

      setNotifPush: (v) => {
        set({ notifPush: v })
        if (v && 'Notification' in window) {
          Notification.requestPermission()
        }
      },
      setNotifEmail: (v) => set({ notifEmail: v }),
      setNotifWhatsapp: (v) => set({ notifWhatsapp: v }),
    }),
    {
      name: 'pa-prefs',
      // Al iniciar la app, aplicar el tema guardado
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'light') {
          document.documentElement.classList.add('light-mode')
        }
        if (state?.lang) {
          document.documentElement.setAttribute('lang', state.lang)
        }
      },
    }
  )
)

export const translations = {
  es: {
    dashboard: 'Inicio',
    properties: 'Propiedades',
    clients: 'Clientes',
    pipeline: 'Pipeline',
    profile: 'Perfil',
    settings: 'Configuración',
    notifications: 'Notificaciones',
    theme: 'Tema',
    language: 'Idioma',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
    saveChanges: 'Guardar Cambios',
    signOut: 'Cerrar Sesión',
    privacy: 'Privacidad y Seguridad',
    pushNotif: 'Notificaciones Push',
    emailNotif: 'Resumen por Email',
    whatsappNotif: 'Alertas por WhatsApp',
    quickAction: 'Acción Rápida',
    photoProp: 'Foto rápida de propiedad',
    photoPropDesc: 'Abre la cámara directo',
    addProp: 'Agregar propiedad',
    addPropDesc: 'Formulario completo',
    addClient: 'Agregar cliente',
    addClientDesc: 'Nuevo lead o comprador',
    addActivity: 'Registrar actividad',
    addActivityDesc: 'Nota o seguimiento',
    goodMorning: 'Buen día',
    pending: 'Pendientes',
    closed: 'Cerrados',
    todaysAgenda: 'Agenda de Hoy',
    viewAll: 'Ver todo',
    noTasksToday: 'No tienes tareas para hoy 🎉',
    addTask: 'Agregar tarea',
    recentActivity: 'Actividad Reciente',
    noRecentActivity: 'Sin actividad reciente. ¡Empieza agregando una propiedad!',
    noClient: 'Sin cliente',
    all: 'Todas',
    forSale: 'En Venta',
    forRent: 'En Alquiler',
    available: 'Disponible',
    reserved: 'Reservada',
    sold: 'Vendida',
    searchProp: 'Buscar por zona, título...',
    noProperties: 'Aún no tienes propiedades.\\n¡Agrega tu primera ahora!',
    editDetails: 'Editar Detalles',
    shareLink: 'Compartir Enlace',
    makePrivate: 'Hacer Privada',
    makePublic: 'Hacer Pública',
    deleteProp: 'Eliminar Propiedad',
    hot: 'Caliente',
    warm: 'Tibio',
    cold: 'Frío',
    searchClient: 'Buscar por nombre o teléfono...',
    noClientsSearch: 'No se encontraron resultados',
    noClients: 'No hay clientes registrados.',
    startCapturing: 'Empieza a captar leads ahora.',
    call: 'Llamar',
    whatsapp: 'WhatsApp',
    deleteClient: 'Eliminar Cliente',
    active: 'Activos',
    totalValue: 'Valor Total',
    total: 'Total',
    noDeals: 'Sin deals',
    newOpportunity: 'Nueva Oportunidad',
    existingClient: 'Cliente Existente',
    selectClient: 'Seleccionar cliente...',
    orManualName: 'O Nombre Manual',
    propOptional: 'Propiedad (opcional)',
    noPropLinked: 'Sin propiedad vinculada',
    dealValue: 'Valor del Deal (USD)',
    initialStage: 'Etapa Inicial',
    createDeal: 'Crear Deal',
    advanceStage: 'Avanzar Etapa',
    finalStage: 'Etapa final',
    deleteDeal: 'Eliminar Deal',
  },
  en: {
    dashboard: 'Home',
    properties: 'Properties',
    clients: 'Clients',
    pipeline: 'Pipeline',
    profile: 'Profile',
    settings: 'Settings',
    notifications: 'Notifications',
    theme: 'Theme',
    language: 'Language',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    saveChanges: 'Save Changes',
    signOut: 'Sign Out',
    privacy: 'Privacy & Security',
    pushNotif: 'Push Notifications',
    emailNotif: 'Email Summary',
    whatsappNotif: 'WhatsApp Alerts',
    quickAction: 'Quick Action',
    photoProp: 'Quick property photo',
    photoPropDesc: 'Opens camera directly',
    addProp: 'Add property',
    addPropDesc: 'Full form',
    addClient: 'Add client',
    addClientDesc: 'New lead or buyer',
    addActivity: 'Log activity',
    addActivityDesc: 'Note or follow-up',
    goodMorning: 'Good morning',
    pending: 'Pending',
    closed: 'Closed',
    todaysAgenda: 'Today\'s Agenda',
    viewAll: 'View all',
    noTasksToday: 'No tasks for today 🎉',
    addTask: 'Add task',
    recentActivity: 'Recent Activity',
    noRecentActivity: 'No recent activity. Start by adding a property!',
    noClient: 'No client',
    all: 'All',
    forSale: 'For Sale',
    forRent: 'For Rent',
    available: 'Available',
    reserved: 'Reserved',
    sold: 'Sold',
    searchProp: 'Search by zone, title...',
    noProperties: 'No properties yet.\\nAdd your first one now!',
    editDetails: 'Edit Details',
    shareLink: 'Share Link',
    makePrivate: 'Make Private',
    makePublic: 'Make Public',
    deleteProp: 'Delete Property',
    hot: 'Hot',
    warm: 'Warm',
    cold: 'Cold',
    searchClient: 'Search by name or phone...',
    noClientsSearch: 'No results found',
    noClients: 'No clients registered yet.',
    startCapturing: 'Start capturing leads now.',
    call: 'Call',
    whatsapp: 'WhatsApp',
    deleteClient: 'Delete Client',
    active: 'Active',
    totalValue: 'Total Value',
    total: 'Total',
    noDeals: 'No deals',
    newOpportunity: 'New Opportunity',
    existingClient: 'Existing Client',
    selectClient: 'Select client...',
    orManualName: 'Or Manual Name',
    propOptional: 'Property (optional)',
    noPropLinked: 'No property linked',
    dealValue: 'Deal Value (USD)',
    initialStage: 'Initial Stage',
    createDeal: 'Create Deal',
    advanceStage: 'Advance Stage',
    finalStage: 'Final stage',
    deleteDeal: 'Delete Deal',
  },
}

export const useT = () => {
  const lang = usePrefsStore(s => s.lang)
  return translations[lang]
}
