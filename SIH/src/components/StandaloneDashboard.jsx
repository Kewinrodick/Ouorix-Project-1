import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TouristDashboard from './TouristDashboard'

const StandaloneDashboard = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('touristFormData')
    const savedDashboardState = localStorage.getItem('touristDashboardState')
    
    if (savedFormData && savedDashboardState === 'true') {
      try {
        const parsedData = JSON.parse(savedFormData)
        setFormData(parsedData)
        setIsLoading(false)
        console.log('Loaded form data for dashboard:', parsedData)
      } catch (error) {
        console.error('Error parsing saved form data:', error)
        // If data is corrupted, redirect to form
        navigate('/tourist/form')
      }
    } else {
      // No registration data found, redirect to form
      navigate('/tourist/form')
    }
  }, [navigate])

  // Show loading if form data is not loaded yet
  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Use the exact same TouristDashboard component
  return <TouristDashboard formData={formData} />
}

export default StandaloneDashboard
