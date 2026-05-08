import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: any | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: any | null) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  initialize: async () => {
    if (get().initialized) return

    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user ?? null
    set({ user, initialized: true })

    if (user) {
      const { data: profile } = await supabase
        .from('pa_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      set({ profile })
    }

    set({ loading: false })

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null
      set({ user: newUser })
      
      if (newUser) {
        const { data: profile } = await supabase
          .from('pa_profiles')
          .select('*')
          .eq('id', newUser.id)
          .single()
        set({ profile })
      } else {
        set({ profile: null })
      }
    })
  },
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))
