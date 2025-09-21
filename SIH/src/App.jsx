import React from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext.jsx'
import LandingPage from './LandingPage.jsx'
import TouristFormLayout from './components/TouristFormLayout.jsx'
import StandaloneDashboard from './components/StandaloneDashboard.jsx'
import './index.css'

// Language-aware placeholder pages
const TouristPage = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  
  const handleLogoClick = () => {
    navigate('/')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header with Logo */}
      <header className="relative py-6 px-6 bg-white/90 backdrop-blur-sm shadow-lg border-b border-slate-200 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Logo button */}
          <button
            onClick={handleLogoClick}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
          >
            🛡️ {t('logo')}
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-blue-800 mb-4">🧳</h1>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('touristPage')}</h2>
          <p className="text-xl text-gray-600">Coming Soon...</p>
        </div>
      </div>
    </div>
  )
}

const PolicePage = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  
  const handleLogoClick = () => {
    navigate('/')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      {/* Header with Logo */}
      <header className="relative py-6 px-6 bg-white/90 backdrop-blur-sm shadow-lg border-b border-slate-200 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Logo button */}
          <button
            onClick={handleLogoClick}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
          >
            🛡️ {t('logo')}
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-800 mb-4">👮</h1>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('policePage')}</h2>
          <p className="text-xl text-gray-600">Coming Soon...</p>
        </div>
      </div>
    </div>
  )
}

const TourismDeptPage = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  
  const handleLogoClick = () => {
    navigate('/')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100">
      {/* Header with Logo */}
      <header className="relative py-6 px-6 bg-white/90 backdrop-blur-sm shadow-lg border-b border-slate-200 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Logo button */}
          <button
            onClick={handleLogoClick}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
          >
            🛡️ {t('logo')}
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-emerald-800 mb-4">🏛️</h1>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('tourismDeptPage')}</h2>
          <p className="text-xl text-gray-600">Coming Soon...</p>
        </div>
      </div>
    </div>
  )
}

const App = () => {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/tourist" element={<TouristPage />} />
          <Route path="/tourist/form" element={<TouristFormLayout />} />
          <Route path="/tourist/dashboard" element={<StandaloneDashboard />} />
          <Route path="/police" element={<PolicePage />} />
          <Route path="/tourism-dept" element={<TourismDeptPage />} />
        </Routes>
      </Router>
    </LanguageProvider>
  )
}

export default App
