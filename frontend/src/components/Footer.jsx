import { Link } from 'react-router-dom'
import { Shield, Github, Twitter, Globe } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold gradient-text">WeatherShield</span>
            </Link>
            <p className="text-gray-400 text-sm max-w-md">
              Decentralized parametric insurance for farmers, powered by Flare Network's 
              Data Connector for verified real-world weather data.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/create-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Buy Insurance
                </Link>
              </li>
              <li>
                <Link to="/claims" className="text-gray-400 hover:text-white text-sm transition-colors">
                  File Claim
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="https://flare.network" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Flare Network
                </a>
              </li>
              <li>
                <a href="https://docs.flare.network" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2025 WeatherShield DeFi. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm mt-4 md:mt-0">
            Built on <span className="text-flare-400">Flare Network</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
