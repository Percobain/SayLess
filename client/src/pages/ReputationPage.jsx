import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Award, TrendingUp, TrendingDown, CheckCircle, XCircle, Info, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import NeoCard from '../components/NeoCard';
import NeoButton from '../components/NeoButton';
import { useI18n } from '../context/I18nContext';
import { useSession } from '../context/SessionContext';
import { getReputationData } from '../lib/api';

export default function ReputationPage() {
  const { t } = useI18n();
  const { walletAddress, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [showExplainer, setShowExplainer] = useState(false);

  const reputationTiers = [
    { name: t('reputation.tiers.newcomer'), min: 0, max: 25, color: 'bg-gray-400' },
    { name: t('reputation.tiers.regular'), min: 26, max: 50, color: 'bg-blue-400' },
    { name: t('reputation.tiers.trusted'), min: 51, max: 75, color: 'bg-neo-purple' },
    { name: t('reputation.tiers.expert'), min: 76, max: 90, color: 'bg-neo-green' },
    { name: t('reputation.tiers.guardian'), min: 91, max: 100, color: 'bg-neo-orange' },
  ];
  const [loading, setLoading] = useState(true);
  const [reputation, setReputation] = useState({
    ensAlias: 'sayless-xxxx.eth',
    score: 0,
    tier: 'Newcomer',
    totalReports: 0,
    acceptedReports: 0,
    rejectedReports: 0,
    juryVotes: 0,
    correctVotes: 0,
    rewardsEarned: '0 ETH',
    penaltiesReceived: '0 ETH',
    recentActivity: []
  });

  useEffect(() => {
    if (sessionLoading) return;
    
    // Redirect if no wallet
    const wallet = walletAddress || localStorage.getItem('walletAddress');
    if (!wallet) {
      navigate('/reporter');
      return;
    }

    async function loadData() {
      try {
        const data = await getReputationData(wallet);
        if (!data.error) {
          setReputation(data);
        }
      } catch (error) {
        console.error('Failed to load reputation data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sessionLoading, walletAddress, navigate]);

  const currentTier = reputationTiers.find(
    t => reputation.score >= t.min && reputation.score <= t.max
  ) || reputationTiers[0];

  const acceptRate = reputation.totalReports > 0 
    ? Math.round((reputation.acceptedReports / reputation.totalReports) * 100) 
    : 0;
  const voteAccuracy = reputation.juryVotes > 0 
    ? Math.round((reputation.correctVotes / reputation.juryVotes) * 100) 
    : 0;

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
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            {t('reputation.title')}
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            {t('reputation.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* ENS Badge */}
          <NeoCard variant="black" className="p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-neo-purple border-[3px] border-neo-white flex items-center justify-center">
                  <Shield className="w-8 h-8 text-neo-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">{t('reputation.anonymousIdentity')}</p>
                  <p className="font-mono font-bold text-2xl text-neo-orange">{reputation.ensAlias}</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-6xl font-heading font-bold text-neo-white">{reputation.score}</p>
                <span className={`neo-badge ${currentTier.color} text-neo-black`}>
                  {currentTier.name}
                </span>
              </div>
            </div>
          </NeoCard>

          {/* Score Meter */}
          <NeoCard className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg">{t('reputation.reputationScore')}</h3>
              <button
                onClick={() => setShowExplainer(!showExplainer)}
                className="neo-btn p-2"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {/* Score Bar */}
            <div className="relative mb-4">
              <div className="h-8 bg-gray-200 border-[3px] border-neo-black flex">
                {reputationTiers.map((tier, i) => (
                  <div
                    key={tier.name}
                    className={`${tier.color} flex-1 ${i < reputationTiers.length - 1 ? 'border-r-[2px] border-neo-black' : ''}`}
                  />
                ))}
              </div>
              {/* Indicator */}
              <div
                className="absolute top-0 w-1 h-8 bg-neo-black"
                style={{ left: `${reputation.score}%`, transform: 'translateX(-50%)' }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 neo-badge-orange text-xs">
                  {reputation.score}
                </div>
              </div>
            </div>

            {/* Tier Labels */}
            <div className="flex justify-between text-xs text-gray-500">
              {reputationTiers.map(tier => (
                <span key={tier.name}>{tier.name}</span>
              ))}
            </div>

            {/* Explainer */}
            {showExplainer && (
              <NeoCard className="mt-4 p-4 bg-gray-50">
                <h4 className="font-bold mb-2">{t('reputation.howItWorks')}</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• {t('reputation.verifiedReports')} <span className="text-green-600">+5 points</span></li>
                  <li>• {t('reputation.rejectedReports')} <span className="text-red-600">-3 points</span></li>
                  <li>• {t('reputation.correctJuryVotes')} <span className="text-green-600">+2 points</span></li>
                  <li>• {t('reputation.wrongJuryVotes')} <span className="text-red-600">-1 point</span></li>
                  <li>• {t('reputation.higherRepHigherWeight')}</li>
                </ul>
              </NeoCard>
            )}
          </NeoCard>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Report Stats */}
            <NeoCard className="p-6">
              <h3 className="font-heading font-bold text-lg mb-4">{t('reputation.reportStatistics')}</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('reputation.totalReports')}</span>
                  <span className="font-bold text-xl">{reputation.totalReports}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    {t('reputation.accepted')}
                  </span>
                  <span className="font-bold text-xl text-green-600">{reputation.acceptedReports}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-4 h-4" />
                    {t('reputation.rejected')}
                  </span>
                  <span className="font-bold text-xl text-red-600">{reputation.rejectedReports}</span>
                </div>

                {/* Accept Rate Bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{t('reputation.acceptanceRate')}</span>
                    <span className="font-bold">{acceptRate}%</span>
                  </div>
                  <div className="h-4 bg-gray-200 border-[2px] border-neo-black overflow-hidden">
                    <div
                      className="h-full bg-neo-green"
                      style={{ width: `${acceptRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </NeoCard>

            {/* Jury Stats */}
            <NeoCard className="p-6">
              <h3 className="font-heading font-bold text-lg mb-4">{t('reputation.juryParticipation')}</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('reputation.totalVotes')}</span>
                  <span className="font-bold text-xl">{reputation.juryVotes}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    {t('reputation.correct')}
                  </span>
                  <span className="font-bold text-xl text-green-600">{reputation.correctVotes}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-red-600">
                    <TrendingDown className="w-4 h-4" />
                    {t('reputation.incorrect')}
                  </span>
                  <span className="font-bold text-xl text-red-600">{reputation.juryVotes - reputation.correctVotes}</span>
                </div>

                {/* Accuracy Bar */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{t('reputation.voteAccuracy')}</span>
                    <span className="font-bold">{voteAccuracy}%</span>
                  </div>
                  <div className="h-4 bg-gray-200 border-[2px] border-neo-black overflow-hidden">
                    <div
                      className="h-full bg-neo-purple"
                      style={{ width: `${voteAccuracy}%` }}
                    />
                  </div>
                </div>
              </div>
            </NeoCard>
          </div>

          {/* Earnings */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <NeoCard variant="green" className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6" />
                <span className="font-heading font-bold">{t('reputation.rewardsEarned')}</span>
              </div>
              <p className="text-3xl font-heading font-bold">{reputation.rewardsEarned}</p>
            </NeoCard>

            <NeoCard className="p-6 bg-red-100">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-6 h-6 text-red-600" />
                <span className="font-heading font-bold text-red-600">{t('reputation.penalties')}</span>
              </div>
              <p className="text-3xl font-heading font-bold text-red-600">{reputation.penaltiesReceived}</p>
            </NeoCard>
          </div>

          {/* Recent Activity */}
          <NeoCard className="overflow-hidden">
            <div className="p-4 border-b-[3px] border-neo-black bg-gray-100">
              <h3 className="font-heading font-bold text-lg">{t('reputation.recentActivity')}</h3>
            </div>
            <div className="divide-y-[2px] divide-neo-black">
              {(reputation.recentActivity || []).map((activity, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 border-[2px] border-neo-black flex items-center justify-center
                      ${activity.change.startsWith('+') ? 'bg-neo-green' : 'bg-red-400'}
                    `}>
                      {activity.change.startsWith('+') ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                  <span className={`font-mono font-bold ${activity.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {activity.change}
                  </span>
                </div>
              ))}
            </div>
          </NeoCard>
        </div>
      </div>
    </Layout>
  );
}
