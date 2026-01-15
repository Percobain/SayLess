import { ethers } from 'ethers';
import { SayLessABI } from '../abi/SayLess.js';

let provider;
let signer;
let contract;

async function initBlockchain() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia.gateway.tatum.io';
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

// Timeout wrapper for async operations
function withTimeout(promise, timeoutMs, operation = 'Operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs/1000}s`)), timeoutMs)
    )
  ]);
}

async function submitReport(cidHash, sessionHash, reporterAddress) {
  const TIMEOUT_MS = 30000; // 30 seconds
  
  try {
    console.log('[Blockchain] Sending transaction...');
    const tx = await withTimeout(
      contract.submitReport(cidHash, sessionHash, reporterAddress),
      TIMEOUT_MS,
      'Transaction submission'
    );
    console.log(`[Blockchain] Transaction sent: ${tx.hash}`);
    
    console.log('[Blockchain] Waiting for confirmation...');
    const receipt = await withTimeout(
      tx.wait(),
      TIMEOUT_MS,
      'Transaction confirmation'
    );
    console.log(`[Blockchain] Transaction confirmed in block ${receipt.blockNumber}`);
    
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
  } catch (error) {
    console.error('[Blockchain] Transaction failed:', error.message);
    throw new Error(`Blockchain transaction failed: ${error.message}`);
  }
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

export {
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
