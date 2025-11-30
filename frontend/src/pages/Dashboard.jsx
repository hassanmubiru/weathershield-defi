import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWeb3 } from '../contexts/Web3Context'
import { ethers } from 'ethers'
import { 
  Shield, 
  Plus, 
  AlertCircle, 
  TrendingUp, 
  Clock,
  FileText,
  Loader2
} from 'lucide-react'
import { POLICY_STATUS, TRIGGER_TYPES } from '../config/contracts'

export default function Dashboard() {
  const { account, contracts, isCorrectNetwork } = useWeb3()
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activePolicies: 0,
    totalCoverage: '0',
    totalPremiums: '0',
    claimsPaid: '0',
  })

  useEffect(() => {
    if (account && contracts.insurance && isCorrectNetwork) {
      fetchPolicies()
      fetchStats()
    } else {
      setLoading(false)
    }
  }, [account, contracts.insurance, isCorrectNetwork])

  const fetchPolicies = async () => {
    try {
      const policyIds = await contracts.insurance.getPoliciesByHolder(account)
      const policyPromises = policyIds.map((id) => contracts.insurance.getPolicy(id))
      const policyData = await Promise.all(policyPromises)
      setPolicies(policyData)
    } catch (error) {
      console.error('Failed to fetch policies:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [treasuryBalance, totalPremiums, totalClaims] = await Promise.all([
        contracts.insurance.treasuryBalance(),
        contracts.insurance.totalPremiumsCollected(),
        contracts.insurance.totalClaimsPaid(),
      ])

      setStats({
        activePolicies: policies.filter((p) => p.status === 0).length,
        totalCoverage: ethers.formatEther(treasuryBalance),
        totalPremiums: ethers.formatEther(totalPremiums),
        claimsPaid: ethers.formatEther(totalClaims),
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const getTriggerLabel = (triggerType) => {
    const types = Object.values(TRIGGER_TYPES)
    return types[triggerType]?.label || 'Unknown'
  }

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatThreshold = (triggerType, threshold) => {
    const value = Number(threshold) / 100
    if (triggerType === 0 || triggerType === 1) {
      return `${value} mm`
    } else if (triggerType === 2 || triggerType === 3) {
      return `${value}°C`
    } else if (triggerType === 4) {
      return `${value} km/h`
    }
    return value
  }

  if (!account) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to view your insurance dashboard.
          </p>
        </div>
      </div>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Wrong Network</h2>
          <p className="text-gray-400 mb-6">
            Please switch to Flare Network to view your dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Manage your insurance policies and claims</p>
        </div>
        <Link to="/create-policy" className="btn btn-primary mt-4 md:mt-0 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          New Policy
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Active Policies</span>
            <Shield className="h-5 w-5 text-primary-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {policies.filter((p) => p.status === 0).length}
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Coverage</span>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {policies.reduce((sum, p) => sum + Number(ethers.formatEther(p.coverageAmount)), 0).toFixed(2)} FLR
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Premiums Paid</span>
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {policies.reduce((sum, p) => sum + Number(ethers.formatEther(p.premium)), 0).toFixed(4)} FLR
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Claims Received</span>
            <Clock className="h-5 w-5 text-flare-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {policies.filter((p) => p.status === 2).length}
          </div>
        </div>
      </div>

      {/* Policies List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Your Policies</h2>
          <span className="text-sm text-gray-400">{policies.length} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : policies.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Policies Yet</h3>
            <p className="text-gray-400 mb-6">
              You haven't created any insurance policies. Get started by creating your first policy.
            </p>
            <Link to="/create-policy" className="btn btn-primary">
              Create First Policy
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Protection Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Crop</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Threshold</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Coverage</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Expires</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => {
                  const status = POLICY_STATUS[policy.status]
                  return (
                    <tr key={policy.policyId.toString()} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-4 px-4 text-white">#{policy.policyId.toString()}</td>
                      <td className="py-4 px-4 text-white">{getTriggerLabel(policy.triggerType)}</td>
                      <td className="py-4 px-4 text-gray-300">{policy.cropType}</td>
                      <td className="py-4 px-4 text-gray-300">
                        {formatThreshold(policy.triggerType, policy.triggerThreshold)}
                      </td>
                      <td className="py-4 px-4 text-white font-medium">
                        {ethers.formatEther(policy.coverageAmount)} FLR
                      </td>
                      <td className="py-4 px-4 text-gray-300">{formatDate(policy.endTime)}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          to={`/policy/${policy.policyId}`}
                          className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
