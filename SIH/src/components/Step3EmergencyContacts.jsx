import React from 'react'
import { useForm } from 'react-hook-form'
import { useLanguage } from '../contexts/LanguageContext'

const Step3EmergencyContacts = ({ onNext, onBack, formData, setFormData }) => {
  const { t } = useLanguage()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: formData.step3 || {}
  })

  const onSubmit = (data) => {
    setFormData(prev => ({ ...prev, step3: data }))
    onNext()
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('emergencyContacts')}</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Primary Emergency Contact */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('primaryContact')} *</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('name')} *
              </label>
              <input
                type="text"
                {...register('primaryContact.name', { required: 'Primary contact name is required' })}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('name')}
              />
              {errors.primaryContact?.name && (
                <p className="text-red-500 text-sm mt-1">{errors.primaryContact.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('phone')} *
              </label>
              <input
                type="tel"
                {...register('primaryContact.phone', { 
                  required: 'Primary contact phone is required',
                  pattern: {
                    value: /^[0-9+\-\s()]+$/,
                    message: 'Invalid phone number format'
                  }
                })}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('phone')}
              />
              {errors.primaryContact?.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.primaryContact.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                {...register('primaryContact.email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('email')}
              />
              {errors.primaryContact?.email && (
                <p className="text-red-500 text-sm mt-1">{errors.primaryContact.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('relationship')} *
              </label>
              <select
                {...register('primaryContact.relationship', { required: 'Relationship is required' })}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('relationship')}</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="child">Child</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
              {errors.primaryContact?.relationship && (
                <p className="text-red-500 text-sm mt-1">{errors.primaryContact.relationship.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('address')}
              </label>
              <textarea
                {...register('primaryContact.address')}
                rows="2"
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('address')}
              />
            </div>
          </div>
        </div>

        {/* Secondary Emergency Contact */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('secondaryContact')}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                {...register('secondaryContact.name')}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('name')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                {...register('secondaryContact.phone', {
                  pattern: {
                    value: /^[0-9+\-\s()]+$/,
                    message: 'Invalid phone number format'
                  }
                })}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('phone')}
              />
              {errors.secondaryContact?.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.secondaryContact.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                {...register('secondaryContact.email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('email')}
              />
              {errors.secondaryContact?.email && (
                <p className="text-red-500 text-sm mt-1">{errors.secondaryContact.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship
              </label>
              <select
                {...register('secondaryContact.relationship')}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('relationship')}</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="child">Child</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('address')}
              </label>
              <textarea
                {...register('secondaryContact.address')}
                rows="2"
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('address')}
              />
            </div>
          </div>
        </div>

        {/* Local Contact */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('localContact')}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                {...register('localContact.name')}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter name of guide, tour operator, or local contact"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                {...register('localContact.phone', {
                  pattern: {
                    value: /^[0-9+\-\s()]+$/,
                    message: 'Invalid phone number format'
                  }
                })}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('phone')}
              />
              {errors.localContact?.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.localContact.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                {...register('localContact.email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('email')}
              />
              {errors.localContact?.email && (
                <p className="text-red-500 text-sm mt-1">{errors.localContact.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship/Organization
              </label>
              <input
                type="text"
                {...register('localContact.relationship')}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Tour Guide, Hotel Manager, Local Friend"
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
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
          >
            {t('next')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Step3EmergencyContacts
