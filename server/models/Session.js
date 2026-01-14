import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  odacityUserId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'rejected', 'closed'],
    default: 'pending'
  },
  reportCid: {
    type: String,
    default: null
  },
  cidHash: {
    type: String,
    default: null
  },
  txHash: {
    type: String,
    default: null
  },
  contractReportId: {
    type: Number,
    default: null
  },
  rewardAmount: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
});

// TTL index for automatic expiration of unused sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Session', sessionSchema);
