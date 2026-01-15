import express from 'express';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import Report from '../models/Report.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { getReputation, getRewards, getWalletBalance, claimRewards as blockchainClaimRewards } from '../services/blockchain.js';
import { createPrivyWallet, fundWalletWithEth } from '../services/privy.js';

const router = express.Router();

// Generate a random session ID (5 uppercase alphanumeric characters, matching WhatsApp format)
function generateSessionId() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST /api/reporter/session - Create a new session for a user
router.post('/session', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress is required' });
    }
    
    // Normalize wallet address (lowercase)
    const normalizedWallet = walletAddress.toLowerCase();
    
    // Find user by wallet (case-insensitive)
    let user = await User.findOne({ wallet: { $regex: new RegExp(`^${normalizedWallet}$`, 'i') } });
    
    // If user doesn't exist, create one (for web-created reports)
    if (!user) {
      try {
        // For web users, we need a whatsappHash - use wallet address hash as placeholder
        // This ensures uniqueness while allowing web users without WhatsApp
        const whatsappHash = crypto.createHash('sha256').update(`web-${normalizedWallet}`).digest('hex');
        
        // Create a user entry with placeholder data for web users
        // The wallet address itself is the key identifier
        user = await User.create({
          whatsappHash, // Use wallet hash as placeholder for web users
          odacityUserId: uuid(),
          wallet: normalizedWallet,
          privyWalletId: `web-${normalizedWallet.slice(2, 22)}` // Use wallet chars as placeholder
        });
        
        console.log(`[Reporter Session] Created user for web wallet: ${normalizedWallet}`);
      } catch (createError) {
        console.error('[Reporter Session] Error creating user:', createError);
        // Check if it's a duplicate key error
        if (createError.code === 11000) {
          // Try to find the user again (race condition)
          user = await User.findOne({ wallet: { $regex: new RegExp(`^${normalizedWallet}$`, 'i') } });
          if (!user) {
            return res.status(500).json({ error: 'User creation failed due to duplicate. Please try again.' });
          }
        } else {
          return res.status(500).json({ error: 'Failed to create user. Please send REPORT via WhatsApp first to create your account.' });
        }
      }
    }
    
    // Create new session
    const sessionId = generateSessionId();
    const session = await Session.create({
      sessionId,
      odacityUserId: user.odacityUserId,
      status: 'pending'
    });
    
    console.log(`[Reporter Session] Created session ${sessionId} for wallet ${normalizedWallet}`);
    
    res.json({
      sessionId: session.sessionId,
      expiresAt: session.expiresAt,
      wallet: user.wallet
    });
    
  } catch (error) {
    console.error('[Reporter Session Error]', error);
    res.status(500).json({ error: 'Failed to create session: ' + error.message });
  }
});

