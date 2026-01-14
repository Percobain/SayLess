const { ethers } = require('ethers');

const PRIVY_API_URL = 'https://api.privy.io/v1';

let funderWallet;
let provider;
let privyAppId;
let privyAppSecret;
let privyAuthHeader;

async function initPrivy() {
  const funderKey = process.env.FUNDER_PRIVATE_KEY;
  const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.ethpandaops.io';
  
  // Get Privy credentials
  privyAppId = process.env.PRIVY_APP_ID;
  privyAppSecret = process.env.PRIVY_APP_SECRET;
  
  if (privyAppId && privyAppSecret) {
    // Create Basic Auth header: base64(app_id:app_secret)
    const credentials = Buffer.from(`${privyAppId}:${privyAppSecret}`).toString('base64');
    privyAuthHeader = `Basic ${credentials}`;
    console.log('Privy API credentials configured');
  } else {
    console.log('Warning: PRIVY_APP_ID or PRIVY_APP_SECRET not set');
  }
  
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

// Create a Privy embedded wallet using REST API
async function createPrivyWallet() {
  if (!privyAppId || !privyAppSecret) {
    throw new Error('Privy credentials not configured');
  }
  
  try {
    const response = await fetch(`${PRIVY_API_URL}/wallets`, {
      method: 'POST',
      headers: {
        'Authorization': privyAuthHeader,
        'privy-app-id': privyAppId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chain_type: 'ethereum'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Privy API error: ${response.status} - ${errorText}`);
    }
    
    const wallet = await response.json();
    
    console.log('[Privy] Created wallet:', wallet.id, wallet.address);
    
    return {
      privyWalletId: wallet.id,
      address: wallet.address,
      chainType: wallet.chain_type,
      ownerId: wallet.owner_id,
      createdAt: wallet.created_at
    };
  } catch (error) {
    console.error('[Privy] Error creating wallet:', error);
    throw error;
  }
}

// Get a Privy wallet by ID
async function getPrivyWallet(walletId) {
  if (!privyAppId || !privyAppSecret) {
    throw new Error('Privy credentials not configured');
  }
  
  try {
    const response = await fetch(`${PRIVY_API_URL}/wallets/${walletId}`, {
      method: 'GET',
      headers: {
        'Authorization': privyAuthHeader,
        'privy-app-id': privyAppId
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Privy API error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[Privy] Error getting wallet:', error);
    throw error;
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
  createPrivyWallet,
  getPrivyWallet,
  fundWalletWithEth,
  getFunderBalance
};
