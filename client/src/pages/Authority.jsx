import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, ArrowLeft, RefreshCw, Eye, CheckCircle, XCircle, 
  Clock, AlertTriangle, ExternalLink, Bot, FileText, ArrowRight
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
      'under_review': { text: 'text-[#F0ECD9]', icon: Clock },
      'verified': { text: 'text-[#D94A3A]', icon: CheckCircle },
      'rejected': { text: 'text-[#F0ECD9]/40', icon: XCircle },
      'pending': { text: 'text-[#F0ECD9]/60', icon: Clock }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-2 text-xs uppercase tracking-widest ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <div className="border-b border-[#F0ECD9]/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/">
              <Button variant="ghost" size="sm" className="group">
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#D94A3A]" />
              <span className="text-xl font-display font-bold text-[#F0ECD9]">Authority Dashboard</span>
            </div>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm" className="group">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="border-l-2 border-[#F0ECD9]/20 pl-5 py-2">
            <p className="text-3xl font-display font-bold text-[#F0ECD9]">{stats.total}</p>
            <p className="text-sm text-[#F0ECD9]/40 uppercase tracking-widest">Total Reports</p>
          </div>
          <div className="border-l-2 border-[#F0ECD9]/40 pl-5 py-2">
            <p className="text-3xl font-display font-bold text-[#F0ECD9]">{stats.pending}</p>
            <p className="text-sm text-[#F0ECD9]/40 uppercase tracking-widest">Pending Review</p>
          </div>
          <div className="border-l-2 border-[#D94A3A] pl-5 py-2">
            <p className="text-3xl font-display font-bold text-[#D94A3A]">{stats.verified}</p>
            <p className="text-sm text-[#F0ECD9]/40 uppercase tracking-widest">Verified</p>
          </div>
          <div className="border-l-2 border-[#F0ECD9]/10 pl-5 py-2">
            <p className="text-3xl font-display font-bold text-[#F0ECD9]/40">{stats.rejected}</p>
            <p className="text-sm text-[#F0ECD9]/40 uppercase tracking-widest">Rejected</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Reports List */}
          <div className="border border-[#F0ECD9]/10">
            <div className="p-5 border-b border-[#F0ECD9]/10">
              <h2 className="text-lg font-display font-bold text-[#F0ECD9] flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#D94A3A]" />
                Reports
              </h2>
            </div>
            
            <div className="divide-y divide-[#F0ECD9]/5 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-10 text-center">
                  <div className="w-6 h-6 border-2 border-[#D94A3A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-[#F0ECD9]/40 uppercase tracking-widest text-xs">Loading reports...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-[#F0ECD9]/40">No reports yet</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div 
                    key={report._id}
                    className={`p-5 hover:bg-[#F0ECD9]/5 cursor-pointer transition-colors ${
                      selectedReport?._id === report._id ? 'bg-[#F0ECD9]/5 border-l-2 border-[#D94A3A]' : ''
                    }`}
                    onClick={() => handleDecrypt(report)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-[#F0ECD9] font-mono text-sm">Session: {report.sessionId}</p>
                        <p className="text-xs text-[#F0ECD9]/30 mt-1">
                          {new Date(report.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                    
                    <div className="flex items-center gap-6 text-xs text-[#F0ECD9]/30">
                      <span>Rep: {report.reporterReputation || 0}</span>
                      {report.txHash && (
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${report.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-[#D94A3A] flex items-center gap-1 transition-colors"
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
          <div className="border border-[#F0ECD9]/10">
            <div className="p-5 border-b border-[#F0ECD9]/10">
              <h2 className="text-lg font-display font-bold text-[#F0ECD9] flex items-center gap-3">
                <Eye className="w-5 h-5 text-[#D94A3A]" />
                Report Details
              </h2>
            </div>
            
            <div className="p-5">
              {!selectedReport ? (
                <div className="h-64 flex items-center justify-center text-[#F0ECD9]/30 text-center">
                  Select a report to decrypt and review
                </div>
              ) : decrypting ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-[#D94A3A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[#F0ECD9]/40 uppercase tracking-widest text-xs">Decrypting...</p>
                  </div>
                </div>
              ) : decryptedData?.error ? (
                <div className="bg-[#D94A3A]/10 border-l-2 border-[#D94A3A] p-4">
                  <p className="text-[#D94A3A]">Decryption failed: {decryptedData.error}</p>
                </div>
              ) : decryptedData ? (
                <div className="space-y-6">
                  {/* Decrypted Content */}
                  <div>
                    <p className="text-xs text-[#F0ECD9]/40 uppercase tracking-widest mb-3">Decrypted Report</p>
                    <div className="bg-[#F0ECD9]/5 p-5 max-h-48 overflow-y-auto">
                      <p className="text-[#F0ECD9] whitespace-pre-wrap text-sm leading-relaxed">{decryptedData.decrypted}</p>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {decryptedData.aiAnalysis && (
                    <div className="bg-[#D94A3A]/5 border-l-2 border-[#D94A3A] p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <Bot className="w-5 h-5 text-[#D94A3A]" />
                        <p className="text-sm font-display font-bold text-[#F0ECD9]">AI Analysis (Gemini)</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[#F0ECD9]/40 uppercase tracking-widest text-xs mb-1">Spam</p>
                          <p className={decryptedData.aiAnalysis.isSpam ? 'text-[#D94A3A]' : 'text-[#F0ECD9]'}>
                            {decryptedData.aiAnalysis.isSpam ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#F0ECD9]/40 uppercase tracking-widest text-xs mb-1">Urgency</p>
                          <p className="text-[#F0ECD9]">{decryptedData.aiAnalysis.urgencyScore}/10</p>
                        </div>
                        <div>
                          <p className="text-[#F0ECD9]/40 uppercase tracking-widest text-xs mb-1">Category</p>
                          <p className="text-[#F0ECD9] capitalize">{decryptedData.aiAnalysis.category}</p>
                        </div>
                        <div>
                          <p className="text-[#F0ECD9]/40 uppercase tracking-widest text-xs mb-1">Credibility</p>
                          <p className="text-[#F0ECD9]">{decryptedData.aiAnalysis.credibilityScore}/10</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-[#D94A3A]/20">
                        <p className="text-[#F0ECD9]/40 uppercase tracking-widest text-xs mb-1">Suggested Action</p>
                        <p className="text-[#D94A3A] capitalize">{decryptedData.aiAnalysis.suggestedAction}</p>
                      </div>
                      
                      {decryptedData.aiAnalysis.reasoning && (
                        <div className="mt-3">
                          <p className="text-[#F0ECD9]/40 uppercase tracking-widest text-xs mb-1">Reasoning</p>
                          <p className="text-[#F0ECD9]/60 text-sm">{decryptedData.aiAnalysis.reasoning}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {selectedReport.status === 'under_review' && (
                    <div className="flex gap-4 pt-4">
                      <Button 
                        onClick={handleVerify}
                        disabled={actionLoading}
                        className="flex-1 group"
                      >
                        {actionLoading ? (
                          <div className="w-4 h-4 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Verify & Reward
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={handleReject}
                        disabled={actionLoading}
                        variant="outline"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {selectedReport.status === 'verified' && (
                    <div className="bg-[#D94A3A]/10 border-l-2 border-[#D94A3A] p-4 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#D94A3A]" />
                      <p className="text-[#F0ECD9]">This report has been verified and rewarded.</p>
                    </div>
                  )}

                  {selectedReport.status === 'rejected' && (
                    <div className="bg-[#F0ECD9]/5 border-l-2 border-[#F0ECD9]/20 p-4 flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-[#F0ECD9]/40" />
                      <p className="text-[#F0ECD9]/60">This report has been rejected.</p>
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
