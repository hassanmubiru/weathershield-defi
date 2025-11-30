const { ethers } = require("hardhat");

async function main() {
  const insurance = await ethers.getContractAt(
    'WeatherShieldInsurance', 
    '0x0982Cd8B1122bA2134BF44A137bE814708Fd821F'
  );
  
  console.log("Testing calculatePremium...");
  
  const coverageAmount = ethers.parseEther('1'); // 1 C2FLR coverage
  const duration = 30 * 24 * 60 * 60; // 30 days in seconds
  const triggerType = 0; // RainfallBelow
  
  try {
    const premium = await insurance.calculatePremium(coverageAmount, duration, triggerType);
    console.log('Premium:', ethers.formatEther(premium), 'C2FLR');
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main().catch(console.error);
