const { ethers } = require('ethers');

let funderWallet;
let provider;

async function initPrivy() {
  const funderKey = process.env.FUNDER_PRIVATE_KEY;
  const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.ethpandaops.io';
  
  try {
    // Initialize provider
    provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Verify provider is working
    const network = await provider.getNetwork();
    console.log('Provider connected to network:', network.name, network.chainId);
    
    if (funderKey) {
      funderWallet = new ethers.Wallet(funderKey, provider);
      console.log('Funder wallet initialized:', funderWallet.address);
    } else {
      console.log('Warning: FUNDER_PRIVATE_KEY not set - wallet funding disabled');
    }
    
    console.log('Wallet funding service initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize wallet funding service:', error.message);
    return false;
  }
}

// Fund a wallet with ETH (uses dedicated funder wallet)
async function fundWalletWithEth(toAddress, amountEth = '0.01') {
  if (!funderWallet) {
    throw new Error('Funder wallet not initialized');
  }
  
  try {
    const balance = await provider.getBalance(funderWallet.address);
    const amountWei = ethers.parseEther(amountEth);
    
    console.log(`[Funder] Balance: ${ethers.formatEther(balance)} ETH`);
    console.log(`[Funder] Sending ${amountEth} ETH to ${toAddress}`);
    
    if (balance < amountWei) {
      throw new Error(`Insufficient funder balance: ${ethers.formatEther(balance)} ETH`);
    }
    
    const tx = await funderWallet.sendTransaction({
      to: toAddress,
      value: amountWei
    });
    
    console.log(`[Funder] TX sent: ${tx.hash}`);
    await tx.wait();
    console.log(`[Funder] TX confirmed`);
    
    return tx.hash;
  } catch (error) {
    console.error('[Funder] Error funding wallet:', error.message);
    throw error;
  }
}

// Create a new wallet (using ethers, not Privy SDK due to ESM issues)
function createWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey
  };
}

// Get funder wallet balance
async function getFunderBalance() {
  if (!funderWallet || !provider) {
    return '0';
  }
  try {
    const balance = await provider.getBalance(funderWallet.address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting funder balance:', error.message);
    return '0';
  }
}

module.exports = {
  initPrivy,
  fundWalletWithEth,
  createWallet,
  getFunderBalance
};
