import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface ClientState {
  clients: any[]
  loading: boolean
  fetchClients: () => Promise<void>
  addClient: (client: any) => Promise<any>
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  loading: false,
  fetchClients: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('pa_clients')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error) set({ clients: data })
    set({ loading: false })
  },
  addClient: async (client) => {
    const { data, error } = await supabase
      .from('pa_clients')
      .insert(client)
      .select()
      .single()
    
    if (error) throw error
    set({ clients: [data, ...get().clients] })
    return data
  }
}))
