import User from '../models/User.js';
import JuryVote from '../models/JuryVote.js';

// Reputation constants
const REPUTATION = {
  INITIAL: 50,
  MIN: 0,
  MAX: 100,
  
  // Reporter events
  REPORT_VERIFIED: 10,
  REPORT_REJECTED: -5,
  
  // Jury events
  VOTE_WITH_MAJORITY: 3,
  VOTE_AGAINST_MAJORITY: -1,
  PARTICIPATION_BONUS: 1
};

/**
 * Update reporter reputation (DB only)
 * @param {string} walletAddress - User's wallet address
 * @param {number} change - Points to add (can be negative)
 * @param {string} reason - Reason for the change
 */
async function updateReporterReputation(walletAddress, change, reason) {
  try {
    const user = await User.findOne({ wallet: { $regex: new RegExp(`^${walletAddress}$`, 'i') } });
    if (!user) {
      console.log(`[Reputation] User not found for wallet: ${walletAddress}`);
      return null;
    }
    
    const oldRep = user.reputation || REPUTATION.INITIAL;
    let newRep = oldRep + change;
    
    // Clamp to min/max
    newRep = Math.max(REPUTATION.MIN, Math.min(REPUTATION.MAX, newRep));
    
    user.reputation = newRep;
    
    // Add to history
    if (!user.reputationHistory) {
      user.reputationHistory = [];
    }
    user.reputationHistory.push({
      type: 'reporter',
      change,
      reason,
      oldValue: oldRep,
      newValue: newRep,
      timestamp: new Date()
    });
    
    // Keep only last 50 history entries
    if (user.reputationHistory.length > 50) {
      user.reputationHistory = user.reputationHistory.slice(-50);
    }
    
    await user.save();
    
    console.log(`[Reputation] ${walletAddress}: ${oldRep} -> ${newRep} (${change > 0 ? '+' : ''}${change}) - ${reason}`);
    
    return { oldRep, newRep, change };
  } catch (error) {
    console.error('[Reputation] Error updating reporter reputation:', error);
    throw error;
  }
}

/**
 * Update jury member reputation (DB only)
 * @param {string} walletAddress - User's wallet address
 * @param {number} change - Points to add (can be negative)
 * @param {string} reason - Reason for the change
 */
async function updateJuryReputation(walletAddress, change, reason) {
  try {
    const user = await User.findOne({ wallet: { $regex: new RegExp(`^${walletAddress}$`, 'i') } });
    if (!user) {
      console.log(`[Reputation] User not found for wallet: ${walletAddress}`);
      return null;
    }
    
    const oldRep = user.juryReputation || REPUTATION.INITIAL;
    let newRep = oldRep + change;
    
    // Clamp to min/max
    newRep = Math.max(REPUTATION.MIN, Math.min(REPUTATION.MAX, newRep));
    
    user.juryReputation = newRep;
    
    // Add to history
    if (!user.reputationHistory) {
      user.reputationHistory = [];
    }
    user.reputationHistory.push({
      type: 'jury',
      change,
      reason,
      oldValue: oldRep,
      newValue: newRep,
      timestamp: new Date()
    });
    
    // Keep only last 50 history entries
    if (user.reputationHistory.length > 50) {
      user.reputationHistory = user.reputationHistory.slice(-50);
    }
    
    await user.save();
    
    console.log(`[Reputation] Jury ${walletAddress}: ${oldRep} -> ${newRep} (${change > 0 ? '+' : ''}${change}) - ${reason}`);
    
    return { oldRep, newRep, change };
  } catch (error) {
    console.error('[Reputation] Error updating jury reputation:', error);
    throw error;
  }
}

/**
 * Fix user reputation if it's 0 or missing (set to default 50)
 * @param {string} walletAddress - User's wallet address
 */
