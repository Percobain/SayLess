import mongoose from 'mongoose';

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
  // Only store Privy wallet ID - wallet data comes from Privy API
  // Wallets created via Privy REST API automatically appear in Privy Dashboard
  privyWalletId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Wallet address cached for quick access (but fetched from Privy)
  wallet: {
    type: String,
    required: true
  },
  reputation: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
  // privateKey removed - Privy manages keys
  // privyUserId removed - not using Privy users
  // Note: Old MongoDB document with _id 696808c8842ef0bc7f9d81de has privateKey - can be ignored/migrated
});

export default mongoose.model('User', userSchema);
