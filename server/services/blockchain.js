const { ethers } = require('ethers');
const { SayLessABI } = require('../abi/SayLess');

let provider;
let signer;
let contract;

async function initBlockchain() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.ethpandaops.io';
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Verify provider is working
    const network = await provider.getNetwork();
    console.log('Blockchain provider connected to network:', network.name, network.chainId);
    
    signer = new ethers.Wallet(privateKey, provider);
    contract = new ethers.Contract(contractAddress, SayLessABI, signer);
    
    console.log('Blockchain service initialized');
    console.log('Contract address:', contractAddress);
    console.log('Signer address:', signer.address);
    
    return { provider, signer, contract };
  } catch (error) {
    console.error('Failed to initialize blockchain service:', error.message);
    throw error;
  }
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
