import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from './contexts/LanguageContext'

const LandingPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, currentLanguage, changeLanguage, languages } = useLanguage()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogoClick = () => {
    if (location.pathname !== '/') {
      navigate('/')
    }
  }

  const handleButtonClick = (path) => {
    navigate(path)
  }

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode)
    setIsDropdownOpen(false)
  }

  const currentLang = languages.find(lang => lang.code === currentLanguage)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <header className="relative py-6 px-6 bg-white/90 backdrop-blur-sm shadow-lg border-b border-slate-200 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          {/* Logo button */}
          <button
            onClick={handleLogoClick}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
          >
            🛡️ {t('logo')}
          </button>
          
          {/* Language dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-6 py-3 rounded-xl font-medium text-base shadow-md hover:shadow-lg border border-slate-300 hover:border-slate-400 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              {currentLang?.flag} {t('lang')}
              <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                {/* Backdrop overlay */}
                <div className="fixed inset-0 z-[9998]" onClick={() => setIsDropdownOpen(false)}></div>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-[9999] overflow-hidden">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors duration-200 flex items-center gap-3 ${
                        currentLanguage === lang.code ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="flex-1">{lang.name}</span>
                      {currentLanguage === lang.code && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section 
        className="relative min-h-[80vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
        }}
      >
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
        
        {/* Slogan */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-tight drop-shadow-2xl">
            <span className="block bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent font-serif italic">
              {t('safety')}
            </span>
            <span className="block bg-gradient-to-r from-blue-100 to-white bg-clip-text text-transparent font-serif italic mt-4">
              {t('priority')}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mt-8 font-light tracking-wide">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Buttons Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              {t('choosePortal')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('accessServices')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tourist Button */}
            <button
              onClick={() => handleButtonClick('/tourist')}
              className="group aspect-square bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white cursor-pointer transition-all duration-500 flex flex-col items-center justify-center rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 border-0 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4">🧳</div>
                <span className="font-bold text-2xl md:text-3xl tracking-wide">{t('tourist')}</span>
                <p className="text-blue-100 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {t('touristDesc')}
                </p>
              </div>
            </button>
            
            {/* Police Button */}
            <button
              onClick={() => handleButtonClick('/police')}
              className="group aspect-square bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white cursor-pointer transition-all duration-500 flex flex-col items-center justify-center rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 border-0 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4">👮</div>
                <span className="font-bold text-2xl md:text-3xl tracking-wide">{t('police')}</span>
                <p className="text-red-100 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {t('policeDesc')}
                </p>
              </div>
            </button>
            
            {/* Tourism Dept Button */}
            <button
              onClick={() => handleButtonClick('/tourism-dept')}
              className="group aspect-square bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white cursor-pointer transition-all duration-500 flex flex-col items-center justify-center rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 border-0 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4">🏛️</div>
                <span className="font-bold text-2xl md:text-3xl tracking-wide">{t('tourismDept')}</span>
                <p className="text-emerald-100 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {t('tourismDeptDesc')}
                </p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-300 text-lg">
            {t('copyright')}
          </p>
          <p className="text-slate-400 text-sm mt-2">
            {t('footerSubtitle')}
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
