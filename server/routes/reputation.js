import express from 'express';
import { getReputation } from '../services/reputation.js';
import User from '../models/User.js';
import Report from '../models/Report.js';
import Session from '../models/Session.js';
import JuryVote from '../models/JuryVote.js';

const router = express.Router();

// GET /api/reputation/:walletAddress - Get user's reputation data
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Get user from DB (case-insensitive)
    const user = await User.findOne({ wallet: { $regex: new RegExp(`^${walletAddress}$`, 'i') } });
    const wallet = user?.wallet?.toLowerCase() || walletAddress.toLowerCase();
    
    // Get reputation data
    const repData = await getReputation(wallet);
    
    // Get report stats
    let totalReports = 0;
    let acceptedReports = 0;
    let rejectedReports = 0;
    
    if (user) {
      // Find all sessions by this user
      const sessions = await Session.find({ odacityUserId: user.odacityUserId });
      const sessionIds = sessions.map(s => s.sessionId);
      
      // Get reports for these sessions
      const reports = await Report.find({ sessionId: { $in: sessionIds } });
      totalReports = reports.length;
      acceptedReports = reports.filter(r => r.status === 'verified').length;
      rejectedReports = reports.filter(r => r.status === 'rejected').length;
    }
    
    // Get jury vote stats
    const juryVotes = await JuryVote.find({ voterWallet: wallet });
    const totalJuryVotes = juryVotes.length;
    
    // Calculate correct votes (votes that matched final verdict)
    let correctVotes = 0;
    for (const vote of juryVotes) {
      const votedReport = await Report.findById(vote.reportId);
      if (votedReport) {
        const voteMatchesVerdict = 
          (vote.vote === 'valid' && votedReport.status === 'verified') ||
          (vote.vote === 'invalid' && votedReport.status === 'rejected');
        if (voteMatchesVerdict) {
          correctVotes++;
        }
      }
    }
    
    // Format history for frontend
    const recentActivity = (repData.history || []).slice(-10).reverse().map(h => ({
      description: h.reason || 'Reputation change',
      change: `${h.change >= 0 ? '+' : ''}${h.change}`,
      date: new Date(h.timestamp).toLocaleDateString()
    }));
    
    // Generate ENS-like alias
    const ensAlias = `sayless-${wallet.slice(-4)}.eth`;
    
    res.json({
      walletAddress: wallet,
      ensAlias,
      score: repData.reporterReputation,
      juryReputation: repData.juryReputation,
      voteWeight: Math.max(1, Math.min(10, Math.floor(repData.juryReputation / 10))),
      totalReports,
      acceptedReports,
      rejectedReports,
      juryVotes: totalJuryVotes,
      correctVotes,
      rewardsEarned: `${(acceptedReports * 0.005).toFixed(3)} ETH`,
      penaltiesReceived: '0 ETH',
      recentActivity,
      history: repData.history.slice(-20)
    });
    
  } catch (error) {
    console.error('[Reputation Error]', error);
    res.status(500).json({ error: 'Failed to fetch reputation' });
  }
});

export default router;

