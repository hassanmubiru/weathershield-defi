import { Link, useLocation } from 'react-router-dom'
import { useWeb3 } from '../contexts/Web3Context'
import { Menu, X, Wallet, Shield, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { account, isConnecting, isCorrectNetwork, connectWallet, disconnectWallet, switchNetwork } = useWeb3()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/create-policy', label: 'Buy Insurance' },
    { path: '/claims', label: 'Claims' },
    { path: '/about', label: 'About' },
  ]

  const isActive = (path) => location.pathname === path

  const formatAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <nav className="border-b border-gray-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold gradient-text">WeatherShield</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-3">
            {account && !isCorrectNetwork && (
              <button
                onClick={switchNetwork}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-500/20 transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Switch Network</span>
              </button>
            )}

            {account ? (
              <button
                onClick={disconnectWallet}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Wallet className="h-4 w-4 text-primary-400" />
                <span>{formatAddress(account)}</span>
              </button>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Wallet className="h-4 w-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-fadeIn">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-gray-800">
              {account ? (
                <button
                  onClick={() => {
                    disconnectWallet()
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium"
                >
                  <Wallet className="h-4 w-4 text-primary-400" />
                  <span>{formatAddress(account)}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    connectWallet()
                    setIsMobileMenuOpen(false)
                  }}
                  disabled={isConnecting}
                  className="w-full btn btn-primary flex items-center justify-center space-x-2"
                >
                  <Wallet className="h-4 w-4" />
                  <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
