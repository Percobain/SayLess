import { useState } from 'react';
import { Scale, ThumbsUp, ThumbsDown, Clock, Users, Award, AlertTriangle } from 'lucide-react';
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
    // Simulate voting delay
    setTimeout(() => {
      setSelectedDispute(null);
    }, 1500);
  };

  // Mock user reputation
  const userRep = 65;
  const voteWeight = Math.floor(userRep / 10);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Jury Dashboard
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto mb-6">
            Participate in decentralized dispute resolution. Your vote is weighted by your reputation.
          </p>
          
          {/* User Stats */}
          <div className="inline-flex items-center gap-6 neo-card p-4">
            <div className="text-center">
              <p className="text-2xl font-heading font-bold">{userRep}</p>
              <p className="text-xs text-gray-500">Your Rep</p>
            </div>
            <div className="w-[2px] h-10 bg-neo-black"></div>
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-neo-purple">{voteWeight}x</p>
              <p className="text-xs text-gray-500">Vote Weight</p>
            </div>
            <div className="w-[2px] h-10 bg-neo-black"></div>
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-neo-green">12</p>
              <p className="text-xs text-gray-500">Cases Judged</p>
            </div>
          </div>
        </div>

        {/* Disputes List */}
        <div className="max-w-4xl mx-auto space-y-6">
          {mockDisputes.map((dispute) => (
            <NeoCard 
              key={dispute.id} 
              className={`overflow-hidden ${dispute.status === 'ended' ? 'opacity-75' : ''}`}
            >
              {/* Header */}
              <div className="p-4 border-b-[3px] border-neo-black bg-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neo-purple border-[3px] border-neo-black flex items-center justify-center">
                    <Scale className="w-5 h-5 text-neo-white" />
                  </div>
                  <div>
                    <p className="font-heading font-bold">{dispute.id}</p>
                    <p className="text-xs text-gray-500">Report: {dispute.reportId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`neo-badge ${dispute.status === 'active' ? 'bg-neo-orange' : 'bg-gray-300'}`}>
                    {dispute.status === 'active' ? 'Active' : 'Ended'}
                  </span>
                  {dispute.status === 'active' && (
                    <div className="flex items-center gap-1 text-sm">
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
                    <p className="text-xs uppercase font-bold text-gray-500 mb-1">Category / Severity</p>
                    <div className="flex items-center gap-2">
                      <span className="neo-badge-orange">{dispute.category}</span>
                      <span className="neo-badge-purple">{dispute.severity}/10</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs uppercase font-bold text-gray-500 mb-1">Report Summary</p>
                    <p className="text-sm text-gray-600">{dispute.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">Reporter Reputation:</p>
                    <span className="font-bold">{dispute.reporterRep}</span>
                  </div>
                </div>

                {/* Right: Dispute Details */}
                <div className="space-y-4">
                  <NeoCard className="p-3 bg-red-50">
                    <p className="text-xs uppercase font-bold text-red-600 mb-1">Authority's Reason</p>
                    <p className="text-sm">{dispute.authorityReason}</p>
                  </NeoCard>

                  <NeoCard className="p-3 bg-green-50">
                    <p className="text-xs uppercase font-bold text-green-700 mb-1">Reporter's Appeal</p>
                    <p className="text-sm">{dispute.reporterAppeal}</p>
                  </NeoCard>
                </div>
              </div>

              {/* Voting Section */}
              <div className="p-4 border-t-[3px] border-neo-black bg-gray-50">
                {/* Vote Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="w-4 h-4" />
                      Valid ({dispute.votesValid}%)
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      {dispute.totalVoters} voters
                    </span>
                    <span className="flex items-center gap-1 text-red-600">
                      Invalid ({dispute.votesInvalid}%)
                      <ThumbsDown className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="h-4 bg-gray-200 border-[2px] border-neo-black flex overflow-hidden">
                    <div 
                      className="bg-neo-green h-full"
                      style={{ width: `${dispute.votesValid}%` }}
                    />
                    <div 
                      className="bg-red-400 h-full"
                      style={{ width: `${dispute.votesInvalid}%` }}
                    />
                  </div>
                </div>

                {/* Vote Buttons or Result */}
                {dispute.status === 'ended' ? (
                  <NeoCard variant={dispute.verdict === 'valid' ? 'green' : 'default'} className="p-3 text-center">
                    <p className="font-bold">
                      Verdict: {dispute.verdict === 'valid' ? '✓ Report Valid' : '✗ Report Invalid'}
                    </p>
                  </NeoCard>
                ) : hasVoted[dispute.id] ? (
                  <NeoCard variant="green" className="p-3 text-center">
                    <p className="font-bold flex items-center justify-center gap-2">
                      <Award className="w-5 h-5" />
                      You voted: {hasVoted[dispute.id] === 'valid' ? 'Valid' : 'Invalid'}
                    </p>
                  </NeoCard>
                ) : (
                  <div className="flex gap-4">
                    <NeoButton 
                      variant="green" 
                      className="flex-1"
                      onClick={() => handleVote(dispute.id, 'valid')}
                    >
                      <ThumbsUp className="w-5 h-5 mr-2" />
                      Vote Valid
                    </NeoButton>
                    <NeoButton 
                      className="flex-1 bg-red-400"
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

        {/* Info */}
        <div className="max-w-4xl mx-auto mt-8">
          <NeoCard variant="black" className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-neo-orange flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-neo-white font-bold text-sm">Reputation-Weighted Voting</p>
                <p className="text-gray-400 text-xs mt-1">
                  Your vote is weighted by your reputation score. Higher reputation = more influence.
                  Voting correctly on disputes increases your reputation.
                </p>
              </div>
            </div>
          </NeoCard>
        </div>
      </div>
    </Layout>
  );
}
