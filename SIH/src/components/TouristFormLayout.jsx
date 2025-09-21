import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import Step1PersonalInfo from './Step1PersonalInfo'
import Step2TravelDetails from './Step2TravelDetails'
import Step3EmergencyContacts from './Step3EmergencyContacts'
import Step4SafetyConsent from './Step4SafetyConsent'
import TouristDashboard from './TouristDashboard'

const TouristFormLayout = () => {
  const navigate = useNavigate()
  const { t, currentLanguage, changeLanguage, languages } = useLanguage()
  const [currentStep, setCurrentStep] = useState(1)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const dropdownRef = useRef(null)
  const [formData, setFormData] = useState({
    step1: {},
    step2: {},
    step3: {},
    step4: {}
  })

  // Check for existing form data and dashboard state on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('touristFormData')
    const savedDashboardState = localStorage.getItem('touristDashboardState')
    
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData)
        setFormData(parsedData)
        console.log('Loaded saved form data:', parsedData)
      } catch (error) {
        console.error('Error parsing saved form data:', error)
      }
    }
    
    if (savedDashboardState === 'true') {
      setShowDashboard(true)
      console.log('Dashboard state restored from localStorage')
    }
  }, [])

  const totalSteps = 4

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode)
    setIsDropdownOpen(false)
  }

  const handleLogoClick = () => {
    navigate('/')
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

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    // Only save if there's actual data (not empty object)
    const hasData = Object.values(formData).some(step => 
      step && Object.keys(step).length > 0
    )
    
    if (hasData) {
      localStorage.setItem('touristFormData', JSON.stringify(formData))
      console.log('Form data saved to localStorage:', formData)
    }
  }, [formData])

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinalSubmit = (step4Data = null) => {
    console.log('handleFinalSubmit called with step4Data:', step4Data)
    console.log('Current formData:', formData)
    
    // Merge all form data, including step4Data if provided
    const finalData = {
      personalInfo: formData.step1,
      travelDetails: formData.step2,
      emergencyContacts: formData.step3,
      safetyConsent: step4Data || formData.step4,
      submittedAt: new Date().toISOString()
    }

    // Update form data with step4 data if provided
    if (step4Data) {
      setFormData(prev => ({ ...prev, step4: step4Data }))
    }

    // Log the merged data
    console.log('Tourist Digital ID Form Data:', finalData)

    // Show success alert
    alert(t('formSubmitted'))

    // Save dashboard state to localStorage
    localStorage.setItem('touristDashboardState', 'true')
    
    // Show dashboard instead of resetting form
    console.log('Setting showDashboard to true')
    setShowDashboard(true)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PersonalInfo
            onNext={nextStep}
            formData={formData}
            setFormData={setFormData}
          />
        )
      case 2:
        return (
          <Step2TravelDetails
            onNext={nextStep}
            onBack={prevStep}
            formData={formData}
            setFormData={setFormData}
          />
        )
      case 3:
        return (
          <Step3EmergencyContacts
            onNext={nextStep}
            onBack={prevStep}
            formData={formData}
            setFormData={setFormData}
          />
        )
      case 4:
        return (
          <Step4SafetyConsent
            onNext={nextStep}
            onBack={prevStep}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleFinalSubmit}
          />
        )
      default:
        return null
    }
  }

  // Show dashboard if form is submitted
  if (showDashboard) {
    console.log('Showing dashboard with form data:', formData)
    return <TouristDashboard formData={formData} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header with Logo and Language Switcher */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1">
            {/* Logo button */}
            <button
              onClick={handleLogoClick}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
            >
              🛡️ {t('logo')}
            </button>
          </div>
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {t('touristFormTitle')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('touristFormSubtitle')}
            </p>
          </div>
          <div className="flex-1 flex justify-end">
            {/* Language dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg font-medium text-sm shadow-md hover:shadow-lg border border-slate-300 hover:border-slate-400 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-[9999] overflow-hidden">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors duration-200 flex items-center gap-3 ${
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
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div key={index + 1} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep > index + 1
                      ? 'bg-green-500 text-white'
                      : currentStep === index + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {currentStep > index + 1 ? '✓' : index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>{t('personalInfo')}</span>
            <span>{t('travelDetails')}</span>
            <span>{t('emergencyContacts')}</span>
            <span>{t('safetyConsent')}</span>
          </div>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Your information is secure and will only be used for safety purposes.</p>
        </div>
      </div>
    </div>
  )
}

export default TouristFormLayout
