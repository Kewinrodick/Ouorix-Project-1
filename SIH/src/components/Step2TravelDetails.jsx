import React from 'react'
import { useForm } from 'react-hook-form'
import { useLanguage } from '../contexts/LanguageContext'

const Step2TravelDetails = ({ onNext, onBack, formData, setFormData }) => {
  const { t } = useLanguage()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: formData.step2 || {}
  })

  const onSubmit = (data) => {
    setFormData(prev => ({ ...prev, step2: data }))
    onNext()
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('travelDetails')}</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('arrivalDate')} *
            </label>
            <input
              type="date"
              {...register('arrivalDate', { required: t('arrivalDate') + ' ' + t('required') })}
              className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.arrivalDate && (
              <p className="text-red-500 text-sm mt-1">{errors.arrivalDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('departureDate')} *
            </label>
            <input
              type="date"
              {...register('departureDate', { required: t('departureDate') + ' ' + t('required') })}
              className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.departureDate && (
              <p className="text-red-500 text-sm mt-1">{errors.departureDate.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('purposeOfVisit')} *
          </label>
          <select
            {...register('purposeOfVisit', { required: t('purposeOfVisit') + ' ' + t('required') })}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('purposeOfVisit')}</option>
            <option value="tourism">Tourism</option>
            <option value="business">Business</option>
            <option value="medical">Medical</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
          </select>
          {errors.purposeOfVisit && (
            <p className="text-red-500 text-sm mt-1">{errors.purposeOfVisit.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('plannedItinerary')} *
          </label>
          <textarea
            {...register('plannedItinerary', { required: t('plannedItinerary') + ' ' + t('required') })}
            rows="4"
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('plannedItinerary')}
          />
          {errors.plannedItinerary && (
            <p className="text-red-500 text-sm mt-1">{errors.plannedItinerary.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('accommodationDetails')} *
          </label>
          <textarea
            {...register('accommodationDetails', { required: t('accommodationDetails') + ' ' + t('required') })}
            rows="3"
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('accommodationDetails')}
          />
          {errors.accommodationDetails && (
            <p className="text-red-500 text-sm mt-1">{errors.accommodationDetails.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('modeOfTransport')}
          </label>
          <select
            {...register('modeOfTransport')}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{t('modeOfTransport')}</option>
            <option value="flight">Flight</option>
            <option value="train">Train</option>
            <option value="bus">Bus</option>
            <option value="private-vehicle">Private Vehicle</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('groupSize')} *
          </label>
          <input
            type="number"
            min="1"
            {...register('groupSize', { 
              required: t('groupSize') + ' ' + t('required'),
              min: { value: 1, message: 'Group size must be at least 1' }
            })}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('groupSize')}
          />
          {errors.groupSize && (
            <p className="text-red-500 text-sm mt-1">{errors.groupSize.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('travelInsurance')}
          </label>
          <textarea
            {...register('travelInsurance')}
            rows="3"
            className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('travelInsurance')}
          />
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

export default Step2TravelDetails
