import express from 'express';
import Report from '../models/Report.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import JuryVote from '../models/JuryVote.js';
import { getReputation as getReputationDB, getVoteWeight } from '../services/reputation.js';

const router = express.Router();

// GET /api/jury/cases - Get all reports under review for jury
router.get('/cases', async (req, res) => {
  try {
    const reports = await Report.find({ status: 'under_review' }).sort({ createdAt: -1 });
    
    // Enrich with session data and vote tallies
    const enrichedCases = await Promise.all(reports.map(async (report) => {
      const session = await Session.findOne({ sessionId: report.sessionId });
      const user = session ? await User.findOne({ odacityUserId: session.odacityUserId }) : null;
      
      // Get reporter reputation from DB
      let reporterReputation = 50;
      if (user) {
        const repData = await getReputationDB(user.wallet);
        reporterReputation = repData.reporterReputation;
      }
      
      // Get vote tallies
      const votes = await JuryVote.find({ reportId: report._id });
      const validVotes = votes.filter(v => v.vote === 'valid');
      const invalidVotes = votes.filter(v => v.vote === 'invalid');
      
      // Calculate weighted votes
      const validWeight = validVotes.reduce((sum, v) => sum + v.weight, 0);
      const invalidWeight = invalidVotes.reduce((sum, v) => sum + v.weight, 0);
      const totalWeight = validWeight + invalidWeight;
      
      return {
        _id: report._id,
        sessionId: report.sessionId,
        cid: report.cid,
        status: report.status,
        aiAnalysis: report.aiAnalysis,
        contractReportId: session?.contractReportId,
        txHash: session?.txHash,
        reporterWallet: user?.wallet,
        reporterReputation,
        createdAt: report.createdAt,
        votes: {
          valid: validVotes.length,
          invalid: invalidVotes.length,
          validWeight,
          invalidWeight,
          totalVoters: votes.length,
          validPercent: totalWeight > 0 ? Math.round((validWeight / totalWeight) * 100) : 0,
          invalidPercent: totalWeight > 0 ? Math.round((invalidWeight / totalWeight) * 100) : 0
        }
      };
    }));
    
    res.json(enrichedCases);
    
  } catch (error) {
    console.error('[Jury Cases Error]', error);
    res.status(500).json({ error: 'Failed to fetch jury cases' });
  }
});

// POST /api/jury/vote/:reportId - Submit vote for a report
router.post('/vote/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { vote, walletAddress } = req.body;
    
    if (!vote || !walletAddress) {
      return res.status(400).json({ error: 'Missing vote or walletAddress' });
    }
    
    if (!['valid', 'invalid'].includes(vote)) {
      return res.status(400).json({ error: 'Vote must be "valid" or "invalid"' });
    }
    
    // Verify report exists and is under review
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    if (report.status !== 'under_review') {
      return res.status(400).json({ error: 'Report is not under review' });
    }
    
    // Check if user already voted
    const existingVote = await JuryVote.findOne({ 
      reportId, 
      voterWallet: walletAddress.toLowerCase() 
    });
    
    if (existingVote) {
      return res.status(400).json({ error: 'You have already voted on this report' });
    }
    
    // Get voter reputation for weight calculation from DB
    let weight = 5;
    try {
      weight = await getVoteWeight(walletAddress);
    } catch (e) {
      console.log('Could not get reputation for weight, using default 5');
    }
    
    // Create vote
    const juryVote = await JuryVote.create({
      reportId,
      voterWallet: walletAddress.toLowerCase(),
      vote,
      weight
    });
    
    console.log(`[Jury] Vote recorded: ${walletAddress} voted ${vote} on ${reportId} (weight: ${weight})`);
    
    res.json({
      success: true,
      vote: juryVote.vote,
      weight: juryVote.weight,
      message: `Vote recorded: ${vote}`
    });
    
  } catch (error) {
    console.error('[Jury Vote Error]', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already voted on this report' });
    }
    res.status(500).json({ error: 'Failed to submit vote: ' + error.message });
  }
});

// GET /api/jury/votes/:reportId - Get vote tallies for a report
router.get('/votes/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const votes = await JuryVote.find({ reportId });
    const validVotes = votes.filter(v => v.vote === 'valid');
    const invalidVotes = votes.filter(v => v.vote === 'invalid');
    
    const validWeight = validVotes.reduce((sum, v) => sum + v.weight, 0);
    const invalidWeight = invalidVotes.reduce((sum, v) => sum + v.weight, 0);
    const totalWeight = validWeight + invalidWeight;
    
    res.json({
      valid: validVotes.length,
      invalid: invalidVotes.length,
      validWeight,
      invalidWeight,
      totalVoters: votes.length,
      validPercent: totalWeight > 0 ? Math.round((validWeight / totalWeight) * 100) : 0,
      invalidPercent: totalWeight > 0 ? Math.round((invalidWeight / totalWeight) * 100) : 0
    });
    
  } catch (error) {
    console.error('[Jury Votes Error]', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

// GET /api/jury/stats/:walletAddress - Get user's jury participation stats
router.get('/stats/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Get all votes by this user
    const userVotes = await JuryVote.find({ voterWallet: walletAddress.toLowerCase() });
    
    // Get user reputation from DB
    let juryReputation = 50;
    let reporterReputation = 50;
    try {
      const repData = await getReputationDB(walletAddress);
      juryReputation = repData.juryReputation;
      reporterReputation = repData.reporterReputation;
    } catch (e) {}
    
    // Calculate stats
    const casesJudged = userVotes.length;
    
    // Calculate success rate by checking which votes matched final verdicts
    let correctVotes = 0;
    for (const vote of userVotes) {
      const votedReport = await Report.findById(vote.reportId);
      if (votedReport && (votedReport.status === 'verified' || votedReport.status === 'rejected')) {
        const voteMatchesVerdict = 
          (vote.vote === 'valid' && votedReport.status === 'verified') ||
          (vote.vote === 'invalid' && votedReport.status === 'rejected');
        if (voteMatchesVerdict) {
          correctVotes++;
        }
      }
    }
    const successRate = casesJudged > 0 ? Math.round((correctVotes / casesJudged) * 100) : 0;
    
    res.json({
      reputation: juryReputation,
      reporterReputation,
      voteWeight: Math.max(1, Math.min(10, Math.floor(juryReputation / 10))),
      casesJudged,
      successRate,
      recentVotes: userVotes.slice(-5).map(v => ({
        reportId: v.reportId,
        vote: v.vote,
        weight: v.weight,
        createdAt: v.createdAt
      }))
    });
    
  } catch (error) {
    console.error('[Jury Stats Error]', error);
    res.status(500).json({ error: 'Failed to fetch jury stats' });
  }
});

// GET /api/jury/user-votes/:walletAddress - Get all votes by a user (for checking voted status)
router.get('/user-votes/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const userVotes = await JuryVote.find({ voterWallet: walletAddress.toLowerCase() });
    
    // Return as a map of reportId -> vote for easy lookup
    const votesMap = {};
    userVotes.forEach(v => {
      votesMap[v.reportId.toString()] = v.vote;
    });
    
    res.json(votesMap);
    
  } catch (error) {
    console.error('[Jury User Votes Error]', error);
    res.status(500).json({ error: 'Failed to fetch user votes' });
  }
});

export default router;
