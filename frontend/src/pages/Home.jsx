import { Link } from 'react-router-dom'
import { useWeb3 } from '../contexts/Web3Context'
import { 
  Shield, 
  Cloud, 
  Zap, 
  Lock, 
  TrendingUp, 
  Users, 
  ArrowRight,
  CheckCircle,
  Droplets,
  Thermometer,
  Wind
} from 'lucide-react'

export default function Home() {
  const { account, connectWallet, isConnecting } = useWeb3()

  const features = [
    {
      icon: <Cloud className="h-8 w-8 text-primary-400" />,
      title: 'Real-Time Weather Data',
      description: 'Powered by Flare Data Connector for verified, tamper-proof weather information from trusted sources.',
    },
    {
      icon: <Zap className="h-8 w-8 text-flare-400" />,
      title: 'Instant Payouts',
      description: 'Automatic claim processing and payouts when weather conditions trigger your policy parameters.',
    },
    {
      icon: <Lock className="h-8 w-8 text-blue-400" />,
      title: 'Trustless & Transparent',
      description: 'Smart contracts ensure fair, auditable, and immutable insurance agreements on the blockchain.',
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-400" />,
      title: 'Affordable Premiums',
      description: 'Optimized risk assessment using historical data provides competitive insurance rates for farmers.',
    },
  ]

  const protectionTypes = [
    {
      icon: <Droplets className="h-6 w-6" />,
      title: 'Drought Protection',
      description: 'Coverage when rainfall falls below your threshold',
      color: 'text-yellow-400',
    },
    {
      icon: <Droplets className="h-6 w-6" />,
      title: 'Flood Protection',
      description: 'Coverage when rainfall exceeds safe levels',
      color: 'text-blue-400',
    },
    {
      icon: <Thermometer className="h-6 w-6" />,
      title: 'Frost Protection',
      description: 'Coverage when temperatures drop too low',
      color: 'text-cyan-400',
    },
    {
      icon: <Thermometer className="h-6 w-6" />,
      title: 'Heat Wave Protection',
      description: 'Coverage when temperatures rise too high',
      color: 'text-red-400',
    },
    {
      icon: <Wind className="h-6 w-6" />,
      title: 'Storm Protection',
      description: 'Coverage when wind speeds become dangerous',
      color: 'text-purple-400',
    },
  ]

  const stats = [
    { label: 'Farmers Protected', value: '1,000+' },
    { label: 'Claims Processed', value: '$2M+' },
    { label: 'Average Payout Time', value: '< 24h' },
    { label: 'Coverage Available', value: '$50M+' },
  ]

  const steps = [
    { step: 1, title: 'Connect Wallet', description: 'Connect your MetaMask or Flare wallet to get started' },
    { step: 2, title: 'Select Protection', description: 'Choose the weather risk you want to insure against' },
    { step: 3, title: 'Set Parameters', description: 'Define your farm location, coverage amount, and trigger conditions' },
    { step: 4, title: 'Get Covered', description: 'Pay your premium and your policy is immediately active' },
  ]

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20">
                <Shield className="h-4 w-4 mr-2" />
                Powered by Flare Network
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Protect Your Crops with{' '}
              <span className="gradient-text">Decentralized Weather Insurance</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Parametric insurance that automatically pays out when weather conditions 
              threaten your harvest. No paperwork, no delays, no middlemen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {account ? (
                <Link to="/create-policy" className="btn btn-primary flex items-center justify-center gap-2">
                  Get Insurance Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="btn btn-primary flex items-center justify-center gap-2"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet to Start'}
                  <ArrowRight className="h-5 w-5" />
                </button>
              )}
              <Link to="/about" className="btn btn-outline">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-800 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose WeatherShield?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Traditional crop insurance is slow, bureaucratic, and often unfair. 
              We're changing that with blockchain technology.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card hover:border-primary-500/50 transition-colors group"
              >
                <div className="mb-4 transform group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protection Types Section */}
      <section className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Comprehensive Weather Protection
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Choose from multiple types of weather insurance to protect your specific crops and risks.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {protectionTypes.map((type, index) => (
              <div
                key={index}
                className="card text-center hover:border-gray-600 transition-colors"
              >
                <div className={`${type.color} mb-3 flex justify-center`}>
                  {type.icon}
                </div>
                <h3 className="text-white font-semibold mb-1">{type.title}</h3>
                <p className="text-gray-500 text-xs">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Getting protected is simple. Follow these four easy steps.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={index} className="relative">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-14 w-full h-0.5 bg-gradient-to-r from-primary-500 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-900/50 to-flare-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Protect Your Farm?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers who trust WeatherShield for their crop insurance needs. 
            Get instant coverage with transparent, blockchain-verified policies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {account ? (
              <Link to="/create-policy" className="btn btn-primary flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Create Your First Policy
              </Link>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn btn-primary flex items-center justify-center gap-2"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
            <Link to="/dashboard" className="btn btn-secondary flex items-center justify-center gap-2">
              <Users className="h-5 w-5" />
              View Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
