import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWeb3 } from '../contexts/Web3Context'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Shield,
  RefreshCw
} from 'lucide-react'
import { POLICY_STATUS } from '../config/contracts'

export default function Claims() {
  const { account, contracts, isCorrectNetwork } = useWeb3()
  const [policies, setPolicies] = useState([])
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingClaim, setProcessingClaim] = useState(null)

  useEffect(() => {
    if (account && contracts.insurance && isCorrectNetwork) {
      fetchPoliciesAndClaims()
    } else {
      setLoading(false)
    }
  }, [account, contracts.insurance, isCorrectNetwork])

  const fetchPoliciesAndClaims = async () => {
    try {
      const policyIds = await contracts.insurance.getPoliciesByHolder(account)
      const policyPromises = policyIds.map((id) => contracts.insurance.getPolicy(id))
      const policyData = await Promise.all(policyPromises)
      setPolicies(policyData)

      // Fetch claims for each policy
      const allClaims = []
      for (const policy of policyData) {
        const claimIds = await contracts.insurance.getClaimsByPolicy(policy.policyId)
        for (const claimId of claimIds) {
          const claim = await contracts.insurance.getClaim(claimId)
          allClaims.push({ ...claim, policy })
        }
      }
      setClaims(allClaims)
    } catch (error) {
      console.error('Failed to fetch claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessClaim = async (claimId) => {
    if (!contracts.insurance) return

    setProcessingClaim(claimId)
    try {
      const tx = await contracts.insurance.processClaim(claimId)
      toast.loading('Processing claim...', { id: `process-${claimId}` })
      await tx.wait()
      toast.success('Claim processed successfully!', { id: `process-${claimId}` })
      fetchPoliciesAndClaims()
    } catch (error) {
      console.error('Failed to process claim:', error)
      const message = error.reason || 'Failed to process claim. Weather data may not be ready yet.'
      toast.error(message, { id: `process-${claimId}` })
    } finally {
      setProcessingClaim(null)
    }
  }

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getClaimStatus = (claim) => {
    if (!claim.processed) {
      return {
        label: 'Pending',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10',
        icon: <Clock className="h-4 w-4" />,
      }
    }
    if (claim.payoutAmount > 0) {
      return {
        label: 'Paid',
        color: 'text-green-400',
        bgColor: 'bg-green-400/10',
        icon: <CheckCircle className="h-4 w-4" />,
      }
    }
    return {
      label: 'Denied',
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      icon: <XCircle className="h-4 w-4" />,
    }
  }

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Please connect your wallet to view your claims.</p>
      </div>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Wrong Network</h2>
        <p className="text-gray-400">Please switch to Flare Network to view your claims.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Claims</h1>
          <p className="text-gray-400">Track and manage your insurance claims</p>
        </div>
        <button
          onClick={fetchPoliciesAndClaims}
          disabled={loading}
          className="btn btn-secondary mt-4 md:mt-0 flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Active Policies for New Claims */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Active Policies</h2>
        {policies.filter((p) => p.status === 0).length === 0 ? (
          <div className="text-center py-6">
            <Shield className="h-10 w-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No active policies to file claims against.</p>
            <Link to="/create-policy" className="text-primary-400 hover:text-primary-300 text-sm">
              Create a new policy
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {policies
              .filter((p) => p.status === 0)
              .map((policy) => (
                <div
                  key={policy.policyId.toString()}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">Policy #{policy.policyId.toString()}</span>
                    <span className="text-xs text-gray-400">{policy.cropType}</span>
                  </div>
                  <div className="text-primary-400 font-bold mb-3">
                    {ethers.formatEther(policy.coverageAmount)} FLR
                  </div>
                  <Link
                    to={`/policy/${policy.policyId}`}
                    className="text-sm text-primary-400 hover:text-primary-300"
                  >
                    View & File Claim →
                  </Link>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Claims History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Claims History</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Claims Yet</h3>
            <p className="text-gray-400 mb-4">
              You haven't filed any claims. Claims are filed when weather conditions trigger your policy.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Claim ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Policy</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Filed</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actual Value</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Payout</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => {
                  const status = getClaimStatus(claim)
                  return (
                    <tr key={claim.claimId.toString()} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-4 px-4 text-white">#{claim.claimId.toString()}</td>
                      <td className="py-4 px-4">
                        <Link
                          to={`/policy/${claim.policyId}`}
                          className="text-primary-400 hover:text-primary-300"
                        >
                          #{claim.policyId.toString()}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-gray-300">{formatDate(claim.timestamp)}</td>
                      <td className="py-4 px-4 text-gray-300">
                        {claim.processed ? Number(claim.actualValue) / 100 : '-'}
                      </td>
                      <td className="py-4 px-4 text-white font-medium">
                        {claim.processed ? `${ethers.formatEther(claim.payoutAmount)} FLR` : '-'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {!claim.processed && (
                          <button
                            onClick={() => handleProcessClaim(claim.claimId)}
                            disabled={processingClaim === claim.claimId}
                            className="text-sm text-primary-400 hover:text-primary-300 disabled:opacity-50"
                          >
                            {processingClaim === claim.claimId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Process'
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-medium mb-1">How Claims Work</h3>
            <p className="text-gray-400 text-sm">
              When you file a claim, weather data is requested from the Flare Data Connector (FDC).
              Once the data is verified and available, you can process the claim to determine if your
              policy conditions are met. If they are, the payout is automatically sent to your wallet.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
