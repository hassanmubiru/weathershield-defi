const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying WeatherShield DeFi contracts to", hre.network.name);
  console.log("================================================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deployer address:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", hre.ethers.formatEther(balance), "FLR\n");

  // Treasury address (can be changed to a multisig in production)
  const treasuryAddress = deployer.address;

  // 1. Deploy FlareDataConnector
  console.log("1️⃣  Deploying FlareDataConnector...");
  const FlareDataConnector = await hre.ethers.getContractFactory("FlareDataConnector");
  const flareDataConnector = await FlareDataConnector.deploy();
  await flareDataConnector.waitForDeployment();
  const fdcAddress = await flareDataConnector.getAddress();
  console.log("   ✅ FlareDataConnector deployed to:", fdcAddress);

  // 2. Deploy WeatherShieldInsurance
  console.log("\n2️⃣  Deploying WeatherShieldInsurance...");
  const WeatherShieldInsurance = await hre.ethers.getContractFactory("WeatherShieldInsurance");
  const weatherShieldInsurance = await WeatherShieldInsurance.deploy(fdcAddress, treasuryAddress);
  await weatherShieldInsurance.waitForDeployment();
  const insuranceAddress = await weatherShieldInsurance.getAddress();
  console.log("   ✅ WeatherShieldInsurance deployed to:", insuranceAddress);

  // 3. Deploy PolicyFactory
  console.log("\n3️⃣  Deploying PolicyFactory...");
  const PolicyFactory = await hre.ethers.getContractFactory("PolicyFactory");
  const policyFactory = await PolicyFactory.deploy(insuranceAddress);
  await policyFactory.waitForDeployment();
  const factoryAddress = await policyFactory.getAddress();
  console.log("   ✅ PolicyFactory deployed to:", factoryAddress);

  // 4. Deploy WeatherOracle
  console.log("\n4️⃣  Deploying WeatherOracle...");
  const WeatherOracle = await hre.ethers.getContractFactory("WeatherOracle");
  const weatherOracle = await WeatherOracle.deploy(fdcAddress);
  await weatherOracle.waitForDeployment();
  const oracleAddress = await weatherOracle.getAddress();
  console.log("   ✅ WeatherOracle deployed to:", oracleAddress);

  // 5. Setup permissions
  console.log("\n5️⃣  Setting up permissions...");
  
  // Authorize WeatherOracle as a data provider in FDC
  const authTx = await flareDataConnector.authorizeProvider(oracleAddress);
  await authTx.wait();
  console.log("   ✅ WeatherOracle authorized as FDC provider");

  // 6. Fund treasury with initial liquidity (optional, for testnet)
  if (hre.network.name === "flareTestnet" || hre.network.name === "hardhat") {
    console.log("\n6️⃣  Funding treasury with initial liquidity...");
    const fundAmount = hre.ethers.parseEther("1.0");
    const fundTx = await weatherShieldInsurance.fundTreasury({ value: fundAmount });
    await fundTx.wait();
    console.log("   ✅ Treasury funded with 1.0 FLR");
  }

  // Print deployment summary
  console.log("\n================================================");
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("================================================");
  console.log("Network:                ", hre.network.name);
  console.log("FlareDataConnector:     ", fdcAddress);
  console.log("WeatherShieldInsurance: ", insuranceAddress);
  console.log("PolicyFactory:          ", factoryAddress);
  console.log("WeatherOracle:          ", oracleAddress);
  console.log("Treasury:               ", treasuryAddress);
  console.log("================================================\n");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    contracts: {
      FlareDataConnector: fdcAddress,
      WeatherShieldInsurance: insuranceAddress,
      PolicyFactory: factoryAddress,
      WeatherOracle: oracleAddress,
    },
    treasury: treasuryAddress,
    deployer: deployer.address,
  };

  const fs = require("fs");
  const deploymentPath = `./deployments/${hre.network.name}.json`;
  
  // Create deployments directory if it doesn't exist
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments");
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to ${deploymentPath}`);

  // Verify contracts on explorer (for non-local networks)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Verifying contracts on explorer...");
    
    try {
      await hre.run("verify:verify", {
        address: fdcAddress,
        constructorArguments: [],
      });
      console.log("   ✅ FlareDataConnector verified");
    } catch (e) {
      console.log("   ⚠️  FlareDataConnector verification failed:", e.message);
    }

    try {
      await hre.run("verify:verify", {
        address: insuranceAddress,
        constructorArguments: [fdcAddress, treasuryAddress],
      });
      console.log("   ✅ WeatherShieldInsurance verified");
    } catch (e) {
      console.log("   ⚠️  WeatherShieldInsurance verification failed:", e.message);
    }

    try {
      await hre.run("verify:verify", {
        address: factoryAddress,
        constructorArguments: [insuranceAddress],
      });
      console.log("   ✅ PolicyFactory verified");
    } catch (e) {
      console.log("   ⚠️  PolicyFactory verification failed:", e.message);
    }

    try {
      await hre.run("verify:verify", {
        address: oracleAddress,
        constructorArguments: [fdcAddress],
      });
      console.log("   ✅ WeatherOracle verified");
    } catch (e) {
      console.log("   ⚠️  WeatherOracle verification failed:", e.message);
    }
  }

  console.log("\n🎉 Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
