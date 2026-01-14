const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with:", deployer.address);
    console.log("Network:", hre.network.name);

    // Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");

    // Deploy SayLess
    console.log("\nDeploying SayLess...");
    const SayLess = await hre.ethers.getContractFactory("SayLess");
    const sayless = await SayLess.deploy();
    await sayless.waitForDeployment();
    const saylessAddress = await sayless.getAddress();
    console.log("SayLess deployed to:", saylessAddress);

    // Fund the contract with some ETH for rewards (0.01 ETH)
    console.log("\nFunding contract with 0.01 ETH for rewards pool...");
    const fundTx = await deployer.sendTransaction({
      to: saylessAddress,
      value: hre.ethers.parseEther("0.01")
    });
    await fundTx.wait();
    console.log("Contract funded! Tx:", fundTx.hash);

    // Verify contract balance
    const contractBalance = await hre.ethers.provider.getBalance(saylessAddress);
    console.log("Contract balance:", hre.ethers.formatEther(contractBalance), "ETH");

    // Save deployment info
    const deploymentInfo = {
      network: hre.network.name,
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      contracts: {
        sayless: {
          address: saylessAddress,
          balance: hre.ethers.formatEther(contractBalance)
        }
      }
    };
    const deploymentPath = path.join(__dirname, "..", "deployment.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("\nSaved deployment info to:", deploymentPath);

    console.log("\n========================================");
    console.log("DEPLOYMENT COMPLETE");
    console.log("========================================");
    console.log("SayLess Contract:", saylessAddress);
    console.log("Network:", hre.network.name);
    console.log("========================================");

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
