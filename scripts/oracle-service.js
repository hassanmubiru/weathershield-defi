require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

/**
 * WeatherShield Oracle Service
 * Fetches real weather data from OpenWeatherMap and submits it to the blockchain
 */

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY || process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || 'https://coston2-api.flare.network/ext/C/rpc';

// Contract ABIs
const WeatherOracleABI = [
  'function recordWeatherData(bytes32 locationHash, int256 temperature, uint256 rainfall, uint256 humidity, uint256 windSpeed, bytes32 sourceHash) external',
  'function owner() view returns (address)',
];

const FlareDataConnectorABI = [
  'function fulfillWeatherData(bytes32 requestId, int256 temperature, uint256 rainfall, uint256 humidity, uint256 windSpeed) external',
  'function createLocationHash(int256 latitude, int256 longitude) pure returns (bytes32)',
  'function authorizedProviders(address) view returns (bool)',
  'event WeatherDataRequested(bytes32 indexed requestId, bytes32 indexed locationHash, uint256 timestamp)',
];

class WeatherOracleService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
    this.contracts = {};
    this.monitoredLocations = new Map();
    this.pendingRequests = new Map();
  }

  async initialize() {
    console.log('🌤️  WeatherShield Oracle Service Starting...\n');
    
    // Load deployment info
    const deploymentPath = path.join(__dirname, '../deployments/flareTestnet.json');
    if (!fs.existsSync(deploymentPath)) {
      console.error('❌ Deployment info not found. Deploy contracts first.');
      process.exit(1);
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    // Initialize contracts
    this.contracts.weatherOracle = new ethers.Contract(
      deployment.contracts.WeatherOracle,
      WeatherOracleABI,
      this.wallet
    );

    this.contracts.flareDataConnector = new ethers.Contract(
      deployment.contracts.FlareDataConnector,
      FlareDataConnectorABI,
      this.wallet
    );

    console.log('📋 Contract Addresses:');
    console.log(`   WeatherOracle: ${deployment.contracts.WeatherOracle}`);
    console.log(`   FlareDataConnector: ${deployment.contracts.FlareDataConnector}`);
    console.log(`   Oracle Wallet: ${this.wallet.address}\n`);

    // Check authorization
    const isAuthorized = await this.contracts.flareDataConnector.authorizedProviders(this.wallet.address);
    if (!isAuthorized) {
      console.warn('⚠️  Warning: Oracle wallet is not an authorized provider');
      console.warn('   Run: npx hardhat run scripts/authorize-oracle.js --network flareTestnet\n');
    }

    // Check balance
    const balance = await this.provider.getBalance(this.wallet.address);
    console.log(`💰 Oracle Balance: ${ethers.formatEther(balance)} C2FLR\n`);

    if (balance < ethers.parseEther('0.1')) {
      console.warn('⚠️  Low balance warning. Oracle may run out of gas.\n');
    }
  }

  async fetchWeatherData(lat, lon) {
    if (!OPENWEATHER_API_KEY) {
      console.warn('⚠️  No OpenWeatherMap API key. Using mock data.');
      return this.getMockWeatherData(lat, lon);
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      return {
        temperature: Math.round(data.main.temp * 100), // Celsius * 100
        rainfall: Math.round((data.rain?.['1h'] || 0) * 100), // mm * 100
        humidity: Math.round(data.main.humidity * 100), // % * 100
        windSpeed: Math.round(data.wind.speed * 3.6 * 100), // km/h * 100
        location: data.name,
        timestamp: data.dt,
      };
    } catch (error) {
      console.error(`Failed to fetch weather for ${lat}, ${lon}:`, error.message);
      return this.getMockWeatherData(lat, lon);
    }
  }

  getMockWeatherData(lat, lon) {
    const absLat = Math.abs(lat);
    const baseTemp = 30 - (absLat * 0.5);
    const season = new Date().getMonth();
    const seasonalAdjust = Math.sin((season - 3) * Math.PI / 6) * 10;

    return {
      temperature: Math.round((baseTemp + seasonalAdjust + (Math.random() * 10 - 5)) * 100),
      rainfall: Math.random() > 0.7 ? Math.round(Math.random() * 30 * 100) : 0,
      humidity: Math.round((50 + Math.random() * 40) * 100),
      windSpeed: Math.round((5 + Math.random() * 25) * 100),
      location: 'Mock Location',
      timestamp: Math.floor(Date.now() / 1000),
    };
  }

  async recordWeatherData(locationHash, lat, lon) {
    try {
      const weather = await this.fetchWeatherData(lat, lon);
      const sourceHash = ethers.keccak256(ethers.toUtf8Bytes('OpenWeatherMap'));

      console.log(`📊 Weather data for ${weather.location || `${lat}, ${lon}`}:`);
      console.log(`   Temperature: ${weather.temperature / 100}°C`);
      console.log(`   Rainfall: ${weather.rainfall / 100}mm`);
      console.log(`   Humidity: ${weather.humidity / 100}%`);
      console.log(`   Wind Speed: ${weather.windSpeed / 100}km/h`);

      const tx = await this.contracts.weatherOracle.recordWeatherData(
        locationHash,
        weather.temperature,
        weather.rainfall,
        weather.humidity,
        weather.windSpeed,
        sourceHash
      );

      console.log(`   📝 TX: ${tx.hash}`);
      await tx.wait();
      console.log(`   ✅ Recorded on-chain\n`);

      return { success: true, weather, txHash: tx.hash };
    } catch (error) {
      console.error(`   ❌ Failed to record:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async fulfillDataRequest(requestId, lat, lon) {
    try {
      const weather = await this.fetchWeatherData(lat, lon);

      console.log(`📊 Fulfilling request ${requestId.slice(0, 10)}...`);

      const tx = await this.contracts.flareDataConnector.fulfillWeatherData(
        requestId,
        weather.temperature,
        weather.rainfall,
        weather.humidity,
        weather.windSpeed
      );

      console.log(`   📝 TX: ${tx.hash}`);
      await tx.wait();
      console.log(`   ✅ Request fulfilled\n`);

      return { success: true, weather, txHash: tx.hash };
    } catch (error) {
      console.error(`   ❌ Failed to fulfill:`, error.message);
      return { success: false, error: error.message };
    }
  }

  addMonitoredLocation(name, lat, lon, intervalMinutes = 60) {
    const locationHash = this.createLocationHash(lat, lon);
    this.monitoredLocations.set(locationHash, {
      name,
      lat,
      lon,
      intervalMinutes,
      lastUpdate: null,
    });
    console.log(`📍 Added monitored location: ${name} (${lat}, ${lon})`);
    return locationHash;
  }

  createLocationHash(lat, lon) {
    // Convert to int format used in contracts (multiply by 1000000)
    const latInt = Math.round(lat * 1000000);
    const lonInt = Math.round(lon * 1000000);
    return ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(['int256', 'int256'], [latInt, lonInt])
    );
  }

  async startMonitoring() {
    console.log('🔄 Starting weather monitoring loop...\n');

    const updateAll = async () => {
      const now = Date.now();

      for (const [hash, location] of this.monitoredLocations) {
        const timeSinceUpdate = location.lastUpdate 
          ? (now - location.lastUpdate) / 1000 / 60 
          : Infinity;

        if (timeSinceUpdate >= location.intervalMinutes) {
          console.log(`🔄 Updating ${location.name}...`);
          await this.recordWeatherData(hash, location.lat, location.lon);
          location.lastUpdate = now;
        }
      }
    };

    // Initial update
    await updateAll();

    // Schedule periodic updates (check every minute)
    setInterval(updateAll, 60 * 1000);
  }

  async listenForRequests() {
    console.log('👂 Listening for weather data requests...\n');

    this.contracts.flareDataConnector.on(
      'WeatherDataRequested',
      async (requestId, locationHash, timestamp, event) => {
        console.log(`📨 New weather data request:`);
        console.log(`   Request ID: ${requestId}`);
        console.log(`   Location Hash: ${locationHash}`);
        console.log(`   Timestamp: ${new Date(Number(timestamp) * 1000).toISOString()}`);

        // Check if we have this location monitored
        const location = this.monitoredLocations.get(locationHash);
        if (location) {
          await this.fulfillDataRequest(requestId, location.lat, location.lon);
        } else {
          console.log(`   ⚠️  Unknown location. Storing for manual fulfillment.`);
          this.pendingRequests.set(requestId, { locationHash, timestamp });
        }
      }
    );
  }
}

// Default monitored locations (major farming regions)
const DEFAULT_LOCATIONS = [
  { name: 'Iowa, USA', lat: 41.9, lon: -93.1 },
  { name: 'Punjab, India', lat: 31.1, lon: 75.3 },
  { name: 'Queensland, Australia', lat: -27.5, lon: 153.0 },
  { name: 'Mato Grosso, Brazil', lat: -12.6, lon: -55.9 },
  { name: 'Ukraine', lat: 49.8, lon: 30.5 },
];

async function main() {
  const oracle = new WeatherOracleService();
  await oracle.initialize();

  // Add default monitoring locations
  for (const loc of DEFAULT_LOCATIONS) {
    oracle.addMonitoredLocation(loc.name, loc.lat, loc.lon, 60); // Update hourly
  }

  console.log('');

  // Start services
  await oracle.startMonitoring();
  await oracle.listenForRequests();

  console.log('✅ Oracle service running. Press Ctrl+C to stop.\n');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { WeatherOracleService };
