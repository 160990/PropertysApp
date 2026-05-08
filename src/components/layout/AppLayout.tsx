import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Plus } from 'lucide-react'
import { FABSheet } from '../ui/BottomSheet'
import { Toast } from '../ui/Toast'
import { useUIStore } from '../../stores/uiStore'

export const AppLayout = () => {
  const { setShowFABSheet } = useUIStore()

  return (
    <div className="min-h-screen bg-brand-bg pb-24">
      <main>
        <Outlet />
      </main>

      <button
        className="fixed bottom-24 right-6 w-14 h-14 btn-gradient rounded-2xl flex items-center justify-center shadow-2xl z-40 active:scale-90 transition-transform"
        onClick={() => setShowFABSheet(true)}
      >
        <Plus size={28} />
      </button>

      <FABSheet />
      <Toast />
      <BottomNav />
    </div>
  )
}
