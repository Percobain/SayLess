import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { ethers } from 'ethers';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { getReputation, getRewards, claimRewards, getWalletBalance } from './blockchain.js';
import { createPrivyWallet, fundWalletWithEth } from './privy.js';
import logger from '../utils/logger.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Helper to generate 5-char session ID
function generateSessionId() {
  return crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
}

// Helper to hash phone number
function hashPhone(phone) {
  return crypto.createHash('sha256').update(phone + (process.env.PHONE_SALT || 'sayless')).digest('hex');
}

/**
 * Process an incoming WhatsApp message via Twilio.
 * @param {Object} params - Incoming message parameters (Twilio webhook body)
 * @returns {Promise<string>} - Reply text to send back to the user
 */
const handleIncomingMessage = async (params) => {
  const { Body, From } = params;
  const command = (Body || '').trim().toUpperCase();
  const whatsappHash = hashPhone(From);
  
  logger.info(`[WhatsApp Handler] From: ${From}, Command: ${command}`);

  // REPORT command
  if (command === 'REPORT') {
    // Find or create user
    let user = await User.findOne({ whatsappHash });
    
    if (!user) {
      logger.info(`[WhatsApp Handler] Creating new Privy wallet for user`);
      
      try {
        // Create Privy embedded wallet
        const privyWallet = await createPrivyWallet();
        
        user = await User.create({
          whatsappHash,
          odacityUserId: uuid(),
          wallet: privyWallet.address,
          privyWalletId: privyWallet.privyWalletId,
          reputation: 50, // Initialize with default reputation
          juryReputation: 50 // Initialize with default jury reputation
        });
        
        logger.info(`[WhatsApp Handler] Created Privy wallet: ${privyWallet.address} (ID: ${privyWallet.privyWalletId})`);
        
        // Fund wallet with 0.01 ETH
        try {
          const fundTxHash = await fundWalletWithEth(privyWallet.address, '0.01');
          logger.info(`[WhatsApp Handler] Funded wallet with 0.01 ETH, tx: ${fundTxHash}`);
        } catch (fundError) {
          logger.error(`[WhatsApp Handler] Could not fund wallet: ${fundError.message}`);
          // Continue even if funding fails
        }
      } catch (privyError) {
        logger.error(`[WhatsApp Handler] Privy wallet creation failed: ${privyError.message}`);
        throw new Error('Failed to create wallet. Please try again.');
      }
    }
    
    // Create session
    const sessionId = generateSessionId();
    await Session.create({
      sessionId,
      odacityUserId: user.odacityUserId,
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    
    return `🔐 Anonymous Report Session Created\n` +
           `Session ID: ${sessionId}\n\n` +
           `Submit securely:\n${FRONTEND_URL}/r/${sessionId}\n\n` +
           `💰 Wallet: ${user.wallet.slice(0, 8)}...${user.wallet.slice(-6)}\n` +
           `This link expires in 24 hours.`;
  }
  
  // STATUS command
  else if (command.startsWith('STATUS')) {
    const sessionId = command.split(' ')[1];
    if (!sessionId) {
      return 'Usage: STATUS <session_id>\nExample: STATUS 7F92A';
    } else {
      const session = await Session.findOne({ sessionId: sessionId.toUpperCase() });
      if (session) {
        const statusEmoji = {
          'pending': '⏳',
          'under_review': '🔍',
          'verified': '✅',
          'rejected': '❌',
          'closed': '🔒'
        };
        return `📄 Report ${sessionId.toUpperCase()}\n` +
               `Status: ${statusEmoji[session.status] || ''} ${session.status}\n` +
               `Created: ${session.createdAt.toISOString().split('T')[0]}`;
      } else {
        return 'Session not found. Check the ID and try again.';
      }
    }
  }
  
  // BALANCE command
  else if (command === 'BALANCE' || command === 'BAL') {
    const user = await User.findOne({ whatsappHash });
    if (user) {
      try {
        const balance = await getWalletBalance(user.wallet);
        const rewards = await getRewards(user.wallet);
        return `💰 Your Wallet\n` +
               `Address: ${user.wallet.slice(0, 10)}...${user.wallet.slice(-8)}\n` +
               `Balance: ${parseFloat(balance).toFixed(4)} ETH\n` +
               `Pending Rewards: ${ethers.formatEther(rewards)} ETH`;
      } catch (e) {
        return `💰 Wallet: ${user.wallet.slice(0, 10)}...${user.wallet.slice(-8)}\n\nError fetching balance.`;
      }
    } else {
      return 'No wallet found. Send REPORT first to create one.';
    }
  }
  
  // REWARDS command
  else if (command === 'REWARDS') {
    const user = await User.findOne({ whatsappHash });
    if (user) {
      try {
        const rewards = await getRewards(user.wallet);
        const rep = await getReputation(user.wallet);
        return `🎁 Your Rewards\n` +
               `Pending: ${ethers.formatEther(rewards)} ETH\n` +
               `⭐ Reputation: ${rep.toString()}`;
      } catch (e) {
        return 'Error fetching rewards. Try again later.';
      }
    } else {
      return 'No wallet found. Send REPORT first.';
    }
  }
  
  // CLAIM command
  else if (command === 'CLAIM') {
    const user = await User.findOne({ whatsappHash });
    if (user) {
      try {
        const rewards = await getRewards(user.wallet);
        if (rewards > 0n) {
          const txHash = await claimRewards(user.wallet);
          return `🎉 Rewards Claimed!\n` +
                 `Amount: ${ethers.formatEther(rewards)} ETH\n` +
                 `Tx: ${txHash.slice(0, 20)}...`;
        } else {
          return 'No rewards to claim yet.';
        }
      } catch (e) {
        return `Claim failed: ${e.message}`;
      }
    } else {
      return 'No wallet found. Send REPORT first.';
    }
  }
  
  // WA command - Show wallet address
  else if (command === 'WA') {
    const user = await User.findOne({ whatsappHash });
    if (user) {
      return `💼 Your Wallet Address\n\n` +
             `${user.wallet}\n\n` +
             `View on Sepolia: https://sepolia.etherscan.io/address/${user.wallet}`;
    } else {
      return 'No wallet found. Send REPORT first.';
    }
  }
  
  // TX command - Show transaction history
  else if (command === 'TX') {
    const user = await User.findOne({ whatsappHash });
    if (!user) {
      return 'No wallet found. Send REPORT first.';
    }
    
    try {
      // Get all sessions with transactions for this user
      const sessions = await Session.find({
        odacityUserId: user.odacityUserId,
        txHash: { $ne: null }
      })
      .sort({ createdAt: -1 })
      .limit(10); // Show last 10 transactions
      
      if (sessions.length === 0) {
        return `📜 Transaction History\n\n` +
               `No transactions found yet.\n\n` +
               `Send REPORT to create your first transaction.`;
      }
      
      let txList = `📜 Transaction History\n\n`;
      sessions.forEach((session, index) => {
        const date = new Date(session.createdAt).toLocaleDateString();
        const statusEmoji = {
          'pending': '⏳',
          'under_review': '🔍',
          'verified': '✅',
          'rejected': '❌',
          'closed': '🔒'
        };
        
        txList += `${index + 1}. ${statusEmoji[session.status] || ''} ${session.status.toUpperCase()}\n`;
        txList += `   Session: ${session.sessionId}\n`;
        txList += `   Tx: ${session.txHash.slice(0, 20)}...\n`;
        if (session.rewardAmount) {
          txList += `   Reward: ${session.rewardAmount} ETH\n`;
        }
        txList += `   Date: ${date}\n\n`;
      });
      
      txList += `View on Sepolia: https://sepolia.etherscan.io/address/${user.wallet}`;
      
      return txList;
    } catch (e) {
      logger.error(`[WhatsApp Handler] TX command error: ${e.message}`);
      return `❌ Error fetching transactions: ${e.message}`;
    }
  }
  
  // TXS command - Show all on-chain transactions (incoming and outgoing)
  else if (command === 'TXS') {
    const user = await User.findOne({ whatsappHash });
    if (!user) {
      return 'No wallet found. Send REPORT first.';
    }
    
    try {
      // Fetch transactions from Etherscan API (Sepolia)
      const address = user.wallet;
      const apiUrl = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc`;
      
      logger.info(`[WhatsApp Handler] TXS command: Fetching transactions for ${address}`);
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.status !== '1' || !data.result || data.result.length === 0) {
        return `🔗 On-Chain Transactions\n\n` +
               `No on-chain transactions found.\n\n` +
               `View on Etherscan:\nhttps://sepolia.etherscan.io/address/${address}`;
      }
      
      const transactions = data.result.slice(0, 10); // Show last 10
      let txList = `🔗 On-Chain Transactions\n\n`;
      
      transactions.forEach((tx, index) => {
        const isIncoming = tx.to.toLowerCase() === address.toLowerCase();
        const direction = isIncoming ? '⬇️ IN' : '⬆️ OUT';
        const amount = ethers.formatEther(tx.value);
        const date = new Date(parseInt(tx.timeStamp) * 1000).toLocaleDateString();
        const time = new Date(parseInt(tx.timeStamp) * 1000).toLocaleTimeString();
        
        txList += `${index + 1}. ${direction}\n`;
        txList += `   ${amount} ETH\n`;
        if (isIncoming) {
          txList += `   From: ${tx.from.slice(0, 10)}...${tx.from.slice(-6)}\n`;
        } else {
          txList += `   To: ${tx.to.slice(0, 10)}...${tx.to.slice(-6)}\n`;
        }
        txList += `   Tx: ${tx.hash.slice(0, 20)}...\n`;
        txList += `   ${date} ${time}\n\n`;
      });
      
      txList += `View all: https://sepolia.etherscan.io/address/${address}`;
      
      return txList;
    } catch (e) {
      logger.error(`[WhatsApp Handler] TXS command error: ${e.message}`);
      return `❌ Error fetching on-chain transactions: ${e.message}`;
    }
  }
  
  // EXPORT command
  else if (command === 'EXPORT') {
    const user = await User.findOne({ whatsappHash });
    if (user) {
      return `🔑 Your Privy Wallet\n\n` +
             `Address: ${user.wallet}\n` +
             `Privy Wallet ID: ${user.privyWalletId}\n\n` +
             `Your wallet is managed by Privy. To export your private key, use the Privy dashboard or API.\n\n` +
             `⚠️ Keep your wallet secure!`;
    } else {
      return 'No wallet found. Send REPORT first.';
    }
  }
  
  // SEED command - Fund wallet with 0.01 Sepolia ETH
  else if (command === 'SEED') {
    const user = await User.findOne({ whatsappHash });
    if (user) {
      try {
        logger.info(`[WhatsApp Handler] SEED command: Funding wallet ${user.wallet}`);
        const fundTxHash = await fundWalletWithEth(user.wallet, '0.01');
        logger.info(`[WhatsApp Handler] SEED successful: ${fundTxHash}`);
        return `🌱 Wallet Funded!\n\n` +
               `Amount: 0.01 Sepolia ETH\n` +
               `Address: ${user.wallet.slice(0, 10)}...${user.wallet.slice(-8)}\n` +
               `Tx: ${fundTxHash.slice(0, 20)}...\n\n` +
               `Your wallet has been seeded with Sepolia ETH.`;
      } catch (fundError) {
        logger.error(`[WhatsApp Handler] SEED failed: ${fundError.message}`);
        return `❌ Funding failed: ${fundError.message}\n\n` +
               `Please try again later.`;
      }
    } else {
      return 'No wallet found. Send REPORT first to create a wallet.';
    }
  }
  
  // HELP command
  else if (command === 'HELP') {
    return `🔐 SayLess Commands\n\n` +
           `REPORT - Create anonymous report\n` +
           `STATUS <id> - Check report status\n` +
           `BALANCE - View wallet balance\n` +
           `REWARDS - View pending rewards\n` +
           `CLAIM - Claim your rewards\n` +
           `WA - Show wallet address\n` +
           `TX - Show transaction history\n` +
           `TXS - Show all on-chain transactions\n` +
           `SEED - Fund wallet with 0.01 Sepolia ETH\n` +
           `EXPORT - Export wallet info\n` +
           `HELP - This message\n\n` +
           `Your reports are encrypted end-to-end.`;
  }
  
  // Unknown command
  else {
    return `Unknown command.\n\n` +
           `Send REPORT to create an anonymous report.\n` +
           `Send HELP for all commands.`;
  }
};

export {
  handleIncomingMessage
};
