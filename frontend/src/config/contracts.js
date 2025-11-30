// Contract ABIs and addresses
// These should be updated after deployment

export const NETWORK_CONFIG = {
  chainId: 114, // Flare Coston2 Testnet
  name: 'Flare Coston2 Testnet',
  rpcUrl: 'https://coston2-api.flare.network/ext/C/rpc',
  explorerUrl: 'https://coston2-explorer.flare.network',
  nativeCurrency: {
    name: 'Coston2 Flare',
    symbol: 'C2FLR',
    decimals: 18,
  },
}

// Contract addresses - Update these after deployment
export const CONTRACT_ADDRESSES = {
  FlareDataConnector: '0xF61C82188F0e4DF9082a703D8276647941b4E4f7',
  WeatherShieldInsurance: '0x0982Cd8B1122bA2134BF44A137bE814708Fd821F',
  PolicyFactory: '0x71b6977A253643378e0c5f05BA6DCF7295aBD4FA',
  WeatherOracle: '0x01C22438586BDD5a8d8481F409f841F35B2281fA',
}

// Minimal ABIs for frontend interaction
const WeatherShieldInsuranceABI = [
  'function createPolicy(bytes32 locationHash, uint8 triggerType, int256 triggerThreshold, uint256 coverageAmount, uint256 duration, string cropType, uint256 farmSize) payable returns (uint256)',
  'function cancelPolicy(uint256 policyId)',
  'function initiateClaim(uint256 policyId) returns (uint256)',
  'function processClaim(uint256 claimId)',
  'function getPolicy(uint256 policyId) view returns (tuple(uint256 policyId, address policyholder, bytes32 locationHash, uint8 triggerType, int256 triggerThreshold, uint256 premium, uint256 coverageAmount, uint256 startTime, uint256 endTime, uint8 status, string cropType, uint256 farmSize))',
  'function getClaim(uint256 claimId) view returns (tuple(uint256 claimId, uint256 policyId, uint256 timestamp, int256 actualValue, uint256 payoutAmount, bool processed, bytes32 weatherDataRequestId))',
  'function getPoliciesByHolder(address holder) view returns (uint256[])',
  'function getClaimsByPolicy(uint256 policyId) view returns (uint256[])',
  'function calculatePremium(uint256 coverageAmount, uint256 duration, uint8 triggerType) view returns (uint256)',
  'function getPolicyCount() view returns (uint256)',
  'function getClaimCount() view returns (uint256)',
  'function treasuryBalance() view returns (uint256)',
  'function totalPremiumsCollected() view returns (uint256)',
  'function totalClaimsPaid() view returns (uint256)',
  'event PolicyCreated(uint256 indexed policyId, address indexed policyholder, bytes32 locationHash)',
  'event PolicyCancelled(uint256 indexed policyId, address indexed policyholder)',
  'event ClaimInitiated(uint256 indexed claimId, uint256 indexed policyId, address indexed policyholder)',
  'event ClaimProcessed(uint256 indexed claimId, uint256 indexed policyId, uint256 payoutAmount)',
]

