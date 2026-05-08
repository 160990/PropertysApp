import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, Info } from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'

export const Toast = () => {
  const { showToast, toastMessage, toastType } = useUIStore()

  const icons = { success: CheckCircle, error: XCircle, info: Info }
  const colors = { success: 'text-green-400 bg-green-500/10 border-green-500/20', error: 'text-red-400 bg-red-500/10 border-red-500/20', info: 'text-blue-400 bg-blue-500/10 border-blue-500/20' }
  const Icon = icons[toastType]

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          className={`fixed bottom-28 left-6 right-6 z-[80] flex items-center space-x-3 px-5 py-4 rounded-2xl border backdrop-blur-xl ${colors[toastType]}`}
        >
          <Icon size={20} />
          <span className="text-sm font-medium">{toastMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
