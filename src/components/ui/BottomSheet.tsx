import { motion, AnimatePresence } from 'framer-motion'
import { X, Building2, UserPlus, ClipboardList, Camera } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../stores/uiStore'

import { useT } from '../../stores/prefsStore'

export const BottomSheet = ({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title?: string }) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 bg-brand-bg border-t border-white/10 rounded-t-[2.5rem] z-[70] max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-white/20 rounded-full" />
            </div>
            {title && (
              <div className="flex items-center justify-between px-6 pb-4">
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <button onClick={onClose} className="text-white/30 p-2"><X size={20} /></button>
              </div>
            )}
            <div className="px-6 pb-10">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export const FABSheet = () => {
  const { showFABSheet, setShowFABSheet } = useUIStore()
  const navigate = useNavigate()
  const t = useT()

  const actions = [
    { icon: Camera, label: t.photoProp, desc: t.photoPropDesc, color: 'bg-brand-primary/10 text-brand-primary', action: () => navigate('/properties/new') },
    { icon: Building2, label: t.addProp, desc: t.addPropDesc, color: 'bg-blue-500/10 text-blue-400', action: () => navigate('/properties/new') },
    { icon: UserPlus, label: t.addClient, desc: t.addClientDesc, color: 'bg-green-500/10 text-green-400', action: () => navigate('/clients/new') },
    { icon: ClipboardList, label: t.addActivity, desc: t.addActivityDesc, color: 'bg-amber-500/10 text-amber-400', action: () => navigate('/followups') },
  ]

  return (
    <BottomSheet open={showFABSheet} onClose={() => setShowFABSheet(false)} title={t.quickAction}>
      <div className="space-y-3">
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={() => { setShowFABSheet(false); a.action() }}
            className="w-full flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/5 active:scale-[0.98] transition-all"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${a.color}`}>
              <a.icon size={22} />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-sm">{a.label}</p>
              <p className="text-white/30 text-xs">{a.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}
