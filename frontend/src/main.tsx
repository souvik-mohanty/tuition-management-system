import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { reloadForNewVersion } from './utils/chunkReload'

// Vite fires this when a lazily loaded chunk 404s (typically right after a new deploy).
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  reloadForNewVersion()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
