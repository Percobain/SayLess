const { ethers } = require('ethers');

// Contract ABI (only the functions we need)
const SAYLESS_ABI = [
  "function submitReport(bytes32 _cidHash, bytes32 _sessionHash, address _reporter) external",
  "function verifyReport(uint256 _id, uint256 _rewardAmount) external",
  "function rejectReport(uint256 _id) external",
  "function claimRewards(address _wallet) external",
  "function sendReward(address _to, uint256 _amount) external",
  "function getReportCount() external view returns (uint256)",
  "function getReport(uint256 _id) external view returns (bytes32 cidHash, bytes32 sessionHash, address reporter, uint256 timestamp, uint8 status)",
  "function getReputation(address _wallet) external view returns (int256)",
  "function getRewards(address _wallet) external view returns (uint256)",
  "function getBalance() external view returns (uint256)",
  "event ReportSubmitted(uint256 indexed id, bytes32 cidHash, bytes32 sessionHash, address reporter)",
  "event ReportVerified(uint256 indexed id, address reporter, uint256 reward)",
  "event ReportRejected(uint256 indexed id, address reporter)"
];

let provider;
let signer;
let contract;

function initBlockchain() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.ethpandaops.io';
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  provider = new ethers.JsonRpcProvider(rpcUrl);
  signer = new ethers.Wallet(privateKey, provider);
  contract = new ethers.Contract(contractAddress, SAYLESS_ABI, signer);
  
  console.log('Blockchain service initialized');
  console.log('Contract address:', contractAddress);
  console.log('Signer address:', signer.address);
  
  return { provider, signer, contract };
}

async function submitReport(cidHash, sessionHash, reporterAddress) {
  const tx = await contract.submitReport(cidHash, sessionHash, reporterAddress);
  const receipt = await tx.wait();
  
  // Get report ID from event
  let reportId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed && parsed.name === 'ReportSubmitted') {
        reportId = Number(parsed.args[0]);
        break;
      }
    } catch (e) {
      // Skip logs that don't match our ABI
    }
  }
  
  return {
    txHash: tx.hash,
    reportId
  };
}

async function verifyReport(reportId, rewardAmount) {
  const rewardWei = ethers.parseEther(rewardAmount.toString());
  const tx = await contract.verifyReport(reportId, rewardWei);
  await tx.wait();
  return tx.hash;
}

async function rejectReport(reportId) {
  const tx = await contract.rejectReport(reportId);
  await tx.wait();
  return tx.hash;
}

async function claimRewards(walletAddress) {
  const tx = await contract.claimRewards(walletAddress);
  await tx.wait();
  return tx.hash;
}

async function getReputation(walletAddress) {
  return await contract.getReputation(walletAddress);
}

async function getRewards(walletAddress) {
  return await contract.getRewards(walletAddress);
}

async function getWalletBalance(walletAddress) {
  const balance = await provider.getBalance(walletAddress);
  return ethers.formatEther(balance);
}

async function fundWallet(toAddress, amountEth) {
  const tx = await signer.sendTransaction({
    to: toAddress,
    value: ethers.parseEther(amountEth)
  });
  await tx.wait();
  return tx.hash;
}

function computeKeccak256(data) {
  return ethers.keccak256(ethers.toUtf8Bytes(data));
}

module.exports = {
  initBlockchain,
  submitReport,
  verifyReport,
  rejectReport,
  claimRewards,
  getReputation,
  getRewards,
  getWalletBalance,
  fundWallet,
  computeKeccak256
};


