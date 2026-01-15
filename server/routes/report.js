import express from 'express';
import Session from '../models/Session.js';
import Report from '../models/Report.js';
import User from '../models/User.js';
import { pinJSONToIPFS } from '../services/pinata.js';
import { submitReport, computeKeccak256 } from '../services/blockchain.js';

const router = express.Router();

// GET /api/session/:id - Check if session is valid
router.get('/session/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findOne({ 
      sessionId: id.toUpperCase(),
      status: 'pending'
    });
    
    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found or already used',
        valid: false 
      });
    }
    
    // Check if expired
    if (new Date() > session.expiresAt) {
      return res.status(410).json({ 
        error: 'Session expired',
        valid: false 
      });
    }

    // Fetch user wallet context
    const user = await User.findOne({ odacityUserId: session.odacityUserId });
    
    res.json({ 
      valid: true,
      sessionId: session.sessionId,
      expiresAt: session.expiresAt,
      wallet: user ? user.wallet : null
    });
    
  } catch (error) {
    console.error('[Session Check Error]', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/report - Submit encrypted report
router.post('/report', async (req, res) => {
  try {
    const { sessionId, payload } = req.body;
    
    if (!sessionId || !payload) {
      return res.status(400).json({ error: 'Missing sessionId or payload' });
    }
    
    // 1. Validate session exists and is pending
    const session = await Session.findOne({ 
      sessionId: sessionId.toUpperCase(),
      status: 'pending'
    });
    
    if (!session) {
      return res.status(400).json({ error: 'Invalid or expired session' });
    }
    
    // 2. Get user's wallet
    const user = await User.findOne({ odacityUserId: session.odacityUserId });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    console.log(`[Report] Submitting report for session ${sessionId}`);
    console.log(`[Report] Reporter wallet: ${user.wallet}`);
    
    // 3. Pin encrypted payload to IPFS
    console.log('[Report] Pinning to IPFS...');
    const pinataRes = await pinJSONToIPFS(payload);
    const cid = pinataRes.IpfsHash;
    console.log(`[Report] IPFS CID: ${cid}`);
    
    // 4. Compute hashes
    const cidHash = computeKeccak256(cid);
    const sessionHash = computeKeccak256(sessionId);
    console.log(`[Report] CID Hash: ${cidHash}`);
    
    // 5. Submit to blockchain
    console.log('[Report] Submitting to blockchain...');
    const { txHash, reportId } = await submitReport(cidHash, sessionHash, user.wallet);
    console.log(`[Report] TX: ${txHash}, Report ID: ${reportId}`);
    
    // 6. Update session
    session.status = 'under_review';
    session.reportCid = cid;
    session.cidHash = cidHash;
    session.txHash = txHash;
    session.contractReportId = reportId;
    await session.save();
    
    // 7. Create report record
    await Report.create({
      sessionId: sessionId.toUpperCase(),
      cid,
      cidHash,
      status: 'under_review'
    });
    
    res.json({
      success: true,
      cid,
      cidHash,
      txHash,
      reportId,
      message: 'Report submitted successfully'
    });
    
  } catch (error) {
    console.error('[Report Submit Error]', error);
    res.status(500).json({ error: 'Submission failed: ' + error.message });
  }
});

export default router;
