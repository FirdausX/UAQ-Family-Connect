import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.jsx'
import OfflineBanner from './OfflineBanner.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <OfflineBanner />
  </StrictMode>,
)

// Register the service worker in production only (keeps Vite dev hot-reload clean).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
