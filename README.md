# WeatherShield DeFi 🌾🛡️

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://weathersheld-4ftzu61cn-hassan-mubiru-s-projects.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Flare Network](https://img.shields.io/badge/Built%20on-Flare%20Network-ff6b35)](https://flare.network)

> Decentralized Parametric Insurance Platform for Farmers on Flare Network

WeatherShield DeFi is a blockchain-based crop insurance platform that uses Flare Network's Data Connector (FDC) to automatically trigger insurance payouts based on verified real-world weather data.

**🌐 Live Demo:** [weathersheld.vercel.app](https://weathersheld-4ftzu61cn-hassan-mubiru-s-projects.vercel.app)

## 🌟 Features

- **Parametric Insurance**: Automatic payouts when weather conditions meet predefined triggers
- **Real-Time Weather Data**: Powered by Flare Data Connector for verified, tamper-proof data
- **Multiple Protection Types**: Drought, flood, frost, heat wave, and storm coverage
- **Instant Claims**: No paperwork, no delays - smart contracts handle everything
- **Transparent & Trustless**: All policies and payouts are verifiable on-chain
- **User-Friendly Interface**: Modern React frontend with wallet integration

## 🏗️ Architecture

```
weathershield-defi/
├── contracts/                    # Solidity smart contracts
│   ├── interfaces/               # Contract interfaces
│   │   ├── IFlareDataConnector.sol
│   │   └── IWeatherShieldInsurance.sol
│   ├── FlareDataConnector.sol    # FDC integration layer
│   ├── WeatherShieldInsurance.sol # Main insurance contract
│   ├── PolicyFactory.sol         # Factory for batch policies
│   └── WeatherOracle.sol         # Weather data oracle
├── frontend/                     # React frontend application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── contexts/             # React context providers
│   │   ├── pages/                # Page components
│   │   └── config/               # Configuration files
│   └── package.json
├── scripts/                      # Deployment scripts
├── test/                         # Contract tests
├── hardhat.config.js             # Hardhat configuration
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- MetaMask or compatible Web3 wallet
- Flare testnet tokens (C2FLR)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hassanmubiru/weathershield-defi.git
   cd weathershield-defi
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your private key and API keys
   ```

4. **Compile contracts**
   ```bash
   npm run compile
   ```

5. **Run tests**
   ```bash
   npm run test
   ```

### Deployment

1. **Deploy to Flare Testnet (Coston2)**
   ```bash
   npm run deploy:testnet
   ```

2. **Seed test data (optional)**
   ```bash
   npx hardhat run scripts/seed.js --network flareTestnet
   ```

3. **Update frontend configuration**
   - Copy deployed contract addresses from `deployments/flareTestnet.json`
   - Update `frontend/src/config/contracts.js` with the addresses

4. **Start frontend development server**
   ```bash
   npm run frontend:dev
   ```

### Deploy to Mainnet

```bash
npm run deploy:mainnet
```

## 📋 Smart Contracts

### WeatherShieldInsurance.sol
Main insurance contract that handles:
- Policy creation and management
- Premium calculation based on coverage and risk
- Claim initiation and processing
- Automatic payouts when conditions are met

### FlareDataConnector.sol
Integration layer for Flare Data Connector:
- Weather data requests and fulfillment
- Data verification and validation
- Historical data storage

### PolicyFactory.sol
Factory contract for:
- Policy template management
- Batch policy creation
- Premium estimation

### WeatherOracle.sol
Oracle contract for:
- Weather data recording
- Historical averages calculation
- Risk score assessment

## 🎯 Insurance Types

| Type | Description | Threshold Unit |
|------|-------------|----------------|
| Drought Protection | Payout when rainfall drops below threshold | mm |
| Flood Protection | Payout when rainfall exceeds threshold | mm |
| Frost Protection | Payout when temperature drops below threshold | °C |
| Heat Wave Protection | Payout when temperature exceeds threshold | °C |
| Storm Protection | Payout when wind speed exceeds threshold | km/h |

## 💰 Premium Calculation

Premiums are calculated based on:
- **Coverage Amount**: Higher coverage = higher premium
- **Duration**: Longer policies = higher premium
- **Risk Type**: Different weather risks have different multipliers
  - Drought: 1.2x
  - Flood: 1.5x
  - Frost: 1.1x
  - Heat Wave: 1.3x
  - Storm: 1.4x

Formula: `Premium = CoverageAmount × BaseRate × DurationMultiplier × RiskMultiplier`

## 🔐 Security

- ReentrancyGuard on all state-changing functions
- Pausable contract for emergency situations
- Owner-only administrative functions
- Input validation on all parameters
- Safe math operations (Solidity 0.8+)

## 🧪 Testing

Run the full test suite:
```bash
npm run test
```

Tests cover:
- Policy creation and cancellation
- Premium calculations
- Claim initiation and processing
- Weather data verification
- Access control
- Edge cases and error handling

## 🌐 Networks

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Flare Mainnet | 14 | https://flare-api.flare.network/ext/C/rpc |
| Coston2 Testnet | 114 | https://coston2-api.flare.network/ext/C/rpc |

## 🛠️ Development

### Project Structure

```
contracts/           # Solidity smart contracts
├── interfaces/      # Contract interfaces
├── *.sol           # Main contracts

frontend/           # React + Vite frontend
├── src/
│   ├── components/ # UI components
│   ├── contexts/   # React contexts (Web3)
│   ├── pages/      # Page components
│   └── config/     # Configuration

scripts/            # Hardhat scripts
├── deploy.js       # Deployment script
└── seed.js         # Test data seeding

test/               # Test files
└── WeatherShield.test.js
```

### Available Scripts

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to testnet
npm run deploy:testnet

# Deploy to mainnet
npm run deploy:mainnet

# Start frontend dev server
npm run frontend:dev

# Build frontend for production
npm run frontend:build
```

## 📖 API Reference

### Creating a Policy

```javascript
const tx = await insurance.createPolicy(
  locationHash,      // bytes32: Hash of farm coordinates
  triggerType,       // uint8: 0=Drought, 1=Flood, etc.
  triggerThreshold,  // int256: Threshold × 100 for precision
  coverageAmount,    // uint256: Coverage in wei
  duration,          // uint256: Duration in seconds
  cropType,          // string: Type of crop
  farmSize,          // uint256: Farm size × 100 (hectares)
  { value: premium } // Premium payment
);
```

### Filing a Claim

```javascript
// Initiate claim
const claimTx = await insurance.initiateClaim(policyId);
const receipt = await claimTx.wait();

// Wait for weather data verification...

// Process claim
const processTx = await insurance.processClaim(claimId);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Live Demo](https://weathersheld-4ftzu61cn-hassan-mubiru-s-projects.vercel.app)
- [GitHub Repository](https://github.com/hassanmubiru/weathershield-defi)
- [Flare Network](https://flare.network)
- [Flare Documentation](https://docs.flare.network)
- [Flare Data Connector](https://docs.flare.network/tech/data-connector)

## ⚠️ Disclaimer

This software is provided "as is" without warranty of any kind. Use at your own risk. This is experimental software and should not be used for production insurance without proper auditing and regulatory compliance.

---

Built with ❤️ by [Hassan Mubiru](https://github.com/hassanmubiru) on [Flare Network](https://flare.network)
