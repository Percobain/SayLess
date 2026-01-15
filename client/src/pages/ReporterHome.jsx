import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Radio, Award, Coins, Hash, TrendingUp, Shield, 
  Copy, Check, ArrowRight, Clock, CheckCircle, XCircle, Zap, Loader2 
} from 'lucide-react';
import Layout from '../components/Layout';
import NeoCard from '../components/NeoCard';
import NeoButton from '../components/NeoButton';
import { useSession } from '../context/SessionContext';
import { getReporterStats, getReporterReports } from '../lib/api';

export default function ReporterHome() {
  const { session, sessionId, walletAddress, createNewSession, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    reportCount: 0,
    stakeUsed: '0 ETH',
    reputationScore: 0,
    pendingRewards: '0 ETH',
  });
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    async function loadData() {
      // Wait for session context to load
      if (sessionLoading) return;
      
      try {
        const wallet = walletAddress;
        
        // If no wallet/session, user needs to generate one via Twilio chatbot
        if (!wallet) {
          console.log('No wallet found - user needs to generate session via WhatsApp');
          setLoading(false);
          return;
        }

        // Fetch stats if we have a wallet
        const statsRes = await getReporterStats(wallet);
        if (!statsRes.error) {
          setStats(statsRes);
        }

        // Fetch recent reports
        const reportsRes = await getReporterReports(wallet, 5);
        if (Array.isArray(reportsRes)) {
          setRecentReports(reportsRes);
        }
      } catch (error) {
        console.error('Failed to load reporter data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sessionLoading, walletAddress]);

  const copySessionId = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      verified: { bg: 'bg-neo-teal', icon: CheckCircle, label: 'Verified' },
      pending: { bg: 'bg-neo-orange', icon: Clock, label: 'Pending' },
      under_review: { bg: 'bg-neo-orange', icon: Clock, label: 'Pending' },
      rejected: { bg: 'bg-neo-maroon', icon: XCircle, label: 'Rejected' },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase ${badge.bg} ${status === 'pending' || status === 'under_review' ? 'text-neo-navy' : 'text-neo-cream'} border-[2px] border-neo-navy`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
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

  // Show prompt to generate session if no wallet/session exists
  if (!walletAddress || !sessionId) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-neo-navy">
          <NeoCard className="p-8 text-center max-w-md">
            <div className="w-20 h-20 bg-neo-teal border-[3px] border-neo-navy flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-neo-cream" />
            </div>
            <h2 className="text-3xl font-heading font-bold mb-2 text-neo-navy">No Active Session</h2>
            <p className="text-neo-navy/70 mb-6">
              To submit anonymous reports, you need to generate a secure session via our WhatsApp chatbot.
            </p>
            <NeoCard variant="teal" className="p-4 mb-6 text-left">
              <p className="text-neo-cream text-sm font-bold mb-2">How to get started:</p>
              <ol className="text-neo-cream/80 text-sm space-y-2">
                <li>1. Message our WhatsApp chatbot</li>
                <li>2. Request a new report session</li>
                <li>3. Click the link you receive</li>
              </ol>
            </NeoCard>
            <Link to="/">
              <NeoButton variant="orange" className="w-full">
                Back to Home
              </NeoButton>
            </Link>
          </NeoCard>
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
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-neo-cream mb-2">
                  Reporter Dashboard
                </h1>
                <p className="text-neo-cream/60">
                  Your anonymous identity. Submit reports and earn rewards.
                </p>
              </div>
              
              {/* Session ID */}
              <NeoCard className="p-4 bg-neo-teal border-neo-teal">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neo-orange flex items-center justify-center">
                    <Hash className="w-5 h-5 text-neo-navy" />
                  </div>
                  <div>
                    <p className="text-xs text-neo-cream/70 uppercase">Session</p>
                    <p className="font-mono font-bold text-neo-cream">{sessionId}</p>
                  </div>
                  <button
                    onClick={copySessionId}
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

      {/* Stats Bar */}
      <section className="bg-neo-cream border-b-[4px] border-neo-navy">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x-[3px] divide-neo-navy">
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-navy">{stats.reportCount}</p>
              <p className="text-sm text-neo-navy/60">Reports</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-teal">{stats.stakeUsed}</p>
              <p className="text-sm text-neo-navy/60">Stake Used</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-orange">{stats.reputationScore}</p>
              <p className="text-sm text-neo-navy/60">Reputation</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-teal">{stats.pendingRewards}</p>
              <p className="text-sm text-neo-navy/60">Pending Rewards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-neo-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Actions Column */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-heading font-bold text-neo-navy mb-4">Quick Actions</h2>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Create Report */}
                  <Link to={`/reporter/report?session=${sessionId}`}>
                    <NeoCard variant="orange" hover className="p-6 h-full">
                      <div className="flex flex-col h-full">
                        <div className="w-14 h-14 bg-neo-navy border-[3px] border-neo-navy flex items-center justify-center mb-4">
                          <FileText className="w-7 h-7 text-neo-cream" />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-neo-navy mb-2">Create Report</h3>
                        <p className="text-sm text-neo-navy/70 mb-4 flex-grow">Submit an encrypted crime report with evidence</p>
                        <div className="flex items-center gap-2 text-neo-navy font-bold text-sm">
                          Start Now <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </NeoCard>
                  </Link>

                  {/* Silent Report */}
                  <Link to="/reporter/silent">
                    <NeoCard variant="teal" hover className="p-6 h-full">
                      <div className="flex flex-col h-full">
                        <div className="w-14 h-14 bg-neo-cream border-[3px] border-neo-navy flex items-center justify-center mb-4">
                          <Radio className="w-7 h-7 text-neo-navy" />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-neo-cream mb-2">Silent Report</h3>
                        <p className="text-sm text-neo-cream/80 mb-4 flex-grow">Morse-code style tap reporting for emergencies</p>
                        <div className="flex items-center gap-2 text-neo-cream font-bold text-sm">
                          Start Now <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </NeoCard>
                  </Link>

                  {/* Reputation */}
                  <Link to="/reputation">
                    <NeoCard hover className="p-6 h-full">
                      <div className="flex flex-col h-full">
                        <div className="w-14 h-14 bg-neo-teal border-[3px] border-neo-navy flex items-center justify-center mb-4">
                          <Shield className="w-7 h-7 text-neo-cream" />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-neo-navy mb-2">My Reputation</h3>
                        <p className="text-sm text-neo-navy/70 mb-4 flex-grow">View your anonymous identity and score</p>
                        <div className="flex items-center gap-2 text-neo-navy font-bold text-sm">
                          View Profile <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </NeoCard>
                  </Link>

                  {/* Wallet */}
                  <Link to="/wallet">
                    <NeoCard hover className="p-6 h-full">
                      <div className="flex flex-col h-full">
                        <div className="w-14 h-14 bg-neo-orange border-[3px] border-neo-navy flex items-center justify-center mb-4">
                          <Award className="w-7 h-7 text-neo-navy" />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-neo-navy mb-2">Rewards</h3>
                        <p className="text-sm text-neo-navy/70 mb-4 flex-grow">Check earnings and claim pending rewards</p>
                        <div className="flex items-center gap-2 text-neo-navy font-bold text-sm">
                          View Wallet <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </NeoCard>
                  </Link>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Recent Reports */}
                <NeoCard className="overflow-hidden">
                  <div className="p-4 bg-neo-navy">
                    <h3 className="font-heading font-bold text-neo-cream">Recent Reports</h3>
                  </div>
                  <div className="divide-y-[2px] divide-neo-navy">
                    {recentReports.map((report) => (
                      <div key={report.id} className="p-4 hover:bg-neo-cream/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm font-bold text-neo-navy">{report.id}</span>
                          {getStatusBadge(report.status)}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neo-navy/60">{report.category} • {report.date}</span>
                          <span className={`font-bold ${report.reward.startsWith('-') ? 'text-neo-maroon' : report.reward === '-' ? 'text-neo-navy/50' : 'text-neo-teal'}`}>
                            {report.reward}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t-[2px] border-neo-navy">
                    <Link to="/reporter/history" className="text-sm font-bold text-neo-teal hover:text-neo-orange">
                      View All Reports →
                    </Link>
                  </div>
                </NeoCard>

                {/* Quick Tips */}
                <NeoCard variant="navy" className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-neo-orange flex items-center justify-center">
                      <Zap className="w-5 h-5 text-neo-navy" />
                    </div>
                    <h3 className="font-heading font-bold text-neo-cream">Earn More</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-neo-cream/80">
                    <li className="flex items-start gap-2">
                      <span className="text-neo-orange">•</span>
                      <span>Higher severity = higher rewards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-neo-orange">•</span>
                      <span>Include evidence for verification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-neo-orange">•</span>
                      <span>Build reputation for weight bonuses</span>
                    </li>
                  </ul>
                </NeoCard>
              </div>
            </div>

            {/* Privacy Banner */}
            <NeoCard variant="maroon" className="p-6 mt-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-neo-cream border-[3px] border-neo-cream flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-neo-maroon" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-neo-cream mb-2">Your Privacy is Protected</h4>
                  <p className="text-neo-cream/80 text-sm">
                    Your session ID is temporary and cannot be linked to your real identity. 
                    All reports are encrypted end-to-end in your browser before transmission. 
                    Even we cannot read your reports.
                  </p>
                </div>
              </div>
            </NeoCard>
          </div>
        </div>
      </section>
    </Layout>
  );
}
