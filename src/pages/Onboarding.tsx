import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'

const slides = [
  {
    title: 'Gestión Exclusiva',
    description: 'Organiza tus propiedades y clientes con una interfaz diseñada para la excelencia.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    color: '#6C63FF'
  },
    {
      title: 'Pipeline de Ventas',
      description: 'Visualiza el progreso de cada trato y nunca pierdas un seguimiento importante.',
      image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
      color: '#D4AF37'
    },
    {
      title: 'Perfil Público Premium',
      description: 'Comparte tu catálogo con estilo y atrae a los mejores clientes del mercado.',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
      color: '#F0EEF8'
    }
  ]

  export const Onboarding = () => {
    const [current, setCurrent] = useState(0)
    const navigate = useNavigate()

    const next = () => {
      if (current === slides.length - 1) {
        navigate('/login')
      } else {
        setCurrent(current + 1)
      }
    }

    return (
      <div className="fixed inset-0 bg-brand-bg flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: "anticipate" }}
            className="flex-1 flex flex-col"
          >
            <div className="h-[55%] relative overflow-hidden">
              <img 
                src={slides[current].image} 
                alt={slides[current].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-brand-bg via-brand-bg/60 to-transparent" />
            </div>

            <div className="flex-1 px-8 flex flex-col justify-start pt-6 z-10">
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                {slides[current].title}
              </h2>
              <p className="text-white/60 text-lg leading-relaxed">
                {slides[current].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

      <div className="p-8 flex items-center justify-between">
        <div className="flex space-x-2">
          {slides.map((_, i) => (
            <div 
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-brand-primary' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>

        <button 
          onClick={next}
          className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center text-white shadow-xl shadow-brand-primary/30 active:scale-90 transition-transform"
        >
          {current === slides.length - 1 ? <Check size={28} /> : <ArrowRight size={28} />}
        </button>
      </div>
    </div>
  )
}
