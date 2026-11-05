import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App.tsx'
import './index.css'

// After a new deploy, tabs opened before it still reference the old hashed
// chunk filenames, which no longer exist on the server. When a lazy-loaded
// page fails to load for that reason, reload once to pick up the new build.
// The timestamp guard prevents a reload loop if the failure is something else.
window.addEventListener('vite:preloadError', (event) => {
  const key = 'chunk-reload-at'
  let last = 0
  try {
    last = Number(sessionStorage.getItem(key)) || 0
  } catch {
    // sessionStorage unavailable — fall through and still try a reload
  }
  if (Date.now() - last < 10_000) return // already retried recently; let the error surface
  event.preventDefault()
  try {
    sessionStorage.setItem(key, String(Date.now()))
  } catch {
    // ignore
  }
  window.location.reload()
})

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error(
    'Root element not found. Ensure index.html contains a <div id="root"></div>',
  )
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
      useRefreshTokens={true}
      cacheLocation="memory"
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>,
)
//test
