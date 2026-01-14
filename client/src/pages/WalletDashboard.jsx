import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet, Copy, Check, ArrowUpRight, ArrowDownLeft,
  Coins, Lock, Download, ExternalLink, TrendingUp, Shield
} from 'lucide-react';
import Layout from '../components/Layout';
import NeoCard from '../components/NeoCard';
import NeoButton from '../components/NeoButton';
import { useI18n } from '../context/I18nContext';

// Mock wallet data
const mockWallet = {
  address: '0x7a3B...9f4E',
  fullAddress: '0x7a3B4c5D6e7F8g9H0i1J2k3L4m5N6o7P8q9f4E',
  balances: {
    eth: '0.0847',
    usdc: '125.50',
  },
  pendingRewards: '0.012',
  stakedAmount: '0.025',
};

const mockTransactions = [
  { id: 1, type: 'reward', amount: '+0.005 ETH', labelKey: 'reportVerified', time: '2 hours ago', hash: '0x1a2b...3c4d' },
  { id: 2, type: 'stake', amount: '-0.001 ETH', labelKey: 'reportStake', time: '1 day ago', hash: '0x5e6f...7g8h' },
  { id: 3, type: 'reward', amount: '+0.008 ETH', labelKey: 'reportVerified', time: '3 days ago', hash: '0x9i0j...1k2l' },
  { id: 4, type: 'stake', amount: '-0.001 ETH', labelKey: 'reportStake', time: '5 days ago', hash: '0x3m4n...5o6p' },
  { id: 5, type: 'reward', amount: '+0.003 ETH', labelKey: 'juryReward', time: '1 week ago', hash: '0x7q8r...9s0t' },
];

export default function WalletDashboard() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(mockWallet.fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                  {t('wallet.badge')}
                </div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-neo-cream mb-2">
                  {t('wallet.title')}
                </h1>
                <p className="text-neo-cream/60">
                  {t('wallet.subtitle')}
                </p>
              </div>

              {/* Wallet Address Card */}
              <NeoCard className="p-4 bg-neo-teal border-neo-teal">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neo-orange flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-neo-navy" />
                  </div>
                  <div>
                    <p className="text-xs text-neo-cream/70 uppercase">{t('wallet.address')}</p>
                    <p className="font-mono font-bold text-neo-cream">{mockWallet.address}</p>
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
              <p className="text-4xl font-heading font-bold text-neo-navy">{mockWallet.balances.eth}</p>
              <p className="text-sm text-neo-navy/60">{t('wallet.ethBalance')}</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-teal">${mockWallet.balances.usdc}</p>
              <p className="text-sm text-neo-navy/60">{t('wallet.usdcBalance')}</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-orange">{mockWallet.pendingRewards}</p>
              <p className="text-sm text-neo-navy/60">{t('wallet.pendingRewards')}</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-maroon">{mockWallet.stakedAmount}</p>
              <p className="text-sm text-neo-navy/60">{t('wallet.staked')}</p>
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
                    {t('wallet.stakeEth')}
                  </NeoButton>
                  <NeoButton variant="teal" size="lg" className="w-full">
                    <Coins className="w-5 h-5 mr-2" />
                    {t('wallet.claimRewards')}
                  </NeoButton>
                  <NeoButton variant="navy" size="lg" className="w-full">
                    <Download className="w-5 h-5 mr-2" />
                    {t('wallet.exportKey')}
                  </NeoButton>
                </div>

                {/* Transaction History */}
                <NeoCard className="overflow-hidden">
                  <div className="p-4 border-b-[3px] border-neo-navy bg-neo-navy">
                    <h2 className="font-heading font-bold text-lg text-neo-cream">{t('wallet.transactionHistory')}</h2>
                  </div>
                  <div className="divide-y-[2px] divide-neo-navy">
                    {mockTransactions.map((tx) => (
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
                            <p className="font-bold text-neo-navy">{t(`wallet.${tx.labelKey}`)}</p>
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
                      {t('wallet.viewAllTransactions')}
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
                    <h3 className="font-heading font-bold text-neo-cream">{t('wallet.totalValue')}</h3>
                  </div>
                  <p className="text-4xl font-heading font-bold text-neo-orange mb-1">$379.73</p>
                  <p className="text-neo-cream/60 text-sm">≈ 0.1097 ETH + 125.50 USDC</p>
                  <div className="mt-4 p-3 bg-neo-teal/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neo-cream/70">{t('wallet.change24h')}</span>
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
                    <h3 className="font-heading font-bold text-neo-cream">{t('wallet.staking')}</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-neo-cream/80">
                    <li className="flex justify-between">
                      <span>{t('wallet.currentlyStaked')}</span>
                      <span className="font-bold text-neo-cream">{mockWallet.stakedAmount} ETH</span>
                    </li>
                    <li className="flex justify-between">
                      <span>{t('wallet.pendingReportsCount')}</span>
                      <span className="font-bold text-neo-cream">2</span>
                    </li>
                    <li className="flex justify-between">
                      <span>{t('wallet.estReturns')}</span>
                      <span className="font-bold text-neo-orange">+0.008 ETH</span>
                    </li>
                  </ul>
                </NeoCard>

                {/* Security Note */}
                <NeoCard variant="maroon" className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-neo-cream" />
                    <h3 className="font-heading font-bold text-neo-cream">{t('wallet.security')}</h3>
                  </div>
                  <p className="text-neo-cream/80 text-sm">
                    {t('wallet.securityNote')}
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
