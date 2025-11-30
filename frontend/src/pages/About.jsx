import { Link } from 'react-router-dom'
import {
  Shield,
  Cloud,
  Zap,
  Lock,
  Globe,
  Users,
  CheckCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react'

export default function About() {
  const features = [
    {
      icon: <Cloud className="h-6 w-6" />,
      title: 'Flare Data Connector (FDC)',
      description:
        'We leverage Flare Network\'s unique Data Connector to bring verified, real-world weather data on-chain. This ensures that all weather-related triggers are accurate and tamper-proof.',
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Parametric Insurance Model',
      description:
        'Our parametric approach means payouts are triggered automatically when predefined conditions are met. No claims adjusters, no paperwork, no delays.',
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: 'Smart Contract Security',
      description:
        'All policies are managed by audited smart contracts on the Flare blockchain. Your premiums are safe, and payouts are guaranteed when conditions are met.',
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Global Accessibility',
      description:
        'Anyone with a wallet can access our insurance products. We\'re bringing financial protection to farmers worldwide, regardless of their location.',
    },
  ]

  const team = [
    {
      name: 'Smart Contract Team',
      role: 'Solidity Development',
      description: 'Building secure and efficient insurance protocols',
    },
    {
      name: 'Oracle Integration Team',
      role: 'FDC Integration',
      description: 'Connecting real-world data to blockchain',
    },
    {
      name: 'Frontend Team',
      role: 'User Experience',
      description: 'Creating intuitive interfaces for farmers',
    },
  ]

  const faqs = [
    {
      question: 'How does parametric insurance work?',
      answer:
        'Parametric insurance pays out when a specific, measurable event occurs (like rainfall below a certain threshold), rather than requiring proof of actual loss. This enables faster, more transparent claim processing.',
    },
    {
      question: 'How is weather data verified?',
      answer:
        'We use Flare Network\'s Data Connector (FDC) which aggregates weather data from multiple trusted sources and verifies it through decentralized consensus before bringing it on-chain.',
    },
    {
      question: 'How fast are payouts?',
      answer:
        'Once weather conditions trigger your policy parameters, payouts are typically processed within 24 hours. The smart contract automatically executes the payout without any manual intervention.',
    },
    {
      question: 'What crops can I insure?',
      answer:
        'You can insure any crop type against weather risks including drought, flooding, frost, heat waves, and storms. The coverage is location-based using GPS coordinates of your farm.',
    },
    {
      question: 'Are my funds safe?',
      answer:
        'Yes. All funds are held in audited smart contracts on the Flare blockchain. The treasury is funded to ensure all claims can be paid, and the protocol is designed to be solvent at all times.',
    },
  ]

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About <span className="gradient-text">WeatherShield</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            We're building the future of agricultural insurance using blockchain technology 
            and decentralized oracle networks to protect farmers worldwide.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-slate-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Traditional crop insurance is broken. It's slow, expensive, and often inaccessible 
              to the farmers who need it most. We're changing that by leveraging blockchain 
              technology to create a fairer, faster, and more transparent insurance system.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="card">
              <Users className="h-10 w-10 text-primary-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Testnet Live</h3>
              <p className="text-gray-400 text-sm">On Flare Coston2</p>
            </div>
            <div className="card">
              <Shield className="h-10 w-10 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Instant</h3>
              <p className="text-gray-400 text-sm">Claim Processing</p>
            </div>
            <div className="card">
              <Zap className="h-10 w-10 text-flare-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">24/7</h3>
              <p className="text-gray-400 text-sm">Weather Monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Technology</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built on Flare Network, the blockchain designed specifically for connecting 
              real-world data with decentralized applications.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card hover:border-primary-500/30 transition-colors">
                <div className="text-primary-400 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-slate-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Purchase a Policy</h3>
                <p className="text-gray-400">
                  Connect your wallet, select the weather risk you want to insure against, 
                  set your coverage amount and trigger parameters, and pay your premium.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Weather Monitoring</h3>
                <p className="text-gray-400">
                  The Flare Data Connector continuously monitors weather conditions for your 
                  farm location using data from trusted weather APIs and oracle networks.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">File a Claim</h3>
                <p className="text-gray-400">
                  When weather conditions potentially meet your trigger parameters, you can 
                  file a claim. Weather data is then fetched and verified on-chain.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Automatic Payout</h3>
                <p className="text-gray-400">
                  If the verified weather data confirms your trigger conditions were met, 
                  the smart contract automatically sends your coverage amount to your wallet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="card">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-gray-400 pl-7">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flare Network Section */}
      <section className="py-16 bg-gradient-to-r from-flare-900/30 to-primary-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Built on Flare Network</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Flare is the blockchain for data, providing decentralized access to high-integrity 
            data from other chains and the internet. Perfect for building real-world insurance applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://flare.network"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary flex items-center justify-center gap-2"
            >
              Learn About Flare
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href="https://docs.flare.network"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline flex items-center justify-center gap-2"
            >
              Read Documentation
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Protected?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join the future of agricultural insurance. Protect your crops with transparent, 
            automated, blockchain-based coverage.
          </p>
          <Link to="/create-policy" className="btn btn-primary inline-flex items-center gap-2">
            Get Started Now
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
