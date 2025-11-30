import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'
import { CONTRACTS, NETWORK_CONFIG } from '../config/contracts'

const Web3Context = createContext(null)

export function useWeb3() {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [contracts, setContracts] = useState({
    insurance: null,
    factory: null,
    fdc: null,
    oracle: null,
  })

  const isCorrectNetwork = chainId === NETWORK_CONFIG.chainId

  const initializeContracts = useCallback(async (signerOrProvider) => {
    try {
      const insurance = new ethers.Contract(
        CONTRACTS.WeatherShieldInsurance.address,
        CONTRACTS.WeatherShieldInsurance.abi,
        signerOrProvider
      )

      const factory = new ethers.Contract(
        CONTRACTS.PolicyFactory.address,
        CONTRACTS.PolicyFactory.abi,
        signerOrProvider
      )

      const fdc = new ethers.Contract(
        CONTRACTS.FlareDataConnector.address,
        CONTRACTS.FlareDataConnector.abi,
        signerOrProvider
      )

      const oracle = new ethers.Contract(
        CONTRACTS.WeatherOracle.address,
        CONTRACTS.WeatherOracle.abi,
        signerOrProvider
      )

      setContracts({ insurance, factory, fdc, oracle })
    } catch (error) {
      console.error('Failed to initialize contracts:', error)
    }
  }, [])

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask or another Web3 wallet')
      return
    }

    setIsConnecting(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const network = await provider.getNetwork()

      setProvider(provider)
      setSigner(signer)
      setAccount(accounts[0])
      setChainId(Number(network.chainId))

      await initializeContracts(signer)

      toast.success('Wallet connected successfully!')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      toast.error('Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setChainId(null)
    setContracts({
      insurance: null,
      factory: null,
      fdc: null,
      oracle: null,
    })
    toast.success('Wallet disconnected')
  }

  const switchNetwork = async () => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
      })
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
                chainName: NETWORK_CONFIG.name,
                nativeCurrency: NETWORK_CONFIG.nativeCurrency,
                rpcUrls: [NETWORK_CONFIG.rpcUrl],
                blockExplorerUrls: [NETWORK_CONFIG.explorerUrl],
              },
            ],
          })
        } catch (addError) {
          console.error('Failed to add network:', addError)
          toast.error('Failed to add Flare network')
        }
      } else {
        console.error('Failed to switch network:', error)
        toast.error('Failed to switch network')
      }
    }
  }

  // Handle account changes
  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else if (accounts[0] !== account) {
        setAccount(accounts[0])
        toast.success('Account changed')
      }
    }

    const handleChainChanged = (chainId) => {
      setChainId(Number(chainId))
      window.location.reload()
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [account])

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      // Initialize with read-only provider first
      const readOnlyProvider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl)
      await initializeContracts(readOnlyProvider)

      if (!window.ethereum) return

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          await connectWallet()
        }
      } catch (error) {
        console.error('Auto-connect failed:', error)
      }
    }

    autoConnect()
  }, [])

  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    isCorrectNetwork,
    contracts,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}
