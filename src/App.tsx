import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Shop } from './components/Shop'
import About from './components/About'
import CareGuide from './components/CareGuide'
import Contact from './components/Contact'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/about" element={<About />} />
        {/* Add more routes as needed */}
        {<Route path="/care-guide" element={<CareGuide />} />}
        {<Route path="/contact" element={<Contact />} />}
      </Routes>
    </BrowserRouter>
  )
}

export default App
