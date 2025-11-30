import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useWeb3 } from '../contexts/Web3Context'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import {
  Shield,
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  TrendingUp
} from 'lucide-react'
import { POLICY_STATUS, TRIGGER_TYPES } from '../config/contracts'

export default function PolicyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { account, contracts, isCorrectNetwork } = useWeb3()
  
  const [policy, setPolicy] = useState(null)
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [isClaiming, setIsClaiming] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (contracts.insurance && isCorrectNetwork && id) {
      fetchPolicy()
    }
  }, [contracts.insurance, isCorrectNetwork, id])

  const fetchPolicy = async () => {
    try {
      const policyData = await contracts.insurance.getPolicy(id)
      setPolicy(policyData)

      // Fetch claims for this policy
      const claimIds = await contracts.insurance.getClaimsByPolicy(id)
      const claimPromises = claimIds.map((claimId) => contracts.insurance.getClaim(claimId))
      const claimsData = await Promise.all(claimPromises)
      setClaims(claimsData)
    } catch (error) {
      console.error('Failed to fetch policy:', error)
      toast.error('Policy not found')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleInitiateClaim = async () => {
    if (!contracts.insurance) return

    setIsClaiming(true)
    try {
      const tx = await contracts.insurance.initiateClaim(id)
      toast.loading('Initiating claim...', { id: 'claim' })
      await tx.wait()
      toast.success('Claim initiated successfully!', { id: 'claim' })
      fetchPolicy()
    } catch (error) {
      console.error('Failed to initiate claim:', error)
      toast.error('Failed to initiate claim', { id: 'claim' })
    } finally {
      setIsClaiming(false)
    }
  }

  const handleCancelPolicy = async () => {
    if (!contracts.insurance) return

    setIsCancelling(true)
    try {
      const tx = await contracts.insurance.cancelPolicy(id)
      toast.loading('Cancelling policy...', { id: 'cancel' })
      await tx.wait()
      toast.success('Policy cancelled successfully!', { id: 'cancel' })
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to cancel policy:', error)
      toast.error('Failed to cancel policy', { id: 'cancel' })
    } finally {
      setIsCancelling(false)
    }
  }

  const getTriggerLabel = (triggerType) => {
    const types = Object.values(TRIGGER_TYPES)
    return types[triggerType]?.label || 'Unknown'
  }

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatThreshold = (triggerType, threshold) => {
    const value = Number(threshold) / 100
    if (triggerType === 0 || triggerType === 1) {
      return `${value} mm rainfall`
    } else if (triggerType === 2 || triggerType === 3) {
      return `${value}°C temperature`
    } else if (triggerType === 4) {
      return `${value} km/h wind speed`
    }
    return value
  }

  const getTimeRemaining = () => {
    if (!policy) return null
    const endTime = Number(policy.endTime) * 1000
    const now = Date.now()
    const diff = endTime - now

    if (diff <= 0) return 'Expired'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days} days, ${hours} hours remaining`
    return `${hours} hours remaining`
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="h-12 w-12 text-primary-500 animate-spin mx-auto" />
      </div>
    )
  }

  if (!policy) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Policy Not Found</h2>
        <Link to="/dashboard" className="text-primary-400 hover:text-primary-300">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  const status = POLICY_STATUS[policy.status]
  const isActive = policy.status === 0
  const isOwner = policy.policyholder.toLowerCase() === account?.toLowerCase()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      {/* Back Link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Policy #{policy.policyId.toString()}
          </h1>
          <div className="flex items-center gap-3">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
              {status.label}
            </span>
            {isActive && (
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {getTimeRemaining()}
              </span>
            )}
          </div>
        </div>
        {isOwner && isActive && (
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={handleInitiateClaim}
              disabled={isClaiming}
              className="btn btn-primary flex items-center gap-2"
            >
              {isClaiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              File Claim
            </button>
            <button
              onClick={handleCancelPolicy}
              disabled={isCancelling}
              className="btn btn-secondary text-red-400 hover:text-red-300 flex items-center gap-2"
            >
              {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Policy Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Coverage Details */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-400" />
            Coverage Details
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Protection Type</span>
              <span className="text-white font-medium">{getTriggerLabel(policy.triggerType)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Trigger Threshold</span>
              <span className="text-white font-medium">
                {formatThreshold(policy.triggerType, policy.triggerThreshold)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Coverage Amount</span>
              <span className="text-primary-400 font-bold">
                {ethers.formatEther(policy.coverageAmount)} FLR
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Premium Paid</span>
              <span className="text-white font-medium">
                {ethers.formatEther(policy.premium)} FLR
              </span>
            </div>
          </div>
        </div>

        {/* Farm Details */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary-400" />
            Farm Details
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Crop Type</span>
              <span className="text-white font-medium">{policy.cropType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Farm Size</span>
              <span className="text-white font-medium">
                {Number(policy.farmSize) / 100} hectares
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Location Hash</span>
              <span className="text-gray-400 font-mono text-xs truncate max-w-[150px]">
                {policy.locationHash}
              </span>
            </div>
          </div>
        </div>

        {/* Policy Period */}
        <div className="card md:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-400" />
            Policy Period
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Start Date</div>
              <div className="text-white font-medium">{formatDate(policy.startTime)}</div>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">End Date</div>
              <div className="text-white font-medium">{formatDate(policy.endTime)}</div>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Duration</div>
              <div className="text-white font-medium">
                {Math.ceil((Number(policy.endTime) - Number(policy.startTime)) / (24 * 60 * 60))} days
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Claims Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-400" />
          Claims History
        </h2>
        
        {claims.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No claims have been filed for this policy yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div
                key={claim.claimId.toString()}
                className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">Claim #{claim.claimId.toString()}</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      claim.processed
                        ? claim.payoutAmount > 0
                          ? 'bg-green-400/10 text-green-400'
                          : 'bg-gray-400/10 text-gray-400'
                        : 'bg-yellow-400/10 text-yellow-400'
                    }`}
                  >
                    {claim.processed ? (
                      claim.payoutAmount > 0 ? (
                        <>
                          <CheckCircle className="h-3 w-3" /> Paid
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" /> Denied
                        </>
                      )
                    ) : (
                      <>
                        <Clock className="h-3 w-3" /> Pending
                      </>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Filed</div>
                    <div className="text-white">{formatDate(claim.timestamp)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Actual Value</div>
                    <div className="text-white">
                      {claim.processed ? Number(claim.actualValue) / 100 : 'Pending'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Payout</div>
                    <div className="text-primary-400 font-medium">
                      {claim.processed ? `${ethers.formatEther(claim.payoutAmount)} FLR` : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Status</div>
                    <div className="text-white">{claim.processed ? 'Completed' : 'Processing'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
