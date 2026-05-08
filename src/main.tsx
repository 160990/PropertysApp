import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { usePrefsStore } from './stores/prefsStore'

// Aplicar preferencias guardadas antes de renderizar (evita flash de tema incorrecto)
const prefs = usePrefsStore.getState()
if (prefs.theme === 'light') {
  document.documentElement.classList.add('light-mode')
}
document.documentElement.setAttribute('lang', prefs.lang)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
