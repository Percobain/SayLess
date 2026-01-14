import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet, Copy, Check, ArrowUpRight, ArrowDownLeft, 
  Coins, Lock, Download, ExternalLink 
} from 'lucide-react';
import Layout from '../components/Layout';
import NeoCard from '../components/NeoCard';
import NeoButton from '../components/NeoButton';

// Mock wallet data
const mockWallet = {
  address: '0x7a3B...9f4E',
  fullAddress: '0x7a3B4c5D6e7F8g9H0i1J2k3L4m5N6o7P8q9f4E',
  balances: {
    eth: '0.0847',
    usdc: '125.50',
  },
};

const mockTransactions = [
  { id: 1, type: 'reward', amount: '+0.005 ETH', label: 'Report Verified', time: '2 hours ago', hash: '0x1a2b...3c4d' },
  { id: 2, type: 'stake', amount: '-0.001 ETH', label: 'Report Stake', time: '1 day ago', hash: '0x5e6f...7g8h' },
  { id: 3, type: 'reward', amount: '+0.008 ETH', label: 'Report Verified', time: '3 days ago', hash: '0x9i0j...1k2l' },
  { id: 4, type: 'stake', amount: '-0.001 ETH', label: 'Report Stake', time: '5 days ago', hash: '0x3m4n...5o6p' },
  { id: 5, type: 'reward', amount: '+0.003 ETH', label: 'Jury Reward', time: '1 week ago', hash: '0x7q8r...9s0t' },
];

export default function WalletDashboard() {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(mockWallet.fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Wallet Dashboard
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Your anonymous custodial wallet. Stake reports and claim rewards.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Wallet Address */}
          <NeoCard variant="black" className="p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-neo-purple border-[3px] border-neo-white flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-neo-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Wallet Address</p>
                  <p className="font-mono font-bold text-neo-white text-lg">{mockWallet.address}</p>
                </div>
              </div>
              <button
                onClick={copyAddress}
                className="p-3 hover:bg-gray-800 rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-6 h-6 text-neo-green" />
                ) : (
                  <Copy className="w-6 h-6 text-gray-400" />
                )}
              </button>
            </div>
          </NeoCard>

          {/* Balances */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <NeoCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500 uppercase font-bold">ETH Balance</p>
                <div className="w-10 h-10 bg-blue-500 border-[3px] border-neo-black flex items-center justify-center">
                  <span className="text-neo-white font-bold">Ξ</span>
                </div>
              </div>
              <p className="text-4xl font-heading font-bold">{mockWallet.balances.eth}</p>
              <p className="text-gray-500 text-sm">≈ $254.23 USD</p>
            </NeoCard>

            <NeoCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500 uppercase font-bold">USDC Balance</p>
                <div className="w-10 h-10 bg-neo-green border-[3px] border-neo-black flex items-center justify-center">
                  <span className="text-neo-black font-bold">$</span>
                </div>
              </div>
              <p className="text-4xl font-heading font-bold">{mockWallet.balances.usdc}</p>
              <p className="text-gray-500 text-sm">Stablecoin</p>
            </NeoCard>
          </div>

          {/* Action Buttons */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <NeoButton variant="orange" size="lg" className="w-full">
              <Lock className="w-5 h-5 mr-2" />
              Stake ETH
            </NeoButton>
            <NeoButton variant="green" size="lg" className="w-full">
              <Coins className="w-5 h-5 mr-2" />
              Claim Rewards
            </NeoButton>
            <NeoButton variant="purple" size="lg" className="w-full">
              <Download className="w-5 h-5 mr-2" />
              Export Wallet
            </NeoButton>
          </div>

          {/* Transaction History */}
          <NeoCard className="overflow-hidden">
            <div className="p-4 border-b-[3px] border-neo-black bg-gray-100">
              <h2 className="font-heading font-bold text-lg">Transaction History</h2>
            </div>
            <div className="divide-y-[2px] divide-neo-black">
              {mockTransactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-10 h-10 border-[3px] border-neo-black flex items-center justify-center
                      ${tx.type === 'reward' ? 'bg-neo-green' : 'bg-neo-orange'}
                    `}>
                      {tx.type === 'reward' ? (
                        <ArrowDownLeft className="w-5 h-5 text-neo-black" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-neo-black" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold">{tx.label}</p>
                      <p className="text-sm text-gray-500">{tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-bold ${tx.type === 'reward' ? 'text-green-600' : 'text-gray-600'}`}>
                      {tx.amount}
                    </p>
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-neo-orange flex items-center gap-1 justify-end"
                    >
                      {tx.hash}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </NeoCard>

          {/* Info */}
          <NeoCard variant="black" className="p-4 mt-8">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-neo-orange flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-neo-white font-bold text-sm">Custodial Wallet</p>
                <p className="text-gray-400 text-xs mt-1">
                  This wallet is managed by SAYLESS protocol. You can export your private key at any time.
                  All transactions are recorded on Ethereum Sepolia testnet.
                </p>
              </div>
            </div>
          </NeoCard>
        </div>
      </div>
    </Layout>
  );
}
