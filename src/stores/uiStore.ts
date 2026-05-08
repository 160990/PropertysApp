import { create } from 'zustand'

interface UIState {
  showFABSheet: boolean
  showToast: boolean
  toastMessage: string
  toastType: 'success' | 'error' | 'info'
  setShowFABSheet: (show: boolean) => void
  toast: (message: string, type?: 'success' | 'error' | 'info') => void
}

export const useUIStore = create<UIState>((set) => ({
  showFABSheet: false,
  showToast: false,
  toastMessage: '',
  toastType: 'success',
  setShowFABSheet: (show) => set({ showFABSheet: show }),
  toast: (message, type = 'success') => {
    set({ showToast: true, toastMessage: message, toastType: type })
    setTimeout(() => set({ showToast: false }), 3000)
  },
}))
