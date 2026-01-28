import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { Shop } from './components/Shop'
import { About } from './components/About'
import { CareGuide } from './components/CareGuide'
import { Contact } from './components/Contact'

const App: React.FC = () => {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } =
    useAuth0()

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Shop
              user={user}
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
              onLogin={() => loginWithRedirect()}
              onLogout={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
            />
          }
        />
        <Route
          path="/about"
          element={
            <About
              user={user}
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
              onLogin={() => loginWithRedirect()}
              onLogout={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
            />
          }
        />
        <Route
          path="/care-guide"
          element={
            <CareGuide
              user={user}
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
              onLogin={() => loginWithRedirect()}
              onLogout={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
            />
          }
        />
        <Route
          path="/contact"
          element={
            <Contact
              user={user}
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
              onLogin={() => loginWithRedirect()}
              onLogout={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
