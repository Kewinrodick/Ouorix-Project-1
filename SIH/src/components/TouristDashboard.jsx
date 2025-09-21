import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

const TouristDashboard = ({ formData }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)

  const handleLogoClick = () => {
    navigate('/')
  }

  const handleBackToForm = () => {
    // Clear dashboard state but keep form data
    localStorage.removeItem('touristDashboardState')
    navigate('/tourist/form')
  }

  const handleNewRegistration = () => {
    // Clear saved data from localStorage
    localStorage.removeItem('touristFormData')
    localStorage.removeItem('touristDashboardState')
    
    // Navigate to form
    navigate('/tourist/form')
    
    // Reload the page to reset all state
    window.location.reload()
  }

  // Get user's current location
  useEffect(() => {
    console.log('=== LOCATION DEBUG START ===')
    console.log('Navigator geolocation available:', !!navigator.geolocation)
    console.log('HTTPS protocol:', window.location.protocol === 'https:')
    console.log('Current URL:', window.location.href)
    
    if (navigator.geolocation) {
      setIsLoadingLocation(true)
      setLocationError(null)
      
      console.log('Starting location request...')
      
      // Try with very permissive options first
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ Location obtained successfully:', position.coords)
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error('❌ Location error details:', {
            code: error.code,
            message: error.message,
            PERMISSION_DENIED: error.PERMISSION_DENIED,
            POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
            TIMEOUT: error.TIMEOUT
          })
          
          let errorMessage = 'Unable to get location'
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please click "Allow" when prompted or enable location services in your browser settings.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please check your device location settings and ensure GPS/location services are enabled.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.'
              break
            default:
              errorMessage = `Location error: ${error.message || 'Unknown error'}`
              break
          }
          
          console.log('Setting error message:', errorMessage)
          setLocationError(errorMessage)
          setIsLoadingLocation(false)
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0 // Always get fresh location
        }
      )
    } else {
      console.error('❌ Geolocation not supported')
      setLocationError('Geolocation is not supported by this browser. Please use a modern browser like Chrome, Firefox, or Safari.')
      setIsLoadingLocation(false)
    }
  }, [])

  // Get location name from coordinates using reverse geocoding
  const getLocationName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      )
      const data = await response.json()
      return data.locality || data.city || data.principalSubdivision || 'Unknown Location'
    } catch (error) {
      console.error('Error getting location name:', error)
      return 'Unknown Location'
    }
  }

  const [locationName, setLocationName] = useState('Shillong')

  useEffect(() => {
    if (userLocation) {
      getLocationName(userLocation.latitude, userLocation.longitude)
        .then(name => setLocationName(name))
    }
  }, [userLocation])

  const refreshLocation = () => {
    console.log('🔄 Refreshing location...')
    
    if (navigator.geolocation) {
      setIsLoadingLocation(true)
      setLocationError(null)
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ Location refreshed successfully:', position.coords)
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error('❌ Error refreshing location:', error)
          let errorMessage = 'Unable to get location'
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.'
              break
            default:
              errorMessage = error.message || 'Unknown location error'
              break
          }
          
          setLocationError(errorMessage)
          setIsLoadingLocation(false)
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0 // Force fresh location
        }
      )
    }
  }

  // Test location for development (Shillong, Meghalaya)
  const useTestLocation = () => {
    console.log('🧪 Using test location (Shillong, Meghalaya)')
    setUserLocation({
      latitude: 25.5788,
      longitude: 91.8933,
      accuracy: 100
    })
    setLocationError(null)
    setIsLoadingLocation(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header with Logo */}
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
              Tourist Safety Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Welcome, {formData?.step1?.fullName || 'Tourist'}
            </p>
          </div>
          <div className="flex-1 flex justify-end space-x-3">
            <button
              onClick={handleNewRegistration}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              New Registration
            </button>
            <button
              onClick={handleBackToForm}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Back to Form
            </button>
          </div>
        </div>

        {/* Location Permission Notice */}
        {isLoadingLocation && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
              <div>
                <div className="font-semibold text-blue-800">Requesting Location Access</div>
                <div className="text-blue-600 text-sm">Please allow location access to show your current position on the map</div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Safety Score Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-lg font-semibold">Tourist Safety App</h4>
                <p className="text-blue-100">ID: TID-NE-2025-001234</p>
                <div className="flex items-center mt-2">
                  <span className="text-red-300 mr-2">📍</span>
                  <span className="text-blue-100">
                    {isLoadingLocation ? 'Loading...' : locationName}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">85%</div>
                <div className="text-blue-100 text-sm">Safety Score</div>
              </div>
            </div>
          </div>

          {/* Safe Zone Status */}
          <div className="bg-green-100 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-500 rounded-full p-2 mr-3">
                <span className="text-white text-xl">✓</span>
              </div>
              <div>
                <div className="font-semibold text-green-800">Safe Zone</div>
                <div className="text-green-600 text-sm">
                  Current Location: {isLoadingLocation ? 'Loading...' : locationName}
                </div>
              </div>
            </div>
            <div className="bg-green-500 rounded-full p-2">
              <span className="text-white text-xl">🛡️</span>
            </div>
          </div>

          {/* Emergency Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <span className="text-red-500 text-xl mr-2">⚠️</span>
              <h4 className="text-lg font-semibold text-gray-800">Emergency Actions</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-4 flex items-center justify-center transition duration-200">
                <span className="text-white text-xl mr-2">📞</span>
                <span className="font-semibold">PANIC</span>
              </button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-4 flex items-center justify-center transition duration-200">
                <span className="text-white text-xl mr-2">❤️</span>
                <span className="font-semibold">Medical</span>
              </button>
            </div>
          </div>

          {/* Live Location & Alerts */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <span className="text-blue-500 text-xl mr-2">🗺️</span>
              <h4 className="text-lg font-semibold text-gray-800">Live Location & Restricted Areas</h4>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 relative min-h-[300px] flex items-center justify-center">
              {isLoadingLocation ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <div className="font-semibold text-gray-800">Getting your location...</div>
                  <div className="text-gray-600 text-sm">Please allow location access</div>
                </div>
              ) : locationError ? (
                <div className="text-center">
                  <div className="text-red-500 text-4xl mb-2">⚠️</div>
                  <div className="font-semibold text-gray-800">Location Error</div>
                  <div className="text-gray-600 text-sm mb-4">{locationError}</div>
                  <div className="space-y-2">
                    <button 
                      onClick={refreshLocation} 
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition duration-200 mr-2"
                    >
                      🔄 Retry Location
                    </button>
                    <button 
                      onClick={useTestLocation} 
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition duration-200"
                    >
                      🧪 Use Test Location
                    </button>
                  </div>
                </div>
              ) : userLocation ? (
                <div className="w-full h-full relative">
                  {/* Map Container */}
                  <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg relative overflow-hidden">
                    {/* Map Grid Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="grid grid-cols-8 grid-rows-6 h-full">
                        {Array.from({ length: 48 }).map((_, i) => (
                          <div key={i} className="border border-gray-300"></div>
                        ))}
                      </div>
                    </div>
                    
                    {/* User Location Pin */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="text-red-500 text-4xl animate-pulse">📍</div>
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-lg shadow-lg border">
                        <div className="font-semibold text-gray-800 text-sm">You are here</div>
                        <div className="text-gray-600 text-xs">{locationName}</div>
                        <div className="text-gray-500 text-xs">
                          {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                        </div>
                      </div>
                    </div>

                    {/* Location Accuracy Circle */}
                    <div 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-red-300 rounded-full opacity-50"
                      style={{
                        width: `${Math.min(userLocation.accuracy * 2, 200)}px`,
                        height: `${Math.min(userLocation.accuracy * 2, 200)}px`
                      }}
                    ></div>
                  </div>

                  {/* Alert Badges */}
                  <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center shadow-lg">
                    <span className="mr-1">▲</span>
                    Caution Zone 1km S
                  </div>
                  <div className="absolute bottom-2 right-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center shadow-lg">
                    <span className="mr-1">🚫</span>
                    Restricted Zone 2km NE
                  </div>
                  
                  {/* Location Details */}
                  <div className="absolute bottom-2 left-2 bg-white px-3 py-2 rounded-lg shadow-lg">
                    <div className="text-xs text-gray-600">
                      <div>Accuracy: ±{Math.round(userLocation.accuracy)}m</div>
                      <div>Last updated: {new Date().toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-gray-500 text-4xl mb-2">📍</div>
                  <div className="font-semibold text-gray-800">Location not available</div>
                  <div className="text-gray-600 text-sm mb-4">Please enable location services</div>
                  <div className="space-y-2">
                    <button 
                      onClick={refreshLocation} 
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition duration-200 mr-2"
                    >
                      🔄 Try Again
                    </button>
                    <button 
                      onClick={useTestLocation} 
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition duration-200"
                    >
                      🧪 Use Test Location
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Tracking */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Real-time Tracking</h4>
                <p className="text-gray-600 text-sm">Share location with emergency contacts</p>
                {userLocation && (
                  <div className="mt-2 text-xs text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition duration-200 flex items-center"
                >
                  <span className="mr-1">🔄</span>
                  Refresh
                </button>
                <div className="bg-gray-300 rounded-full w-12 h-6 relative">
                  <div className="bg-white rounded-full w-5 h-5 absolute top-0.5 left-0.5 transition-transform duration-200"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Alerts */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Live Alerts</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <div className="text-yellow-800">Entering moderate risk zone</div>
                <div className="text-gray-500 text-sm">10:30 AM</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="text-blue-800">Weather alert: Heavy rain expected</div>
                <div className="text-gray-500 text-sm">9:45 AM</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                <div className="text-red-800">Restricted area ahead</div>
                <div className="text-gray-500 text-sm">10:15 AM</div>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contacts</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-red-100 rounded-full p-2 mr-3">
                    <span className="text-red-500 text-xl">📞</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Tourist Police</div>
                    <div className="text-gray-600 text-sm">+91-361-2123456</div>
                  </div>
                </div>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200">
                  Call
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <span className="text-blue-500 text-xl">❤️</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Medical Emergency</div>
                    <div className="text-gray-600 text-sm">108</div>
                  </div>
                </div>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200">
                  Call
                </button>
              </div>
            </div>
          </div>

          {/* User Information Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Your Registration Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Personal Information</h5>
                <p className="text-gray-600 text-sm">Name: {formData?.step1?.fullName || 'N/A'}</p>
                <p className="text-gray-600 text-sm">Email: {formData?.step1?.email || 'N/A'}</p>
                <p className="text-gray-600 text-sm">Phone: {formData?.step1?.phone || 'N/A'}</p>
                <p className="text-gray-600 text-sm">Nationality: {formData?.step1?.nationality || 'N/A'}</p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Travel Details</h5>
                <p className="text-gray-600 text-sm">Arrival: {formData?.step2?.arrivalDate || 'N/A'}</p>
                <p className="text-gray-600 text-sm">Departure: {formData?.step2?.departureDate || 'N/A'}</p>
                <p className="text-gray-600 text-sm">Purpose: {formData?.step2?.purposeOfVisit || 'N/A'}</p>
                <p className="text-gray-600 text-sm">Group Size: {formData?.step2?.groupSize || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TouristDashboard
