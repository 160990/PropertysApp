import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export const Splash = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding')
    }, 2500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="fixed inset-0 bg-brand-bg flex flex-col items-center justify-center overflow-hidden">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative"
      >
        <div className="w-24 h-24 bg-linear-to-tr from-brand-primary to-[#8A84FF] rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-brand-primary/30">
          <span className="text-white text-5xl font-bold -rotate-12">P</span>
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-brand-primary blur-3xl opacity-20 -z-10"
        />
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-8 text-center"
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">PropertysApp</h1>
        <p className="text-white/40 mt-2 text-sm uppercase tracking-[0.2em]">CRM Inmobiliario Premium</p>
      </motion.div>

      <div className="absolute bottom-12">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="w-48 h-0.5 bg-white/10 origin-left overflow-hidden"
        >
          <div className="w-full h-full bg-brand-primary" />
        </motion.div>
      </div>
    </div>
  )
}
