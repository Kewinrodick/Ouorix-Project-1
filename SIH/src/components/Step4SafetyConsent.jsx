import React from 'react'
import { useForm } from 'react-hook-form'
import { useLanguage } from '../contexts/LanguageContext'

const Step4SafetyConsent = ({ onNext, onBack, formData, setFormData, onSubmit }) => {
  const { t } = useLanguage()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: formData.step4 || {}
  })

  const handleFormSubmit = (data) => {
    setFormData(prev => ({ ...prev, step4: data }))
    // Pass the form data directly to onSubmit
    onSubmit(data)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('safetyConsent')}</h2>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Medical Information */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('medicalInfo')}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('allergies')}
              </label>
              <textarea
                {...register('allergies')}
                rows="2"
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('allergies')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('medicalConditions')}
              </label>
              <textarea
                {...register('medicalConditions')}
                rows="2"
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('medicalConditions')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('medications')}
              </label>
              <textarea
                {...register('medications')}
                rows="2"
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('medications')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('bloodGroup')}
              </label>
              <select
                {...register('bloodGroup')}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('bloodGroup')}</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>
        </div>

        {/* Consent Checkboxes */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('requiredConsents')} *</h3>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <input
                type="checkbox"
                {...register('locationTracking', { required: 'Location tracking consent is required' })}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                {t('locationTracking')}
              </label>
            </div>
            {errors.locationTracking && (
              <p className="text-red-500 text-sm mt-1">{errors.locationTracking.message}</p>
            )}

            <div className="flex items-start">
              <input
                type="checkbox"
                {...register('shareLocationWithContacts', { required: 'Location sharing consent is required' })}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                {t('shareLocation')}
              </label>
            </div>
            {errors.shareLocationWithContacts && (
              <p className="text-red-500 text-sm mt-1">{errors.shareLocationWithContacts.message}</p>
            )}

            <div className="flex items-start">
              <input
                type="checkbox"
                {...register('receiveSafetyAlerts', { required: 'Safety alerts consent is required' })}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                {t('safetyAlerts')}
              </label>
            </div>
            {errors.receiveSafetyAlerts && (
              <p className="text-red-500 text-sm mt-1">{errors.receiveSafetyAlerts.message}</p>
            )}

            <div className="flex items-start">
              <input
                type="checkbox"
                {...register('acceptTerms', { required: 'Terms and conditions acceptance is required' })}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                {t('acceptTerms')}
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-red-500 text-sm mt-1">{errors.acceptTerms.message}</p>
            )}

            <div className="flex items-start">
              <input
                type="checkbox"
                {...register('acceptPrivacyPolicy', { required: 'Privacy policy acceptance is required' })}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                {t('acceptPrivacy')}
              </label>
            </div>
            {errors.acceptPrivacyPolicy && (
              <p className="text-red-500 text-sm mt-1">{errors.acceptPrivacyPolicy.message}</p>
            )}
          </div>
        </div>

        {/* Additional Preferences */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('additionalPreferences')}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('preferredLanguage')} *
              </label>
              <select
                {...register('preferredLanguage', { required: 'Preferred language is required' })}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('preferredLanguage')}</option>
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="tamil">Tamil</option>
                <option value="telugu">Telugu</option>
                <option value="bengali">Bengali</option>
                <option value="marathi">Marathi</option>
                <option value="gujarati">Gujarati</option>
                <option value="kannada">Kannada</option>
                <option value="malayalam">Malayalam</option>
                <option value="punjabi">Punjabi</option>
                <option value="other">Other</option>
              </select>
              {errors.preferredLanguage && (
                <p className="text-red-500 text-sm mt-1">{errors.preferredLanguage.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('specialRequirements')}
              </label>
              <textarea
                {...register('specialRequirements')}
                rows="3"
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('specialRequirements')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
          >
            {t('back')}
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200"
          >
            {t('submit')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Step4SafetyConsent
