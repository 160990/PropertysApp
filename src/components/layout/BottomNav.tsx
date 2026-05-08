import { Home, Building2, Users, LayoutDashboard, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'

import { useT } from '../../stores/prefsStore'

export const BottomNav = () => {
  const location = useLocation()
  const t = useT()
  
  const navItems = [
    { icon: Home, label: t.dashboard, path: '/dashboard' },
    { icon: Building2, label: t.properties, path: '/properties' },
    { icon: Users, label: t.clients, path: '/clients' },
    { icon: LayoutDashboard, label: t.pipeline, path: '/pipeline' },
    { icon: User, label: t.profile, path: '/settings' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bottom-nav-blur h-20 px-4 flex items-center justify-around z-50 safe-area-bottom">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 transition-all duration-300",
              isActive ? "text-brand-primary scale-110" : "text-white/40"
            )}
          >
            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            {isActive && (
              <div className="absolute -top-1 w-1 h-1 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(108,99,255,0.8)]" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
