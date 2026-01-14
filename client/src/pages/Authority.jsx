import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, ArrowLeft, RefreshCw, Eye, CheckCircle, XCircle, 
  Clock, AlertTriangle, ExternalLink, Bot, FileText, Filter
} from 'lucide-react';
import Layout from '../components/Layout';
import NeoCard from '../components/NeoCard';
import NeoButton from '../components/NeoButton';
import { getAuthorityReports, decryptReport, verifyReport, rejectReport, getAuthorityStats } from '../lib/api';

export default function Authority() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);
  const [decrypting, setDecrypting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsData, statsData] = await Promise.all([
        getAuthorityReports(),
        getAuthorityStats()
      ]);
      setReports(reportsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDecrypt = async (report) => {
    setSelectedReport(report);
    setDecryptedData(null);
    setDecrypting(true);
    
    try {
      // Simulate decryption delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = await decryptReport(report._id);
      setDecryptedData(data);
    } catch (err) {
      console.error('Decryption failed:', err);
      setDecryptedData({ error: err.message });
    }
    
    setDecrypting(false);
  };

  const handleVerify = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    
    try {
      await verifyReport(selectedReport._id, '0.005');
      await fetchData();
      setSelectedReport(null);
      setDecryptedData(null);
    } catch (err) {
      console.error('Verification failed:', err);
    }
    
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    
    try {
      await rejectReport(selectedReport._id);
      await fetchData();
      setSelectedReport(null);
      setDecryptedData(null);
    } catch (err) {
      console.error('Rejection failed:', err);
    }
    
    setActionLoading(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'under_review': { bg: 'bg-yellow-300', label: 'Under Review', icon: Clock },
      'verified': { bg: 'bg-neo-green', label: 'Verified', icon: CheckCircle },
      'rejected': { bg: 'bg-red-400', label: 'Rejected', icon: XCircle },
      'pending': { bg: 'bg-gray-300', label: 'Pending', icon: Clock }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`neo-status ${badge.bg}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(r => r.status === filter);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold mb-2">Authority Dashboard</h1>
            <p className="text-gray-600">Review and verify encrypted crime reports</p>
          </div>
          <NeoButton onClick={fetchData}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </NeoButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <NeoCard className="p-4 text-center">
            <p className="text-3xl font-heading font-bold">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Reports</p>
          </NeoCard>
          <NeoCard variant="orange" className="p-4 text-center">
            <p className="text-3xl font-heading font-bold">{stats.pending}</p>
            <p className="text-sm">Pending Review</p>
          </NeoCard>
          <NeoCard variant="green" className="p-4 text-center">
            <p className="text-3xl font-heading font-bold">{stats.verified}</p>
            <p className="text-sm">Verified</p>
          </NeoCard>
          <NeoCard className="p-4 text-center bg-red-100">
            <p className="text-3xl font-heading font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-gray-600">Rejected</p>
          </NeoCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Reports List */}
          <NeoCard className="overflow-hidden">
            <div className="p-4 border-b-[3px] border-neo-black bg-gray-100 flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Reports
              </h2>
              <div className="flex gap-2">
                {['all', 'under_review', 'verified', 'rejected'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`
                      px-3 py-1 text-xs font-bold uppercase border-[2px] border-neo-black
                      ${filter === f ? 'bg-neo-black text-neo-white' : 'bg-neo-white hover:bg-gray-100'}
                    `}
                  >
                    {f === 'all' ? 'All' : f.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto divide-y-[2px] divide-neo-black">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 border-4 border-neo-orange border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-gray-500">Loading reports...</p>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No reports found
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div 
                    key={report._id}
                    className={`
                      p-4 cursor-pointer transition-colors
                      ${selectedReport?._id === report._id 
                        ? 'bg-neo-orange' 
                        : 'hover:bg-gray-50'
                      }
                    `}
                    onClick={() => handleDecrypt(report)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold">Session: {report.sessionId}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(report.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Rep: {report.reporterReputation || 0}</span>
                      {report.txHash && (
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${report.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-neo-orange flex items-center gap-1"
                        >
                          TX <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </NeoCard>

          {/* Decrypt Panel */}
          <NeoCard className="overflow-hidden">
            <div className="p-4 border-b-[3px] border-neo-black bg-gray-100">
              <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Report Details
              </h2>
            </div>
            
            <div className="p-4">
              {!selectedReport ? (
                <div className="h-64 flex items-center justify-center text-gray-400 border-[3px] border-dashed border-gray-300">
                  Select a report to decrypt and review
                </div>
              ) : decrypting ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-10 h-10 border-4 border-neo-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-500">Decrypting...</p>
                  </div>
                </div>
              ) : decryptedData?.error ? (
                <NeoCard className="p-4 bg-red-100">
                  <p className="text-red-600 font-bold">Decryption failed: {decryptedData.error}</p>
                </NeoCard>
              ) : decryptedData ? (
                <div className="space-y-4">
                  {/* Decrypted Content */}
                  <div>
                    <p className="text-xs uppercase font-bold text-gray-500 mb-2">Decrypted Report</p>
                    <NeoCard className="p-4 bg-gray-50 max-h-40 overflow-y-auto">
                      <p className="whitespace-pre-wrap">{decryptedData.decrypted}</p>
                    </NeoCard>
                  </div>

                  {/* AI Analysis */}
                  {decryptedData.aiAnalysis && (
                    <NeoCard variant="purple" className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="w-5 h-5" />
                        <p className="font-bold">AI Analysis (Gemini)</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-300 text-xs">Spam</p>
                          <p className={decryptedData.aiAnalysis.isSpam ? 'text-red-300' : 'text-neo-green'}>
                            {decryptedData.aiAnalysis.isSpam ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-300 text-xs">Urgency</p>
                          <p>{decryptedData.aiAnalysis.urgencyScore}/10</p>
                        </div>
                        <div>
                          <p className="text-gray-300 text-xs">Category</p>
                          <p className="capitalize">{decryptedData.aiAnalysis.category}</p>
                        </div>
                        <div>
                          <p className="text-gray-300 text-xs">Credibility</p>
                          <p>{decryptedData.aiAnalysis.credibilityScore}/10</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-neo-white/20">
                        <p className="text-gray-300 text-xs">Suggested Action</p>
                        <p className="capitalize font-bold">{decryptedData.aiAnalysis.suggestedAction}</p>
                      </div>
                    </NeoCard>
                  )}

                  {/* Actions */}
                  {selectedReport.status === 'under_review' && (
                    <div className="flex gap-3 pt-4">
                      <NeoButton 
                        onClick={handleVerify}
                        disabled={actionLoading}
                        variant="green"
                        className="flex-1"
                      >
                        {actionLoading ? (
                          <div className="w-4 h-4 border-2 border-neo-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Verify & Reward
                          </>
                        )}
                      </NeoButton>
                      <NeoButton 
                        onClick={handleReject}
                        disabled={actionLoading}
                        danger
                        className="flex-1 bg-red-400"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </NeoButton>
                    </div>
                  )}

                  {selectedReport.status === 'verified' && (
                    <NeoCard variant="green" className="p-4 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5" />
                      <p className="font-bold">This report has been verified and rewarded.</p>
                    </NeoCard>
                  )}

                  {selectedReport.status === 'rejected' && (
                    <NeoCard className="p-4 bg-red-100 flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <p className="font-bold text-red-600">This report has been rejected.</p>
                    </NeoCard>
                  )}
                </div>
              ) : null}
            </div>
          </NeoCard>
        </div>
      </div>
    </Layout>
  );
}
