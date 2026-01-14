import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  cid: {
    type: String,
    required: true
  },
  cidHash: {
    type: String,
    required: true
  },
  decryptedContent: {
    type: String,
    default: null
  },
  aiAnalysis: {
    isSpam: { type: Boolean, default: null },
    urgencyScore: { type: Number, default: null },
    category: { type: String, default: null },
    credibilityScore: { type: Number, default: null },
    reasoning: { type: String, default: null },
    suggestedAction: { type: String, default: null }
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'rejected'],
    default: 'under_review'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Report', reportSchema);
