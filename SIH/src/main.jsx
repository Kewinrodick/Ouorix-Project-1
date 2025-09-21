import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext.jsx'
import LandingPage from './LandingPage.jsx'
import './index.css'

// Language-aware placeholder pages
const TouristPage = () => {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-800 mb-4">🧳</h1>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('touristPage')}</h2>
        <p className="text-xl text-gray-600">Coming Soon...</p>
      </div>
    </div>
  )
}

const PolicePage = () => {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-800 mb-4">👮</h1>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('policePage')}</h2>
        <p className="text-xl text-gray-600">Coming Soon...</p>
      </div>
    </div>
  )
}

const TourismDeptPage = () => {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-emerald-800 mb-4">🏛️</h1>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('tourismDeptPage')}</h2>
        <p className="text-xl text-gray-600">Coming Soon...</p>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/tourist" element={<TouristPage />} />
          <Route path="/police" element={<PolicePage />} />
          <Route path="/tourism-dept" element={<TourismDeptPage />} />
        </Routes>
      </Router>
    </LanguageProvider>
  </React.StrictMode>,
)
