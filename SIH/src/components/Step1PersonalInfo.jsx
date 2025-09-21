import React from 'react'
import { useForm } from 'react-hook-form'
import { useLanguage } from '../contexts/LanguageContext'

const Step1PersonalInfo = ({ onNext, formData, setFormData }) => {
  const { t } = useLanguage()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: formData.step1 || {}
  })

  const onSubmit = (data) => {
    setFormData(prev => ({ ...prev, step1: data }))
    onNext()
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('personalInfo')}</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('fullName')} *
          </label>
          <input
            type="text"
            {...register('fullName', { required: t('fullName') + ' ' + t('required') })}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('fullName')}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('email')} *
          </label>
          <input
            type="email"
            {...register('email', { 
              required: t('email') + ' ' + t('required'),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('email')}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('phone')} *
          </label>
          <input
            type="tel"
            {...register('phone', { 
              required: t('phone') + ' ' + t('required'),
              pattern: {
                value: /^[0-9+\-\s()]+$/,
                message: 'Invalid phone number format'
              }
            })}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('phone')}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('idType')} *
          </label>
          <select
            {...register('idType', { required: t('idType') + ' ' + t('required') })}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('idType')}</option>
            <option value="aadhaar">Aadhaar</option>
            <option value="passport">Passport</option>
            <option value="driving-license">Driving License</option>
            <option value="voter-id">Voter ID</option>
          </select>
          {errors.idType && (
            <p className="text-red-500 text-sm mt-1">{errors.idType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('idNumber')} *
          </label>
          <input
            type="text"
            {...register('idNumber', { required: t('idNumber') + ' ' + t('required') })}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('idNumber')}
          />
          {errors.idNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.idNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('nationality')} *
          </label>
          <select
            {...register('nationality', { required: t('nationality') + ' ' + t('required') })}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('nationality')}</option>
            <option value="indian">Indian</option>
            <option value="american">American</option>
            <option value="british">British</option>
            <option value="canadian">Canadian</option>
            <option value="australian">Australian</option>
            <option value="german">German</option>
            <option value="french">French</option>
            <option value="japanese">Japanese</option>
            <option value="chinese">Chinese</option>
            <option value="other">Other</option>
          </select>
          {errors.nationality && (
            <p className="text-red-500 text-sm mt-1">{errors.nationality.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('dateOfBirth')} *
          </label>
          <input
            type="date"
            {...register('dateOfBirth', { required: t('dateOfBirth') + ' ' + t('required') })}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.dateOfBirth && (
            <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('gender')}
          </label>
          <select
            {...register('gender')}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('gender')}</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('address')}
          </label>
          <textarea
            {...register('address')}
            rows="3"
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('address')}
          />
        </div>

        <div className="flex justify-end">
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

export default Step1PersonalInfo
