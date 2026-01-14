const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  whatsappHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  odacityUserId: {
    type: String,
    required: true,
    unique: true
  },
  wallet: {
    type: String,
    required: true
  },
  privateKey: {
    type: String,
    default: 'privy-managed'
  },
  privyUserId: {
    type: String,
    default: null
  },
  reputation: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