async function ensureReputationInitialized(walletAddress) {
  try {
    const user = await User.findOne({ wallet: { $regex: new RegExp(`^${walletAddress}$`, 'i') } });
    if (!user) {
      return null;
    }
    
    let updated = false;
    
    // Fix reporter reputation if 0 or missing
    if (!user.reputation || user.reputation === 0) {
      user.reputation = REPUTATION.INITIAL;
      updated = true;
      console.log(`[Reputation] Initialized reporter reputation for ${walletAddress} to ${REPUTATION.INITIAL}`);
    }
    
    // Fix jury reputation if 0 or missing
    if (!user.juryReputation || user.juryReputation === 0) {
      user.juryReputation = REPUTATION.INITIAL;
      updated = true;
      console.log(`[Reputation] Initialized jury reputation for ${walletAddress} to ${REPUTATION.INITIAL}`);
    }
    
    if (updated) {
      await user.save();
    }
    
    return {
      reporterReputation: user.reputation,
      juryReputation: user.juryReputation,
      history: user.reputationHistory || []
    };
  } catch (error) {
    console.error('[Reputation] Error ensuring reputation initialized:', error);
    return null;
  }
}

/**
 * Get user's reputation data from DB
 * @param {string} walletAddress - User's wallet address
 */
async function getReputation(walletAddress) {
  try {
    const user = await User.findOne({ wallet: { $regex: new RegExp(`^${walletAddress}$`, 'i') } });
    if (!user) {
      return {
        reporterReputation: REPUTATION.INITIAL,
        juryReputation: REPUTATION.INITIAL,
        history: []
      };
    }
    
    // Auto-fix reputation if it's 0 or missing
    if (!user.reputation || user.reputation === 0 || !user.juryReputation || user.juryReputation === 0) {
      const fixed = await ensureReputationInitialized(walletAddress);
      if (fixed) {
        return fixed;
      }
    }
    
    return {
      reporterReputation: user.reputation || REPUTATION.INITIAL,
      juryReputation: user.juryReputation || REPUTATION.INITIAL,
      history: user.reputationHistory || []
    };
  } catch (error) {
    console.error('[Reputation] Error getting reputation:', error);
    throw error;
  }
}

/**
 * Calculate and award jury reputations after a case is finalized (DB only)
 * @param {string} reportId - MongoDB report ID
 * @param {string} finalVerdict - 'verified' or 'rejected'
 */
async function calculateJuryVerdictReputations(reportId, finalVerdict) {
  try {
    const votes = await JuryVote.find({ reportId });
    
    if (votes.length === 0) {
      console.log(`[Reputation] No jury votes found for report ${reportId}`);
      return;
    }
    
    // Determine majority vote
    const validVotes = votes.filter(v => v.vote === 'valid');
    const invalidVotes = votes.filter(v => v.vote === 'invalid');
    const majorityVote = validVotes.length >= invalidVotes.length ? 'valid' : 'invalid';
    
    // Map final verdict to vote type
    const correctVote = finalVerdict === 'verified' ? 'valid' : 'invalid';
    
    console.log(`[Reputation] Processing ${votes.length} jury votes for report ${reportId}`);
    console.log(`[Reputation] Majority: ${majorityVote}, Correct: ${correctVote}`);
    
    for (const vote of votes) {
      // Participation bonus
      await updateJuryReputation(
        vote.voterWallet, 
        REPUTATION.PARTICIPATION_BONUS, 
        `Participation in case ${reportId.toString().slice(-6)}`
      );
      
      // Majority/minority bonus
      const votedWithMajority = vote.vote === majorityVote;
      const change = votedWithMajority ? REPUTATION.VOTE_WITH_MAJORITY : REPUTATION.VOTE_AGAINST_MAJORITY;
      const reason = votedWithMajority 
        ? `Voted with majority on case ${reportId.toString().slice(-6)}`
        : `Voted against majority on case ${reportId.toString().slice(-6)}`;
      
      await updateJuryReputation(vote.voterWallet, change, reason);
    }
    
    console.log(`[Reputation] Jury reputations updated for ${votes.length} voters`);
  } catch (error) {
    console.error('[Reputation] Error calculating jury verdicts:', error);
    throw error;
  }
}

/**
 * Get reputation score for vote weight calculation
 * @param {string} walletAddress - User's wallet address
 * @returns {number} Vote weight (1-10)
 */
async function getVoteWeight(walletAddress) {
  const repData = await getReputation(walletAddress);
  const juryRep = repData.juryReputation;
  return Math.max(1, Math.min(10, Math.floor(juryRep / 10)));
}

export {
  REPUTATION,
  updateReporterReputation,
  updateJuryReputation,
  getReputation,
  ensureReputationInitialized,
  calculateJuryVerdictReputations,
  getVoteWeight
};
