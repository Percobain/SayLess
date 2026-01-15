import mongoose from 'mongoose';

const juryVoteSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true,
    index: true
  },
  voterWallet: {
    type: String,
    required: true,
    index: true
  },
  vote: {
    type: String,
    enum: ['valid', 'invalid'],
    required: true
  },
  weight: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one vote per user per report
juryVoteSchema.index({ reportId: 1, voterWallet: 1 }, { unique: true });

export default mongoose.model('JuryVote', juryVoteSchema);
