import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWeb3 } from '../contexts/Web3Context'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import {
  Shield,
  MapPin,
  Droplets,
  Thermometer,
  Wind,
  Calculator,
  AlertCircle,
  Loader2,
  CheckCircle,
  Info,
  Cloud
} from 'lucide-react'
import { TRIGGER_TYPES, CROP_TYPES } from '../config/contracts'
import WeatherWidget from '../components/WeatherWidget'

export default function CreatePolicy() {
  const navigate = useNavigate()
  const { account, contracts, isCorrectNetwork } = useWeb3()
  
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    triggerType: '0',
    triggerThreshold: '',
    coverageAmount: '',
    duration: '30',
    cropType: 'Wheat',
    farmSize: '',
  })
  
  const [premium, setPremium] = useState(null)
  const [locationHash, setLocationHash] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [useTemplate, setUseTemplate] = useState(false)
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [currentWeather, setCurrentWeather] = useState(null)

  useEffect(() => {
    if (contracts.factory && isCorrectNetwork) {
      fetchTemplates()
    }
  }, [contracts.factory, isCorrectNetwork])

  const fetchTemplates = async () => {
    try {
      const activeTemplates = await contracts.factory.getActiveTemplates()
      setTemplates(activeTemplates)
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setPremium(null)
  }

  const calculatePremium = async () => {
    if (!contracts.insurance || !contracts.fdc) return

    setIsCalculating(true)
    try {
      // Create location hash
      const lat = Math.round(parseFloat(formData.latitude) * 1000000)
      const lon = Math.round(parseFloat(formData.longitude) * 1000000)
      const hash = await contracts.fdc.createLocationHash(lat, lon)
      setLocationHash(hash)

      // Calculate premium
      const coverageWei = ethers.parseEther(formData.coverageAmount)
      const durationSeconds = parseInt(formData.duration) * 24 * 60 * 60
      
      const premiumWei = await contracts.insurance.calculatePremium(
        coverageWei,
        durationSeconds,
        parseInt(formData.triggerType)
      )
      
      setPremium(ethers.formatEther(premiumWei))
    } catch (error) {
      console.error('Failed to calculate premium:', error)
      toast.error('Failed to calculate premium')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!contracts.insurance || !premium || !locationHash) return

    setIsSubmitting(true)
    try {
      const coverageWei = ethers.parseEther(formData.coverageAmount)
      const durationSeconds = parseInt(formData.duration) * 24 * 60 * 60
      const threshold = Math.round(parseFloat(formData.triggerThreshold) * 100)
      const farmSizeScaled = Math.round(parseFloat(formData.farmSize) * 100)
      const premiumWei = ethers.parseEther(premium)

      const tx = await contracts.insurance.createPolicy(
        locationHash,
        parseInt(formData.triggerType),
        threshold,
        coverageWei,
        durationSeconds,
        formData.cropType,
        farmSizeScaled,
        { value: premiumWei }
      )

      toast.loading('Creating policy...', { id: 'create-policy' })
      await tx.wait()
      toast.success('Policy created successfully!', { id: 'create-policy' })
      
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to create policy:', error)
      toast.error('Failed to create policy', { id: 'create-policy' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTriggerIcon = (type) => {
    const typeNum = parseInt(type)
    if (typeNum === 0 || typeNum === 1) return <Droplets className="h-5 w-5" />
    if (typeNum === 2 || typeNum === 3) return <Thermometer className="h-5 w-5" />
    return <Wind className="h-5 w-5" />
  }

  const getThresholdLabel = () => {
    const type = parseInt(formData.triggerType)
    if (type === 0) return 'Minimum Rainfall (mm)'
    if (type === 1) return 'Maximum Rainfall (mm)'
    if (type === 2) return 'Minimum Temperature (°C)'
    if (type === 3) return 'Maximum Temperature (°C)'
    return 'Maximum Wind Speed (km/h)'
  }

  const getThresholdPlaceholder = () => {
    const type = parseInt(formData.triggerType)
    if (type === 0) return 'e.g., 50'
    if (type === 1) return 'e.g., 200'
    if (type === 2) return 'e.g., 0'
    if (type === 3) return 'e.g., 40'
    return 'e.g., 80'
  }

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Please connect your wallet to create an insurance policy.</p>
      </div>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Wrong Network</h2>
        <p className="text-gray-400">Please switch to Flare Network to create a policy.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Insurance Policy</h1>
        <p className="text-gray-400">
          Protect your crops against adverse weather conditions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Section */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-white">Farm Location</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Latitude</label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                placeholder="e.g., 41.9"
                step="0.000001"
                min="-90"
                max="90"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                placeholder="e.g., -93.1"
                step="0.000001"
                min="-180"
                max="180"
                className="input"
                required
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <Info className="h-3 w-3" />
            Enter the GPS coordinates of your farm for accurate weather tracking
          </p>
        </div>

        {/* Protection Type Section */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-white">Protection Type</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(TRIGGER_TYPES).map(([key, value]) => (
              <label
                key={key}
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                  formData.triggerType === String(value.value)
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="triggerType"
                  value={value.value}
                  checked={formData.triggerType === String(value.value)}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div className="text-primary-400">{getTriggerIcon(String(value.value))}</div>
                  <div>
                    <div className="text-white font-medium">{value.label}</div>
                    <div className="text-gray-400 text-sm">{value.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Threshold & Coverage Section */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-white">Coverage Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">{getThresholdLabel()}</label>
              <input
                type="number"
                name="triggerThreshold"
                value={formData.triggerThreshold}
                onChange={handleInputChange}
                placeholder={getThresholdPlaceholder()}
                step="0.01"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Coverage Amount (FLR)</label>
              <input
                type="number"
                name="coverageAmount"
                value={formData.coverageAmount}
                onChange={handleInputChange}
                placeholder="e.g., 1.0"
                step="0.01"
                min="0.01"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Duration (Days)</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days</option>
                <option value="180">180 Days</option>
                <option value="365">365 Days</option>
              </select>
            </div>
            <div>
              <label className="label">Farm Size (Hectares)</label>
              <input
                type="number"
                name="farmSize"
                value={formData.farmSize}
                onChange={handleInputChange}
                placeholder="e.g., 100"
                step="0.01"
                min="0.01"
                className="input"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Crop Type</label>
              <select
                name="cropType"
                value={formData.cropType}
                onChange={handleInputChange}
                className="input"
                required
              >
                {CROP_TYPES.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Premium Calculation */}
        <div className="card bg-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Premium Calculation</h2>
            <button
              type="button"
              onClick={calculatePremium}
              disabled={
                isCalculating ||
                !formData.latitude ||
                !formData.longitude ||
                !formData.coverageAmount ||
                !formData.triggerThreshold
              }
              className="btn btn-secondary text-sm py-2"
            >
              {isCalculating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Calculate Premium'
              )}
            </button>
          </div>
          
          {premium ? (
            <div className="flex items-center justify-between p-4 bg-primary-500/10 rounded-lg border border-primary-500/30">
              <div>
                <div className="text-gray-400 text-sm">Estimated Premium</div>
                <div className="text-2xl font-bold text-primary-400">{premium} FLR</div>
              </div>
              <CheckCircle className="h-8 w-8 text-primary-400" />
            </div>
          ) : (
            <div className="text-gray-500 text-sm text-center py-4">
              Fill in the form and click "Calculate Premium" to see your insurance cost
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!premium || isSubmitting}
          className="w-full btn btn-primary flex items-center justify-center gap-2 py-4"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Policy...
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              Create Policy & Pay {premium || '0'} FLR
            </>
          )}
        </button>
      </form>
    </div>
  )
}
