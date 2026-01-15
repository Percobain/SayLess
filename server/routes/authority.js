import express from 'express';
import Report from '../models/Report.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { fetchFromIPFS } from '../services/pinata.js';
import { decryptReport, decryptFile } from '../services/crypto.js';
import { analyzeReport } from '../services/gemini.js';
import { searchWeb, generateSearchQuery } from '../services/tavily.js';
import { verifyReport, rejectReport, getReputation } from '../services/blockchain.js';

const router = express.Router();

// GET /api/authority/reports - List all reports
router.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    
    // Enrich with session data
    const enrichedReports = await Promise.all(reports.map(async (report) => {
      const session = await Session.findOne({ sessionId: report.sessionId });
      const user = session ? await User.findOne({ odacityUserId: session.odacityUserId }) : null;
      
      let reputation = 0;
      if (user) {
        try {
          reputation = Number(await getReputation(user.wallet));
        } catch (e) {}
      }
      
      return {
        _id: report._id,
        sessionId: report.sessionId,
        cid: report.cid,
        cidHash: report.cidHash,
        status: report.status,
        aiAnalysis: report.aiAnalysis,
        hasDecrypted: !!report.decryptedContent,
        contractReportId: session?.contractReportId,
        txHash: session?.txHash,
        reporterWallet: user?.wallet,
        reporterReputation: reputation,
        createdAt: report.createdAt
      };
    }));
    
    res.json(enrichedReports);
    
  } catch (error) {
    console.error('[Authority Reports Error]', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// POST /api/authority/decrypt/:id - Decrypt and analyze report
router.post('/decrypt/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    console.log(`[Authority] Decrypting report ${report.sessionId}`);
    
    // Fetch from IPFS
    console.log(`[Authority] Fetching from IPFS: ${report.cid}`);
    const encryptedPayload = await fetchFromIPFS(report.cid);
    
    // Decrypt using authority private key
    const authorityKey = process.env.AUTHORITY_PRIVATE_KEY;
    if (!authorityKey) {
      return res.status(500).json({ error: 'Authority key not configured' });
    }
    
    console.log('[Authority] Decrypting...');
    const decrypted = decryptReport(encryptedPayload, authorityKey);
    console.log('[Authority] Decryption successful');
    
    // Decrypt files if present
    let decryptedFiles = [];
    if (encryptedPayload.files && Array.isArray(encryptedPayload.files) && encryptedPayload.files.length > 0) {
      console.log(`[Authority] Decrypting ${encryptedPayload.files.length} file(s)...`);
      try {
        decryptedFiles = encryptedPayload.files.map((encryptedFile) => {
          return decryptFile(encryptedFile, authorityKey);
        });
        console.log('[Authority] Files decrypted successfully');
      } catch (fileError) {
        console.error('[Authority] File decryption error:', fileError);
        // Continue even if file decryption fails
      }
    }
    
    // Run web search for context
    console.log('[Authority] Searching web for context...');
    const searchQuery = generateSearchQuery(decrypted);
    const webContext = await searchWeb(searchQuery);
    console.log('[Authority] Web search completed:', webContext.success ? 'found results' : 'no results');
    
    // Run AI analysis with web context
    console.log('[Authority] Running AI analysis with web context...');
    const aiAnalysis = await analyzeReport(decrypted, webContext);
    console.log('[Authority] AI analysis:', aiAnalysis);
    
    // Save to report
    report.decryptedContent = decrypted;
    report.aiAnalysis = aiAnalysis;
    await report.save();
    
    res.json({
      decrypted,
      files: decryptedFiles,
      aiAnalysis,
      webContext: webContext.success ? {
        sources: webContext.sources,
        answer: webContext.answer
      } : null
    });
    
  } catch (error) {
    console.error('[Authority Decrypt Error]', error);
    res.status(500).json({ error: 'Decryption failed: ' + error.message });
  }
});

// POST /api/authority/verify/:id - Verify report and reward
router.post('/verify/:id', async (req, res) => {
  try {
    const { rewardAmount = '0.005' } = req.body;
    
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const session = await Session.findOne({ sessionId: report.sessionId });
    if (!session || session.contractReportId === null) {
      return res.status(400).json({ error: 'Session or contract report ID not found' });
    }
    
    console.log(`[Authority] Verifying report ${session.contractReportId} with reward ${rewardAmount} ETH`);
    
    // Call contract
    const txHash = await verifyReport(session.contractReportId, rewardAmount);
    
    // Update status
    report.status = 'verified';
    await report.save();
    
    session.status = 'verified';
    session.rewardAmount = rewardAmount;
    await session.save();
    
    res.json({ 
      success: true, 
      txHash,
      message: `Report verified. Reward: ${rewardAmount} ETH`
    });
    
  } catch (error) {
    console.error('[Authority Verify Error]', error);
    res.status(500).json({ error: 'Verification failed: ' + error.message });
  }
});

// POST /api/authority/reject/:id - Reject report
router.post('/reject/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const session = await Session.findOne({ sessionId: report.sessionId });
    if (!session || session.contractReportId === null) {
      return res.status(400).json({ error: 'Session or contract report ID not found' });
    }
    
    console.log(`[Authority] Rejecting report ${session.contractReportId}`);
    
    // Call contract
    const txHash = await rejectReport(session.contractReportId);
    
    // Update status
    report.status = 'rejected';
    await report.save();
    
    session.status = 'rejected';
    await session.save();
    
    res.json({ 
      success: true, 
      txHash,
      message: 'Report rejected. Reputation decreased.'
    });
    
  } catch (error) {
    console.error('[Authority Reject Error]', error);
    res.status(500).json({ error: 'Rejection failed: ' + error.message });
  }
});

// GET /api/authority/stats - Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Report.countDocuments();
    const pending = await Report.countDocuments({ status: 'under_review' });
    const verified = await Report.countDocuments({ status: 'verified' });
    const rejected = await Report.countDocuments({ status: 'rejected' });
    
    res.json({
      total,
      pending,
      verified,
      rejected
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
