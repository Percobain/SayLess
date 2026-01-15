import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wallet, Copy, Check, ArrowUpRight, ArrowDownLeft, 
  Coins, Lock, Download, ExternalLink, TrendingUp, Shield, Loader2
} from 'lucide-react';
import Layout from '../components/Layout';
import NeoCard from '../components/NeoCard';
import NeoButton from '../components/NeoButton';
import { useSession } from '../context/SessionContext';
import { getWalletData } from '../lib/api';

export default function WalletDashboard() {
  const { walletAddress, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState({
    address: '0x....',
    fullAddress: '',
    balances: { eth: '0', usdc: '0' },
    pendingRewards: '0',
    stakedAmount: '0',
    pendingReportCount: 0,
    transactions: []
  });

  useEffect(() => {
    if (sessionLoading) return;
    
    // Redirect if no wallet
    const currentWallet = walletAddress || localStorage.getItem('walletAddress');
    if (!currentWallet) {
      navigate('/reporter');
      return;
    }

    async function loadData() {
      try {
        const data = await getWalletData(currentWallet);
        if (!data.error) {
          setWallet(data);
        }
      } catch (error) {
        console.error('Failed to load wallet data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sessionLoading, walletAddress, navigate]);

  const copyAddress = () => {
    if (wallet.fullAddress) {
      navigator.clipboard.writeText(wallet.fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-neo-teal" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Header */}
      <section className="bg-neo-navy py-12 border-b-[4px] border-neo-navy">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="neo-badge-orange mb-4">
                  <Wallet className="w-4 h-4" />
                  Anonymous Wallet
                </div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-neo-cream mb-2">
                  Wallet Dashboard
                </h1>
                <p className="text-neo-cream/60">
                  Stake reports and claim your rewards
                </p>
              </div>

              {/* Wallet Address Card */}
              <NeoCard className="p-4 bg-neo-teal border-neo-teal">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neo-orange flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-neo-navy" />
                  </div>
                  <div>
                    <p className="text-xs text-neo-cream/70 uppercase">Address</p>
                    <p className="font-mono font-bold text-neo-cream">{wallet.address}</p>
                  </div>
                  <button
                    onClick={copyAddress}
                    className="ml-2 p-2 hover:bg-neo-navy/20 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-neo-orange" />
                    ) : (
                      <Copy className="w-5 h-5 text-neo-cream" />
                    )}
                  </button>
                </div>
              </NeoCard>
            </div>
          </div>
        </div>
      </section>

      {/* Balance Cards */}
      <section className="bg-neo-cream border-b-[4px] border-neo-navy">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x-[3px] divide-neo-navy">
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-navy">{wallet.balances.eth}</p>
              <p className="text-sm text-neo-navy/60">ETH Balance</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-teal">${wallet.balances.usdc}</p>
              <p className="text-sm text-neo-navy/60">USDC Balance</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-orange">{wallet.pendingRewards}</p>
              <p className="text-sm text-neo-navy/60">Pending Rewards</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-maroon">{wallet.stakedAmount}</p>
              <p className="text-sm text-neo-navy/60">Staked</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-neo-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Actions & Transactions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Action Buttons */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <NeoButton variant="orange" size="lg" className="w-full">
                    <Lock className="w-5 h-5 mr-2" />
                    Stake ETH
                  </NeoButton>
                  <NeoButton variant="teal" size="lg" className="w-full">
                    <Coins className="w-5 h-5 mr-2" />
                    Claim Rewards
                  </NeoButton>
                  <NeoButton variant="navy" size="lg" className="w-full">
                    <Download className="w-5 h-5 mr-2" />
                    Export Key
                  </NeoButton>
                </div>

                {/* Transaction History */}
                <NeoCard className="overflow-hidden">
                  <div className="p-4 border-b-[3px] border-neo-navy bg-neo-navy">
                    <h2 className="font-heading font-bold text-lg text-neo-cream">Transaction History</h2>
                  </div>
                  <div className="divide-y-[2px] divide-neo-navy">
                    {(wallet.transactions || []).map((tx) => (
                      <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-neo-cream/50">
                        <div className="flex items-center gap-4">
                          <div className={`
                            w-10 h-10 border-[3px] border-neo-navy flex items-center justify-center
                            ${tx.type === 'reward' ? 'bg-neo-teal' : 'bg-neo-orange'}
                          `}>
                            {tx.type === 'reward' ? (
                              <ArrowDownLeft className={`w-5 h-5 ${tx.type === 'reward' ? 'text-neo-cream' : 'text-neo-navy'}`} />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-neo-navy" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-neo-navy">{tx.label}</p>
                            <p className="text-sm text-neo-navy/60">{tx.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-mono font-bold ${tx.type === 'reward' ? 'text-neo-teal' : 'text-neo-maroon'}`}>
                            {tx.amount}
                          </p>
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-neo-navy/50 hover:text-neo-orange flex items-center gap-1 justify-end"
                          >
                            {tx.hash}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t-[2px] border-neo-navy text-center">
                    <a href="#" className="text-sm font-bold text-neo-teal hover:text-neo-orange">
                      View All Transactions →
                    </a>
                  </div>
                </NeoCard>
              </div>

              {/* Right Column - Info Cards */}
              <div className="space-y-6">
                {/* Balance Summary */}
                <NeoCard variant="navy" className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-neo-orange flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-neo-navy" />
                    </div>
                    <h3 className="font-heading font-bold text-neo-cream">Total Value</h3>
                  </div>
                  <p className="text-4xl font-heading font-bold text-neo-orange mb-1">$379.73</p>
                  <p className="text-neo-cream/60 text-sm">≈ 0.1097 ETH + 125.50 USDC</p>
                  <div className="mt-4 p-3 bg-neo-teal/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neo-cream/70">24h Change</span>
                      <span className="text-neo-teal font-bold">+$12.45 (3.4%)</span>
                    </div>
                  </div>
                </NeoCard>

                {/* Staking Info */}
                <NeoCard variant="teal" className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-neo-orange flex items-center justify-center">
                      <Lock className="w-5 h-5 text-neo-navy" />
                    </div>
                    <h3 className="font-heading font-bold text-neo-cream">Staking</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-neo-cream/80">
                    <li className="flex justify-between">
                      <span>Currently Staked</span>
                      <span className="font-bold text-neo-cream">{wallet.stakedAmount} ETH</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Pending Reports</span>
                      <span className="font-bold text-neo-cream">{wallet.pendingReportCount || 0}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Est. Returns</span>
                      <span className="font-bold text-neo-orange">+0.008 ETH</span>
                    </li>
                  </ul>
                </NeoCard>

                {/* Security Note */}
                <NeoCard variant="maroon" className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-neo-cream" />
                    <h3 className="font-heading font-bold text-neo-cream">Security</h3>
                  </div>
                  <p className="text-neo-cream/80 text-sm">
                    This is a custodial wallet managed by SAYLESS. You can export your private key at any time.
                    All transactions are on Ethereum Sepolia testnet.
                  </p>
                </NeoCard>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
