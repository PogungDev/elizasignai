const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy MEVProtector
  console.log("\nDeploying MEVProtector...");
  const MEVProtector = await hre.ethers.getContractFactory("MEVProtector");
  const mevProtector = await MEVProtector.deploy();
  await mevProtector.waitForDeployment();
  const mevProtectorAddress = await mevProtector.getAddress();
  console.log("MEVProtector deployed to:", mevProtectorAddress);

  // Deploy VaultGuardOracle
  console.log("\nDeploying VaultGuardOracle...");
  const VaultGuardOracle = await hre.ethers.getContractFactory("VaultGuardOracle");
  const vaultGuardOracle = await VaultGuardOracle.deploy();
  await vaultGuardOracle.waitForDeployment();
  const vaultGuardOracleAddress = await vaultGuardOracle.getAddress();
  console.log("VaultGuardOracle deployed to:", vaultGuardOracleAddress);

  // Deploy YieldOptimizer
  console.log("\nDeploying YieldOptimizer...");
  const YieldOptimizer = await hre.ethers.getContractFactory("YieldOptimizer");
  const yieldOptimizer = await YieldOptimizer.deploy();
  await yieldOptimizer.waitForDeployment();
  const yieldOptimizerAddress = await yieldOptimizer.getAddress();
  console.log("YieldOptimizer deployed to:", yieldOptimizerAddress);

  // Save deployment addresses
  const deploymentData = {
    MEVProtector: mevProtectorAddress,
    VaultGuardOracle: vaultGuardOracleAddress,
    YieldOptimizer: yieldOptimizerAddress,
    deployer: deployer.address,
    network: hre.network.name,
    timestamp: new Date().toISOString()
  };

  const deploymentPath = path.join(__dirname, "../data/deployments.json");
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));

  console.log("\nDeployment completed!");
  console.log("Deployment data saved to:", deploymentPath);

  // Update .env.local file
  const envPath = path.join(__dirname, "../.env.local");
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  envContent = envContent.replace(
    /NEXT_PUBLIC_MEV_PROTECTOR_ADDRESS=.*/,
    `NEXT_PUBLIC_MEV_PROTECTOR_ADDRESS=${mevProtectorAddress}`
  );
  envContent = envContent.replace(
    /NEXT_PUBLIC_VAULT_GUARD_ORACLE_ADDRESS=.*/,
    `NEXT_PUBLIC_VAULT_GUARD_ORACLE_ADDRESS=${vaultGuardOracleAddress}`
  );
  envContent = envContent.replace(
    /NEXT_PUBLIC_YIELD_OPTIMIZER_ADDRESS=.*/,
    `NEXT_PUBLIC_YIELD_OPTIMIZER_ADDRESS=${yieldOptimizerAddress}`
  );

  fs.writeFileSync(envPath, envContent);
  console.log("\n.env.local updated with contract addresses!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 