import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface PropertyState {
  properties: any[]
  loading: boolean
  fetchProperties: () => Promise<void>
  addProperty: (property: any) => Promise<any>
  updateProperty: (id: string, updates: any) => Promise<void>
  deleteProperty: (id: string) => Promise<void>
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  loading: false,
  fetchProperties: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('pa_properties')
      .select('*, pa_property_photos(*)')
      .order('created_at', { ascending: false })
    
    if (!error) set({ properties: data })
    set({ loading: false })
  },
  addProperty: async (property) => {
    const { data, error } = await supabase
      .from('pa_properties')
      .insert(property)
      .select()
      .single()
    
    if (error) throw error
    set({ properties: [data, ...get().properties] })
    return data
  },
  updateProperty: async (id, updates) => {
    const { error } = await supabase
      .from('pa_properties')
      .update(updates)
      .eq('id', id)
    
    if (error) throw error
    set({
      properties: get().properties.map(p => p.id === id ? { ...p, ...updates } : p)
    })
  },
  deleteProperty: async (id) => {
    const { error } = await supabase
      .from('pa_properties')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    set({
      properties: get().properties.filter(p => p.id !== id)
    })
  }
}))
