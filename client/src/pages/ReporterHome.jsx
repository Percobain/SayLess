import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Radio, Award, Coins, Hash, TrendingUp, Shield, Copy, Check } from 'lucide-react';
import Layout from '../components/Layout';
import NeoCard from '../components/NeoCard';
import NeoButton from '../components/NeoButton';

// Generate a random session ID
const generateSessionId = () => {
  return 'SL-' + Math.random().toString(36).substring(2, 10).toUpperCase();
};

export default function ReporterHome() {
  const [sessionId] = useState(generateSessionId());
  const [copied, setCopied] = useState(false);

  // Mock data
  const stats = {
    reportCount: 3,
    stakeUsed: '0.015 ETH',
    reputationScore: 78,
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Reporter Dashboard
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Your anonymous identity. Submit reports, track rewards, and build reputation.
          </p>
        </div>

        {/* Session ID Badge */}
        <div className="max-w-md mx-auto mb-12">
          <NeoCard variant="black" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neo-orange border-[2px] border-neo-white flex items-center justify-center">
                  <Hash className="w-5 h-5 text-neo-black" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Session ID</p>
                  <p className="font-mono font-bold text-neo-orange">{sessionId}</p>
                </div>
              </div>
              <button
                onClick={copySessionId}
                className="p-2 hover:bg-gray-800 rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-neo-green" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </NeoCard>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <NeoCard className="p-6 text-center">
            <div className="w-12 h-12 bg-neo-purple border-[3px] border-neo-black flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-neo-white" />
            </div>
            <p className="text-3xl font-heading font-bold">{stats.reportCount}</p>
            <p className="text-gray-600 text-sm">Reports Submitted</p>
          </NeoCard>

          <NeoCard className="p-6 text-center">
            <div className="w-12 h-12 bg-neo-orange border-[3px] border-neo-black flex items-center justify-center mx-auto mb-3">
              <Coins className="w-6 h-6 text-neo-black" />
            </div>
            <p className="text-3xl font-heading font-bold">{stats.stakeUsed}</p>
            <p className="text-gray-600 text-sm">Stake Used</p>
          </NeoCard>

          <NeoCard className="p-6 text-center">
            <div className="w-12 h-12 bg-neo-green border-[3px] border-neo-black flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-neo-black" />
            </div>
            <p className="text-3xl font-heading font-bold">{stats.reputationScore}</p>
            <p className="text-gray-600 text-sm">Reputation Score</p>
          </NeoCard>
        </div>

        {/* Action Buttons */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-heading font-bold mb-6 text-center">Actions</h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <Link to={`/reporter/report?session=${sessionId}`}>
              <NeoCard variant="orange" hover className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-neo-black border-[3px] border-neo-black flex items-center justify-center">
                    <FileText className="w-7 h-7 text-neo-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold">Create Report</h3>
                    <p className="text-sm opacity-80">Submit an encrypted crime report</p>
                  </div>
                </div>
              </NeoCard>
            </Link>

            <Link to="/reporter/silent">
              <NeoCard variant="purple" hover className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-neo-white border-[3px] border-neo-black flex items-center justify-center">
                    <Radio className="w-7 h-7 text-neo-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold">Silent Report</h3>
                    <p className="text-sm opacity-80">Morse-code style reporting</p>
                  </div>
                </div>
              </NeoCard>
            </Link>

            <Link to="/reputation">
              <NeoCard hover className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-neo-green border-[3px] border-neo-black flex items-center justify-center">
                    <Shield className="w-7 h-7 text-neo-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold">My Reputation</h3>
                    <p className="text-sm text-gray-600">View your anonymous identity</p>
                  </div>
                </div>
              </NeoCard>
            </Link>

            <Link to="/wallet">
              <NeoCard hover className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-yellow-300 border-[3px] border-neo-black flex items-center justify-center">
                    <Award className="w-7 h-7 text-neo-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold">Rewards</h3>
                    <p className="text-sm text-gray-600">Check earnings & claim rewards</p>
                  </div>
                </div>
              </NeoCard>
            </Link>
          </div>
        </div>

        {/* Info Banner */}
        <div className="max-w-2xl mx-auto mt-12">
          <NeoCard variant="black" className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-neo-orange border-[2px] border-neo-white flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-neo-black" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-neo-white mb-1">Your Privacy is Protected</h4>
                <p className="text-gray-400 text-sm">
                  Your session ID is temporary and cannot be linked to your identity. 
                  All reports are encrypted end-to-end before leaving your device.
                </p>
              </div>
            </div>
          </NeoCard>
        </div>
      </div>
    </Layout>
  );
}