// GET /api/reporter/stats/:walletAddress - Get reporter stats
router.get('/stats/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Find user
    const user = await User.findOne({ wallet: walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get all sessions for this user
    const sessions = await Session.find({ odacityUserId: user.odacityUserId });
    const sessionIds = sessions.map(s => s.sessionId);
    
    // Count reports by status
    const reports = await Report.find({ sessionId: { $in: sessionIds } });
    const reportCount = reports.length;
    
    // Calculate stake used (0.001 ETH per report submitted)
    const stakeUsed = (reportCount * 0.001).toFixed(3);
    
    // Get on-chain data
    let reputation = 0;
    let pendingRewards = '0';
    
    try {
      reputation = Number(await getReputation(walletAddress));
      const rewardsWei = await getRewards(walletAddress);
      pendingRewards = (Number(rewardsWei) / 1e18).toFixed(4);
    } catch (e) {
      console.error('[Stats] Blockchain fetch error:', e.message);
    }
    
    res.json({
      reportCount,
      stakeUsed: `${stakeUsed} ETH`,
      reputationScore: reputation,
      pendingRewards: `${pendingRewards} ETH`
    });
    
  } catch (error) {
    console.error('[Reporter Stats Error]', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/reporter/reports/:walletAddress - Get reporter's recent reports
router.get('/reports/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    // Find user
    const user = await User.findOne({ wallet: walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get sessions for this user
    const sessions = await Session.find({ odacityUserId: user.odacityUserId });
    const sessionMap = {};
    sessions.forEach(s => { sessionMap[s.sessionId] = s; });
    const sessionIds = sessions.map(s => s.sessionId);
    
    // Get reports
    const reports = await Report.find({ sessionId: { $in: sessionIds } })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    const formattedReports = reports.map(report => {
      const session = sessionMap[report.sessionId];
      return {
        id: `RPT-${report._id.toString().slice(-6).toUpperCase()}`,
        category: report.aiAnalysis?.category || 'Unknown',
        status: report.status,
        date: formatRelativeTime(report.createdAt),
        reward: session?.rewardAmount ? `${session.rewardAmount} ETH` : '-',
        txHash: session?.txHash
      };
    });
    
    res.json(formattedReports);
    
  } catch (error) {
    console.error('[Reporter Reports Error]', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET /api/reporter/reputation/:walletAddress - Get reputation profile
router.get('/reputation/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Find user
    const user = await User.findOne({ wallet: walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get sessions and reports
    const sessions = await Session.find({ odacityUserId: user.odacityUserId });
    const sessionIds = sessions.map(s => s.sessionId);
    const reports = await Report.find({ sessionId: { $in: sessionIds } });
    
    // Calculate stats
    const totalReports = reports.length;
    const acceptedReports = reports.filter(r => r.status === 'verified').length;
    const rejectedReports = reports.filter(r => r.status === 'rejected').length;
    
    // Get on-chain reputation
    let reputation = 0;
    let pendingRewards = '0';
    
    try {
      reputation = Number(await getReputation(walletAddress));
      const rewardsWei = await getRewards(walletAddress);
      pendingRewards = (Number(rewardsWei) / 1e18).toFixed(4);
    } catch (e) {
      console.error('[Reputation] Blockchain fetch error:', e.message);
    }
    
    // Determine tier
    const tier = getTierFromScore(reputation);
    
    // Calculate rewards earned from verified reports
    const verifiedSessions = sessions.filter(s => s.status === 'verified' && s.rewardAmount);
    const totalRewardsEarned = verifiedSessions.reduce((sum, s) => sum + parseFloat(s.rewardAmount || 0), 0);
    
    // Build recent activity from reports
    const recentActivity = reports.slice(0, 5).map(report => ({
      type: report.status === 'verified' ? 'report_accepted' : 
            report.status === 'rejected' ? 'report_rejected' : 'report_pending',
      change: report.status === 'verified' ? '+5' : 
              report.status === 'rejected' ? '-3' : '0',
      description: `Report ${report.sessionId} ${report.status}`,
      date: formatRelativeTime(report.createdAt)
    }));
    
    res.json({
      ensAlias: `sayless-${walletAddress.slice(-4).toLowerCase()}.eth`,
      score: reputation,
      tier,
      totalReports,
      acceptedReports,
      rejectedReports,
      juryVotes: 0, // Not implemented yet
      correctVotes: 0,
      rewardsEarned: `${totalRewardsEarned.toFixed(4)} ETH`,
      penaltiesReceived: '0 ETH', // Not tracked yet
      pendingRewards: `${pendingRewards} ETH`,
      recentActivity
    });
    
  } catch (error) {
    console.error('[Reporter Reputation Error]', error);
    res.status(500).json({ error: 'Failed to fetch reputation' });
  }
});

// GET /api/reporter/wallet/:walletAddress - Get wallet data
router.get('/wallet/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Find user
    const user = await User.findOne({ wallet: walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get on-chain data
    let ethBalance = '0';
    let pendingRewards = '0';
    
    try {
      ethBalance = await getWalletBalance(walletAddress);
      const rewardsWei = await getRewards(walletAddress);
      pendingRewards = (Number(rewardsWei) / 1e18).toFixed(4);
    } catch (e) {
      console.error('[Wallet] Blockchain fetch error:', e.message);
    }
    
    // Get sessions to calculate staked amount
    const sessions = await Session.find({ 
      odacityUserId: user.odacityUserId,
      status: 'under_review'
    });
    const pendingReportCount = sessions.length;
    const stakedAmount = (pendingReportCount * 0.001).toFixed(3);
    
    // Get recent transactions (from verified/rejected sessions)
    const allSessions = await Session.find({ 
      odacityUserId: user.odacityUserId,
      txHash: { $exists: true, $ne: null }
    }).sort({ createdAt: -1 }).limit(10);
    
    const transactions = allSessions.map(session => ({
      id: session._id.toString(),
      type: session.status === 'verified' ? 'reward' : 
            session.status === 'rejected' ? 'penalty' : 'stake',
      amount: session.status === 'verified' ? `+${session.rewardAmount} ETH` :
              session.status === 'rejected' ? '-0.001 ETH' : '-0.001 ETH',
      label: session.status === 'verified' ? 'Report Verified' :
             session.status === 'rejected' ? 'Report Rejected' : 'Report Stake',
      time: formatRelativeTime(session.createdAt),
      hash: session.txHash
    }));
    
    res.json({
      address: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      fullAddress: walletAddress,
      balances: {
        eth: parseFloat(ethBalance).toFixed(4),
        usdc: '0.00' // Not supporting USDC yet
      },
      pendingRewards,
      stakedAmount,
      pendingReportCount,
      transactions
    });
    
  } catch (error) {
    console.error('[Reporter Wallet Error]', error);
    res.status(500).json({ error: 'Failed to fetch wallet data' });
  }
});

// Helper: Format relative time
function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
}

// POST /api/reporter/claim-rewards - Claim pending rewards for a wallet
router.post('/claim-rewards', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'walletAddress is required' });
    }
    
    // Normalize wallet address
    const normalizedWallet = walletAddress.toLowerCase();
    
    // Find user
    const user = await User.findOne({ wallet: { $regex: new RegExp(`^${normalizedWallet}$`, 'i') } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if there are rewards to claim
    try {
      const rewardsWei = await getRewards(normalizedWallet);
      const rewardsEth = Number(rewardsWei) / 1e18;
      
      if (rewardsEth <= 0) {
        return res.status(400).json({ error: 'No rewards to claim' });
      }
      
      // Claim rewards on blockchain
      console.log(`[Claim Rewards] Claiming ${rewardsEth} ETH for wallet ${normalizedWallet}`);
      const txHash = await blockchainClaimRewards(normalizedWallet);
      
      res.json({
        success: true,
        txHash,
        amount: rewardsEth.toFixed(4),
        message: `Successfully claimed ${rewardsEth.toFixed(4)} ETH`
      });
    } catch (blockchainError) {
      console.error('[Claim Rewards] Blockchain error:', blockchainError);
      return res.status(500).json({ 
        error: 'Failed to claim rewards: ' + blockchainError.message 
      });
    }
    
  } catch (error) {
    console.error('[Claim Rewards Error]', error);
    res.status(500).json({ error: 'Failed to claim rewards: ' + error.message });
  }
});

// Helper: Get tier from reputation score
function getTierFromScore(score) {
  if (score >= 91) return 'Guardian';
  if (score >= 76) return 'Expert';
  if (score >= 51) return 'Trusted';
  if (score >= 26) return 'Regular';
  return 'Newcomer';
}

export default router;
