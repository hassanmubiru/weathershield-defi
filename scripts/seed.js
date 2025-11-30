const hre = require("hardhat");

/**
 * Script to seed test data for development and testing
 */
async function main() {
  console.log("🌱 Seeding test data for WeatherShield DeFi...\n");

  const [deployer, farmer1, farmer2] = await hre.ethers.getSigners();
  
  // Load deployment info
  const fs = require("fs");
  const network = hre.network.name;
  const deploymentPath = `./deployments/${network}.json`;
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Deployment info not found. Run deploy.js first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  
  // Get contract instances
  const FlareDataConnector = await hre.ethers.getContractFactory("FlareDataConnector");
  const fdc = FlareDataConnector.attach(deployment.contracts.FlareDataConnector);

  const WeatherShieldInsurance = await hre.ethers.getContractFactory("WeatherShieldInsurance");
  const insurance = WeatherShieldInsurance.attach(deployment.contracts.WeatherShieldInsurance);

  const WeatherOracle = await hre.ethers.getContractFactory("WeatherOracle");
  const oracle = WeatherOracle.attach(deployment.contracts.WeatherOracle);

  console.log("📍 Using contracts:");
  console.log("   FlareDataConnector:", deployment.contracts.FlareDataConnector);
  console.log("   WeatherShieldInsurance:", deployment.contracts.WeatherShieldInsurance);
  console.log("   WeatherOracle:", deployment.contracts.WeatherOracle);
  console.log();

  // Create sample location hashes
  const locations = [
    { name: "Farm A - Iowa, USA", lat: 41900000, lon: -93100000 },
    { name: "Farm B - Punjab, India", lat: 31100000, lon: 75300000 },
    { name: "Farm C - Queensland, Australia", lat: -27500000, lon: 153000000 },
  ];

  const locationHashes = [];
  console.log("📍 Creating location hashes...");
  for (const loc of locations) {
    const hash = await fdc.createLocationHash(loc.lat, loc.lon);
    locationHashes.push(hash);
    console.log(`   ${loc.name}: ${hash}`);
  }
  console.log();

  // Seed historical weather data
  console.log("🌤️  Seeding historical weather data...");
  const weatherData = [
    // Iowa - moderate conditions
    { temp: 2200, rain: 8000, humidity: 6500, wind: 1500 },
    { temp: 2400, rain: 7500, humidity: 6200, wind: 1800 },
    { temp: 2100, rain: 9000, humidity: 7000, wind: 1200 },
    // Punjab - hot and dry
    { temp: 3500, rain: 3000, humidity: 4500, wind: 2000 },
    { temp: 3800, rain: 2500, humidity: 4000, wind: 2200 },
    { temp: 3600, rain: 2800, humidity: 4200, wind: 1900 },
    // Queensland - variable
    { temp: 2800, rain: 12000, humidity: 7500, wind: 2500 },
    { temp: 3000, rain: 15000, humidity: 8000, wind: 3000 },
    { temp: 2600, rain: 11000, humidity: 7200, wind: 2200 },
  ];

  for (let i = 0; i < locationHashes.length; i++) {
    for (let j = 0; j < 3; j++) {
      const dataIndex = i * 3 + j;
      const data = weatherData[dataIndex];
      const sourceHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("OpenWeatherMap"));
      
      const tx = await oracle.recordWeatherData(
        locationHashes[i],
        data.temp,
        data.rain,
        data.humidity,
        data.wind,
        sourceHash
      );
      await tx.wait();
    }
    console.log(`   ✅ Added 3 records for ${locations[i].name}`);
  }
  console.log();

  // Create sample policies
  console.log("📜 Creating sample insurance policies...");
  
  // Policy 1: Drought protection for Iowa farm
  const policy1 = await insurance.connect(farmer1 || deployer).createPolicy(
    locationHashes[0],
    0, // TriggerType.RainfallBelow
    5000, // 50mm threshold
    hre.ethers.parseEther("0.5"), // 0.5 FLR coverage
    30 * 24 * 60 * 60, // 30 days
    "Corn",
    50000, // 500 hectares
    { value: hre.ethers.parseEther("0.05") }
  );
  await policy1.wait();
  console.log("   ✅ Policy 1: Drought protection for Corn (Iowa)");

  // Policy 2: Flood protection for Punjab farm
  const policy2 = await insurance.connect(farmer2 || deployer).createPolicy(
    locationHashes[1],
    1, // TriggerType.RainfallAbove
    20000, // 200mm threshold
    hre.ethers.parseEther("0.8"), // 0.8 FLR coverage
    60 * 24 * 60 * 60, // 60 days
    "Wheat",
    30000, // 300 hectares
    { value: hre.ethers.parseEther("0.08") }
  );
  await policy2.wait();
  console.log("   ✅ Policy 2: Flood protection for Wheat (Punjab)");

  // Policy 3: Heat wave protection for Queensland farm
  const policy3 = await insurance.connect(deployer).createPolicy(
    locationHashes[2],
    3, // TriggerType.TemperatureAbove
    4000, // 40°C threshold
    hre.ethers.parseEther("1.0"), // 1.0 FLR coverage
    90 * 24 * 60 * 60, // 90 days
    "Sugarcane",
    100000, // 1000 hectares
    { value: hre.ethers.parseEther("0.12") }
  );
  await policy3.wait();
  console.log("   ✅ Policy 3: Heat wave protection for Sugarcane (Queensland)");

  console.log();
  console.log("🎉 Test data seeding complete!");
  console.log();
  
  // Print summary
  const policyCount = await insurance.getPolicyCount();
  const treasuryBalance = await insurance.treasuryBalance();
  
  console.log("📊 Summary:");
  console.log(`   Total policies: ${policyCount}`);
  console.log(`   Treasury balance: ${hre.ethers.formatEther(treasuryBalance)} FLR`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
