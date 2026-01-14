const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { v4: uuid } = require('uuid');
const twilio = require('twilio');

const User = require('../models/User');
const Session = require('../models/Session');
const { ethers } = require('ethers');
const { getReputation, getRewards, claimRewards, getWalletBalance } = require('../services/blockchain');
const { createWallet, fundWalletWithEth } = require('../services/privy');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Helper to generate 5-char session ID
function generateSessionId() {
  return crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
}

// Helper to hash phone number
function hashPhone(phone) {
  return crypto.createHash('sha256').update(phone + (process.env.PHONE_SALT || 'sayless')).digest('hex');
}

// POST /webhook/twilio - Handle WhatsApp/SMS messages
router.post('/twilio', async (req, res) => {
  try {
    const { Body, From } = req.body;
    const command = (Body || '').trim().toUpperCase();
    const twiml = new twilio.twiml.MessagingResponse();
    const whatsappHash = hashPhone(From);
    
    console.log(`[Twilio] From: ${From}, Command: ${command}`);
    
    // REPORT command
    if (command === 'REPORT') {
      // Find existing user
      let user = await User.findOne({ whatsappHash });
      
      if (!user) {
        console.log(`[Twilio] Creating new wallet for user`);
        
        // Create new wallet
        const { address, privateKey } = createWallet();
        
        user = await User.create({
          whatsappHash,
          odacityUserId: uuid(),
          wallet: address,
          privateKey: privateKey
        });
        
        console.log(`[Twilio] Created wallet: ${address}`);
        
        // Fund wallet with 0.01 ETH
        try {
          const fundTxHash = await fundWalletWithEth(address, '0.01');
          console.log(`[Twilio] Funded wallet with 0.01 ETH, tx: ${fundTxHash}`);
        } catch (fundError) {
          console.error(`[Twilio] Could not fund wallet: ${fundError.message}`);
          // Continue even if funding fails
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
      
      twiml.message(
        `🔐 Anonymous Report Session Created\n` +
        `Session ID: ${sessionId}\n\n` +
        `Submit securely:\n${FRONTEND_URL}/r/${sessionId}\n\n` +
        `💰 Wallet: ${user.wallet.slice(0, 8)}...${user.wallet.slice(-6)}\n` +
        `This link expires in 24 hours.`
      );
    }
    
    // STATUS command
    else if (command.startsWith('STATUS')) {
      const sessionId = command.split(' ')[1];
      if (!sessionId) {
        twiml.message('Usage: STATUS <session_id>\nExample: STATUS 7F92A');
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
          twiml.message(
            `📄 Report ${sessionId.toUpperCase()}\n` +
            `Status: ${statusEmoji[session.status] || ''} ${session.status}\n` +
            `Created: ${session.createdAt.toISOString().split('T')[0]}`
          );
        } else {
          twiml.message('Session not found. Check the ID and try again.');
        }
      }
    }
    
    // BALANCE command
    else if (command === 'BALANCE') {
      const user = await User.findOne({ whatsappHash });
      if (user) {
        try {
          const balance = await getWalletBalance(user.wallet);
          const rewards = await getRewards(user.wallet);
          twiml.message(
            `💰 Your Wallet\n` +
            `Address: ${user.wallet.slice(0, 10)}...${user.wallet.slice(-8)}\n` +
            `Balance: ${parseFloat(balance).toFixed(4)} ETH\n` +
            `Pending Rewards: ${ethers.formatEther(rewards)} ETH`
          );
        } catch (e) {
          twiml.message(`💰 Wallet: ${user.wallet.slice(0, 10)}...${user.wallet.slice(-8)}\n\nError fetching balance.`);
        }
      } else {
        twiml.message('No wallet found. Send REPORT first to create one.');
      }
    }
    
    // REWARDS command
    else if (command === 'REWARDS') {
      const user = await User.findOne({ whatsappHash });
      if (user) {
        try {
          const rewards = await getRewards(user.wallet);
          const rep = await getReputation(user.wallet);
          twiml.message(
            `🎁 Your Rewards\n` +
            `Pending: ${ethers.formatEther(rewards)} ETH\n` +
            `⭐ Reputation: ${rep.toString()}`
          );
        } catch (e) {
          twiml.message('Error fetching rewards. Try again later.');
        }
      } else {
        twiml.message('No wallet found. Send REPORT first.');
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
            twiml.message(
              `🎉 Rewards Claimed!\n` +
              `Amount: ${ethers.formatEther(rewards)} ETH\n` +
              `Tx: ${txHash.slice(0, 20)}...`
            );
          } else {
            twiml.message('No rewards to claim yet.');
          }
        } catch (e) {
          twiml.message(`Claim failed: ${e.message}`);
        }
      } else {
        twiml.message('No wallet found. Send REPORT first.');
      }
    }
    
    // EXPORT command
    else if (command === 'EXPORT') {
      const user = await User.findOne({ whatsappHash });
      if (user) {
        twiml.message(
          `🔑 Your Wallet Export\n\n` +
          `Address: ${user.wallet}\n\n` +
          `Private Key: ${user.privateKey}\n\n` +
          `⚠️ Keep this safe! Anyone with this key controls your wallet.`
        );
      } else {
        twiml.message('No wallet found. Send REPORT first.');
      }
    }
    
    // HELP command
    else if (command === 'HELP') {
      twiml.message(
        `🔐 SayLess Commands\n\n` +
        `REPORT - Create anonymous report\n` +
        `STATUS <id> - Check report status\n` +
        `BALANCE - View wallet balance\n` +
        `REWARDS - View pending rewards\n` +
        `CLAIM - Claim your rewards\n` +
        `EXPORT - Export wallet key\n` +
        `HELP - This message\n\n` +
        `Your reports are encrypted end-to-end.`
      );
    }
    
    // Unknown command
    else {
      twiml.message(
        `Unknown command.\n\n` +
        `Send REPORT to create an anonymous report.\n` +
        `Send HELP for all commands.`
      );
    }
    
    res.type('text/xml').send(twiml.toString());
    
  } catch (error) {
    console.error('[Twilio Webhook Error]', error);
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message('Something went wrong. Please try again.');
    res.type('text/xml').send(twiml.toString());
  }
});

module.exports = router;