const PolicyFactoryABI = [
  {
    "inputs": [{"internalType": "uint256","name": "templateId","type": "uint256"},{"internalType": "bytes32","name": "locationHash","type": "bytes32"},{"internalType": "uint256","name": "baseCoverage","type": "uint256"},{"internalType": "string","name": "cropType","type": "string"},{"internalType": "uint256","name": "farmSize","type": "uint256"}],
    "name": "createPolicyFromTemplate",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "templateId","type": "uint256"},{"internalType": "uint256","name": "baseCoverage","type": "uint256"}],
    "name": "estimatePremium",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveTemplates",
    "outputs": [{"components": [{"internalType": "string","name": "name","type": "string"},{"internalType": "uint8","name": "triggerType","type": "uint8"},{"internalType": "int256","name": "triggerThreshold","type": "int256"},{"internalType": "uint256","name": "coverageMultiplier","type": "uint256"},{"internalType": "uint256","name": "duration","type": "uint256"},{"internalType": "bool","name": "isActive","type": "bool"}],"internalType": "struct PolicyFactory.PolicyTemplate[]","name": "","type": "tuple[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "templateId","type": "uint256"}],
    "name": "templates",
    "outputs": [{"internalType": "string","name": "name","type": "string"},{"internalType": "uint8","name": "triggerType","type": "uint8"},{"internalType": "int256","name": "triggerThreshold","type": "int256"},{"internalType": "uint256","name": "coverageMultiplier","type": "uint256"},{"internalType": "uint256","name": "duration","type": "uint256"},{"internalType": "bool","name": "isActive","type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "templateCount",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

const FlareDataConnectorABI = [
  {
    "inputs": [{"internalType": "int256","name": "latitude","type": "int256"},{"internalType": "int256","name": "longitude","type": "int256"}],
    "name": "createLocationHash",
    "outputs": [{"internalType": "bytes32","name": "","type": "bytes32"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32","name": "requestId","type": "bytes32"}],
    "name": "getWeatherData",
    "outputs": [{"components": [{"internalType": "uint256","name": "timestamp","type": "uint256"},{"internalType": "int256","name": "temperature","type": "int256"},{"internalType": "uint256","name": "rainfall","type": "uint256"},{"internalType": "uint256","name": "humidity","type": "uint256"},{"internalType": "uint256","name": "windSpeed","type": "uint256"},{"internalType": "bytes32","name": "locationHash","type": "bytes32"},{"internalType": "bool","name": "isVerified","type": "bool"}],"internalType": "struct FlareDataConnector.WeatherData","name": "","type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32","name": "locationHash","type": "bytes32"}],
    "name": "getLatestWeatherData",
    "outputs": [{"components": [{"internalType": "uint256","name": "timestamp","type": "uint256"},{"internalType": "int256","name": "temperature","type": "int256"},{"internalType": "uint256","name": "rainfall","type": "uint256"},{"internalType": "uint256","name": "humidity","type": "uint256"},{"internalType": "uint256","name": "windSpeed","type": "uint256"},{"internalType": "bytes32","name": "locationHash","type": "bytes32"},{"internalType": "bool","name": "isVerified","type": "bool"}],"internalType": "struct FlareDataConnector.WeatherData","name": "","type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32","name": "requestId","type": "bytes32"}],
    "name": "isDataAvailable",
    "outputs": [{"internalType": "bool","name": "available","type": "bool"},{"internalType": "bool","name": "verified","type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
]

const WeatherOracleABI = [
  'function getWeatherHistory(bytes32 locationHash, uint256 startIndex, uint256 count) view returns (tuple(uint256 timestamp, int256 temperature, uint256 rainfall, uint256 humidity, uint256 windSpeed, bytes32 sourceHash)[])',
  'function getWeatherHistoryCount(bytes32 locationHash) view returns (uint256)',
  'function getLatestWeather(bytes32 locationHash) view returns (tuple(uint256 timestamp, int256 temperature, uint256 rainfall, uint256 humidity, uint256 windSpeed, bytes32 sourceHash))',
  'function getWeatherAverages(bytes32 locationHash) view returns (tuple(int256 avgTemperature, uint256 avgRainfall, uint256 avgHumidity, uint256 avgWindSpeed, uint256 dataPoints, uint256 lastUpdated))',
  'function calculateRiskScore(bytes32 locationHash, uint8 triggerType, int256 threshold) view returns (uint256)',
]

export const CONTRACTS = {
  WeatherShieldInsurance: {
    address: CONTRACT_ADDRESSES.WeatherShieldInsurance,
    abi: WeatherShieldInsuranceABI,
  },
  PolicyFactory: {
    address: CONTRACT_ADDRESSES.PolicyFactory,
    abi: PolicyFactoryABI,
  },
  FlareDataConnector: {
    address: CONTRACT_ADDRESSES.FlareDataConnector,
    abi: FlareDataConnectorABI,
  },
  WeatherOracle: {
    address: CONTRACT_ADDRESSES.WeatherOracle,
    abi: WeatherOracleABI,
  },
}

// Trigger type mappings
export const TRIGGER_TYPES = {
  RainfallBelow: { value: 0, label: 'Drought Protection', description: 'Payout when rainfall drops below threshold' },
  RainfallAbove: { value: 1, label: 'Flood Protection', description: 'Payout when rainfall exceeds threshold' },
  TemperatureBelow: { value: 2, label: 'Frost Protection', description: 'Payout when temperature drops below threshold' },
  TemperatureAbove: { value: 3, label: 'Heat Wave Protection', description: 'Payout when temperature exceeds threshold' },
  WindSpeedAbove: { value: 4, label: 'Storm Protection', description: 'Payout when wind speed exceeds threshold' },
}

// Policy status mappings
export const POLICY_STATUS = {
  0: { label: 'Active', color: 'text-green-400', bgColor: 'bg-green-400/10' },
  1: { label: 'Expired', color: 'text-gray-400', bgColor: 'bg-gray-400/10' },
  2: { label: 'Claim Paid', color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  3: { label: 'Cancelled', color: 'text-red-400', bgColor: 'bg-red-400/10' },
}

// Common crop types
export const CROP_TYPES = [
  'Wheat',
  'Corn',
  'Rice',
  'Soybeans',
  'Cotton',
  'Sugarcane',
  'Coffee',
  'Cocoa',
  'Vegetables',
  'Fruits',
  'Other',
]
