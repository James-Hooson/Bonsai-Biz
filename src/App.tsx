import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

const Shop = lazy(() => import('./components/Shop').then(m => ({ default: m.Shop })))
const About = lazy(() => import('./components/About').then(m => ({ default: m.About })))
const CareGuide = lazy(() => import('./components/CareGuide').then(m => ({ default: m.CareGuide })))
const Aquascaping = lazy(() => import('./components/Aquascaping').then(m => ({ default: m.Aquascaping })))
const Contact = lazy(() => import('./components/Contact').then(m => ({ default: m.Contact })))
const OrderSuccess = lazy(() => import('./components/OrderSuccess').then(m => ({ default: m.OrderSuccess })))

const AdminLogin: React.FC = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoading) return
    if (isAuthenticated) {
      navigate('/', { replace: true })
    } else {
      loginWithRedirect({ appState: { returnTo: '/' } })
    }
  }, [isAuthenticated, isLoading, loginWithRedirect, navigate])

  return null
}

const App: React.FC = () => {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } =
    useAuth0()

  const authProps = {
    user,
    isAuthenticated,
    isLoading,
    onLogin: () => loginWithRedirect(),
    onLogout: () => logout({ logoutParams: { returnTo: window.location.origin } }),
  }

  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Shop {...authProps} />} />
          <Route path="/about" element={<About {...authProps} />} />
          <Route path="/care-guide" element={<CareGuide {...authProps} />} />
          <Route path="/aquascaping" element={<Aquascaping {...authProps} />} />
          <Route path="/contact" element={<Contact {...authProps} />} />
          <Route path="/success" element={<OrderSuccess {...authProps} />} />
          <Route path="/admin" element={<AdminLogin />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
