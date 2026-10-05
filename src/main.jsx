import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener(
    'load',
    async () => {
      try {
        await navigator.serviceWorker.register(
          '/sw.js',
          {
            scope: '/',
          }
        )
      } catch (error) {
        console.error(
          'Family Connect service worker registration failed.',
          error
        )
      }
    }
  )
}
