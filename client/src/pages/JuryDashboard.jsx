import { useState } from 'react';
import { Scale, ThumbsUp, ThumbsDown, Clock, Users, Award, AlertTriangle, Gavel, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import NeoCard from '../components/NeoCard';
import NeoButton from '../components/NeoButton';

// Mock disputed reports
const mockDisputes = [
  {
    id: 'DSP-001',
    reportId: 'RPT-A7B3C9',
    category: 'Fraud',
    severity: 8,
    status: 'active',
    timeLeft: '2h 34m',
    votesValid: 45,
    votesInvalid: 23,
    totalVoters: 100,
    reporterRep: 72,
    description: 'Alleged cryptocurrency scam involving fake investment platform...',
    authorityReason: 'Insufficient evidence provided',
    reporterAppeal: 'I have additional screenshots and transaction records as proof.',
  },
  {
    id: 'DSP-002',
    reportId: 'RPT-F2E8D1',
    category: 'Harassment',
    severity: 6,
    status: 'active',
    timeLeft: '5h 12m',
    votesValid: 32,
    votesInvalid: 41,
    totalVoters: 80,
    reporterRep: 45,
    description: 'Workplace harassment complaint against supervisor...',
    authorityReason: 'Report appears to be a personal dispute',
    reporterAppeal: 'Multiple witnesses can corroborate my account.',
  },
  {
    id: 'DSP-003',
    reportId: 'RPT-K4L9M2',
    category: 'Theft',
    severity: 7,
    status: 'ended',
    timeLeft: 'Ended',
    votesValid: 67,
    votesInvalid: 33,
    totalVoters: 100,
    reporterRep: 89,
    verdict: 'valid',
    description: 'Vehicle theft from private parking...',
    authorityReason: 'Location details unclear',
    reporterAppeal: 'CCTV footage available from nearby store.',
  },
];

export default function JuryDashboard() {
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [hasVoted, setHasVoted] = useState({});

  const handleVote = (disputeId, vote) => {
    setUserVote(vote);
    setHasVoted(prev => ({ ...prev, [disputeId]: vote }));
    setTimeout(() => {
      setSelectedDispute(null);
    }, 1500);
  };

  // Mock user reputation
  const userRep = 65;
  const voteWeight = Math.floor(userRep / 10);
  const casesJudged = 12;
  const successRate = 87;

  return (
    <Layout>
      {/* Hero Header */}
      <section className="bg-neo-navy py-12 border-b-[4px] border-neo-navy">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="neo-badge-orange mb-4">
                  <Scale className="w-4 h-4" />
                  Dispute Resolution
                </div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-neo-cream mb-2">
                  Jury Dashboard
                </h1>
                <p className="text-neo-cream/60">
                  Vote on disputed reports. Your influence is weighted by reputation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Stats Bar */}
      <section className="bg-neo-teal border-b-[4px] border-neo-navy">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x-[3px] divide-neo-navy">
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-cream">{userRep}</p>
              <p className="text-sm text-neo-cream/70">Your Rep</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-orange">{voteWeight}x</p>
              <p className="text-sm text-neo-cream/70">Vote Weight</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-cream">{casesJudged}</p>
              <p className="text-sm text-neo-cream/70">Cases Judged</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-orange">{successRate}%</p>
              <p className="text-sm text-neo-cream/70">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-neo-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Filter Tabs */}
            <div className="flex items-center gap-4 mb-8">
              <NeoButton variant="navy" size="sm">All Disputes</NeoButton>
              <NeoButton variant="default" size="sm">Active ({mockDisputes.filter(d => d.status === 'active').length})</NeoButton>
              <NeoButton variant="default" size="sm">Ended</NeoButton>
            </div>

            {/* Disputes List */}
            <div className="space-y-6">
              {mockDisputes.map((dispute) => (
                <NeoCard 
                  key={dispute.id} 
                  className={`overflow-hidden ${dispute.status === 'ended' ? 'opacity-80' : ''}`}
                >
                  {/* Header */}
                  <div className="p-4 border-b-[3px] border-neo-navy bg-neo-navy flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neo-orange flex items-center justify-center">
                        <Gavel className="w-5 h-5 text-neo-navy" />
                      </div>
                      <div>
                        <p className="font-heading font-bold text-neo-cream">{dispute.id}</p>
                        <p className="text-xs text-neo-cream/60">Report: {dispute.reportId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`neo-badge ${dispute.status === 'active' ? 'bg-neo-orange text-neo-navy' : 'bg-neo-cream/20 text-neo-cream'} border-neo-cream`}>
                        {dispute.status === 'active' ? 'Active' : 'Ended'}
                      </span>
                      {dispute.status === 'active' && (
                        <div className="flex items-center gap-1 text-neo-cream">
                          <Clock className="w-4 h-4" />
                          <span className="font-mono font-bold">{dispute.timeLeft}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 grid md:grid-cols-2 gap-4">
                    {/* Left: Report Details */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase font-bold text-neo-navy/60 mb-2">Category / Severity</p>
                        <div className="flex items-center gap-2">
                          <span className="neo-badge-orange">{dispute.category}</span>
                          <span className="neo-badge-navy">{dispute.severity}/10</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs uppercase font-bold text-neo-navy/60 mb-1">Report Summary</p>
                        <p className="text-sm text-neo-navy/80">{dispute.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className="text-xs text-neo-navy/60">Reporter Rep:</p>
                        <span className="font-bold text-neo-teal">{dispute.reporterRep}</span>
                      </div>
                    </div>

                    {/* Right: Dispute Details */}
                    <div className="space-y-4">
                      <NeoCard variant="maroon" className="p-3">
                        <p className="text-xs uppercase font-bold text-neo-cream/80 mb-1">Authority's Rejection</p>
                        <p className="text-sm text-neo-cream">{dispute.authorityReason}</p>
                      </NeoCard>

                      <NeoCard variant="teal" className="p-3">
                        <p className="text-xs uppercase font-bold text-neo-cream/80 mb-1">Reporter's Appeal</p>
                        <p className="text-sm text-neo-cream">{dispute.reporterAppeal}</p>
                      </NeoCard>
                    </div>
                  </div>

                  {/* Voting Section */}
                  <div className="p-4 border-t-[3px] border-neo-navy bg-neo-cream">
                    {/* Vote Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="flex items-center gap-1 text-neo-teal font-bold">
                          <ThumbsUp className="w-4 h-4" />
                          Valid ({dispute.votesValid}%)
                        </span>
                        <span className="flex items-center gap-1 text-neo-navy/60">
                          <Users className="w-4 h-4" />
                          {dispute.totalVoters} voters
                        </span>
                        <span className="flex items-center gap-1 text-neo-maroon font-bold">
                          Invalid ({dispute.votesInvalid}%)
                          <ThumbsDown className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="h-5 bg-neo-cream border-[3px] border-neo-navy flex overflow-hidden">
                        <div 
                          className="bg-neo-teal h-full transition-all"
                          style={{ width: `${dispute.votesValid}%` }}
                        />
                        <div 
                          className="bg-neo-maroon h-full transition-all"
                          style={{ width: `${dispute.votesInvalid}%` }}
                        />
                      </div>
                    </div>

                    {/* Vote Buttons or Result */}
                    {dispute.status === 'ended' ? (
                      <NeoCard variant={dispute.verdict === 'valid' ? 'teal' : 'maroon'} className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {dispute.verdict === 'valid' ? (
                            <CheckCircle className="w-5 h-5 text-neo-cream" />
                          ) : (
                            <ThumbsDown className="w-5 h-5 text-neo-cream" />
                          )}
                          <p className="font-heading font-bold text-neo-cream">
                            Verdict: {dispute.verdict === 'valid' ? 'Report Valid' : 'Report Invalid'}
                          </p>
                        </div>
                      </NeoCard>
                    ) : hasVoted[dispute.id] ? (
                      <NeoCard variant="teal" className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Award className="w-5 h-5 text-neo-cream" />
                          <p className="font-heading font-bold text-neo-cream">
                            You voted: {hasVoted[dispute.id] === 'valid' ? 'Valid' : 'Invalid'}
                          </p>
                        </div>
                      </NeoCard>
                    ) : (
                      <div className="flex gap-4">
                        <NeoButton 
                          variant="teal" 
                          className="flex-1"
                          onClick={() => handleVote(dispute.id, 'valid')}
                        >
                          <ThumbsUp className="w-5 h-5 mr-2" />
                          Vote Valid
                        </NeoButton>
                        <NeoButton 
                          variant="maroon"
                          className="flex-1"
                          onClick={() => handleVote(dispute.id, 'invalid')}
                        >
                          <ThumbsDown className="w-5 h-5 mr-2" />
                          Vote Invalid
                        </NeoButton>
                      </div>
                    )}
                  </div>
                </NeoCard>
              ))}
            </div>

            {/* Info Banner */}
            <NeoCard variant="navy" className="p-6 mt-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-neo-orange flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-neo-navy" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-neo-cream mb-2">Reputation-Weighted Voting</h4>
                  <p className="text-neo-cream/70 text-sm">
                    Your vote is weighted by your reputation score. Higher reputation = more influence on the outcome.
                    Voting correctly on disputes increases your reputation and earns rewards.
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
