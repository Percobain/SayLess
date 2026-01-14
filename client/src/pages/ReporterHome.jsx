import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Radio, Award, Coins, Hash, TrendingUp, Shield, 
  Copy, Check, ArrowRight, Clock, CheckCircle, XCircle, Zap 
} from 'lucide-react';
import Layout from '../components/Layout';
import NeoCard from '../components/NeoCard';
import NeoButton from '../components/NeoButton';

// Generate a random session ID
const generateSessionId = () => {
  return 'SL-' + Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Mock recent reports
const recentReports = [
  { id: 'RPT-A7B3C9', category: 'Fraud', status: 'verified', date: '2 days ago', reward: '0.005 ETH' },
  { id: 'RPT-K4L9M2', category: 'Theft', status: 'pending', date: '5 days ago', reward: '-' },
  { id: 'RPT-F2E8D1', category: 'Corruption', status: 'rejected', date: '1 week ago', reward: '-0.001 ETH' },
];

export default function ReporterHome() {
  const [sessionId] = useState(generateSessionId());
  const [copied, setCopied] = useState(false);

  // Mock data
  const stats = {
    reportCount: 3,
    stakeUsed: '0.015 ETH',
    reputationScore: 78,
    pendingRewards: '0.012 ETH',
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status) => {
    const badges = {
      verified: { bg: 'bg-neo-teal', icon: CheckCircle, label: 'Verified' },
      pending: { bg: 'bg-neo-orange', icon: Clock, label: 'Pending' },
      rejected: { bg: 'bg-neo-maroon', icon: XCircle, label: 'Rejected' },
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase ${badge.bg} ${status === 'pending' ? 'text-neo-navy' : 'text-neo-cream'} border-[2px] border-neo-navy`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

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
