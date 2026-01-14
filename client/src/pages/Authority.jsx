import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, ArrowLeft, RefreshCw, Eye, CheckCircle, XCircle, 
  Clock, AlertTriangle, ExternalLink, Bot, FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { getAuthorityReports, decryptReport, verifyReport, rejectReport, getAuthorityStats } from '../lib/api';

export default function Authority() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);
  const [decrypting, setDecrypting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
      'under_review': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: Clock },
      'verified': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: CheckCircle },
      'rejected': { bg: 'bg-red-500/10', text: 'text-red-400', icon: XCircle },
      'pending': { bg: 'bg-slate-500/10', text: 'text-slate-400', icon: Clock }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              <span className="text-xl font-bold text-white">Authority Dashboard</span>
            </div>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm" className="border-slate-700">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-sm text-slate-400">Total Reports</p>
          </div>
          <div className="bg-slate-900/50 border border-yellow-500/20 rounded-xl p-4">
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-sm text-slate-400">Pending Review</p>
          </div>
          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-2xl font-bold text-emerald-400">{stats.verified}</p>
            <p className="text-sm text-slate-400">Verified</p>
          </div>
          <div className="bg-slate-900/50 border border-red-500/20 rounded-xl p-4">
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
            <p className="text-sm text-slate-400">Rejected</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Reports List */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                Reports
              </h2>
            </div>
            
            <div className="divide-y divide-slate-800 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-slate-400">Loading reports...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-400">No reports yet</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div 
                    key={report._id}
                    className={`p-4 hover:bg-slate-800/50 cursor-pointer transition-colors ${
                      selectedReport?._id === report._id ? 'bg-slate-800/50' : ''
                    }`}
                    onClick={() => handleDecrypt(report)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-white">Session: {report.sessionId}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(report.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Rep: {report.reporterReputation || 0}</span>
                      {report.txHash && (
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${report.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-emerald-400 flex items-center gap-1"
                        >
                          TX <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Decrypt Panel */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-slate-400" />
                Report Details
              </h2>
            </div>
            
            <div className="p-4">
              {!selectedReport ? (
                <div className="h-64 flex items-center justify-center text-slate-500">
                  Select a report to decrypt and review
                </div>
              ) : decrypting ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-slate-400">Decrypting...</p>
                  </div>
                </div>
              ) : decryptedData?.error ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="text-red-400">Decryption failed: {decryptedData.error}</p>
                </div>
              ) : decryptedData ? (
                <div className="space-y-4">
                  {/* Decrypted Content */}
                  <div>
                    <p className="text-xs text-slate-500 uppercase mb-2">Decrypted Report</p>
                    <div className="bg-slate-800/50 rounded-xl p-4 max-h-48 overflow-y-auto">
                      <p className="text-white whitespace-pre-wrap">{decryptedData.decrypted}</p>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {decryptedData.aiAnalysis && (
                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="w-5 h-5 text-purple-400" />
                        <p className="text-sm font-medium text-purple-300">AI Analysis (Gemini)</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-500">Spam</p>
                          <p className={decryptedData.aiAnalysis.isSpam ? 'text-red-400' : 'text-emerald-400'}>
                            {decryptedData.aiAnalysis.isSpam ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Urgency</p>
                          <p className="text-white">{decryptedData.aiAnalysis.urgencyScore}/10</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Category</p>
                          <p className="text-white capitalize">{decryptedData.aiAnalysis.category}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Credibility</p>
                          <p className="text-white">{decryptedData.aiAnalysis.credibilityScore}/10</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-purple-500/20">
                        <p className="text-slate-500 text-xs">Suggested Action</p>
                        <p className="text-purple-300 capitalize">{decryptedData.aiAnalysis.suggestedAction}</p>
                      </div>
                      
                      {decryptedData.aiAnalysis.reasoning && (
                        <div className="mt-2">
                          <p className="text-slate-500 text-xs">Reasoning</p>
                          <p className="text-slate-400 text-sm">{decryptedData.aiAnalysis.reasoning}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {selectedReport.status === 'under_review' && (
                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={handleVerify}
                        disabled={actionLoading}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        {actionLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Verify & Reward
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={handleReject}
                        disabled={actionLoading}
                        variant="outline"
                        className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {selectedReport.status === 'verified' && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <p className="text-emerald-300">This report has been verified and rewarded.</p>
                    </div>
                  )}

                  {selectedReport.status === 'rejected' && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-400" />
                      <p className="text-red-300">This report has been rejected.</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


