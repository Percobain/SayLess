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
      'under_review': { bg: 'bg-neo-orange text-neo-navy', label: 'Under Review', icon: Clock },
      'verified': { bg: 'bg-neo-teal text-neo-cream', label: 'Verified', icon: CheckCircle },
      'rejected': { bg: 'bg-neo-maroon text-neo-cream', label: 'Rejected', icon: XCircle },
      'pending': { bg: 'bg-neo-cream text-neo-navy', label: 'Pending', icon: Clock }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase border-[2px] border-neo-navy ${badge.bg}`}>
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
      {/* Hero Header */}
      <section className="bg-neo-navy py-8 border-b-[4px] border-neo-navy">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="neo-badge-teal mb-3">
                <Shield className="w-4 h-4" />
                Authority Access
              </div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-neo-cream mb-2">
                Authority Dashboard
              </h1>
              <p className="text-neo-cream/60">
                Review and verify encrypted crime reports
              </p>
            </div>
            <NeoButton variant="orange" onClick={fetchData}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </NeoButton>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-neo-cream border-b-[4px] border-neo-navy">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x-[3px] divide-neo-navy">
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-navy">{stats.total}</p>
              <p className="text-sm text-neo-navy/60">Total Reports</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-orange">{stats.pending}</p>
              <p className="text-sm text-neo-navy/60">Pending Review</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-teal">{stats.verified}</p>
              <p className="text-sm text-neo-navy/60">Verified</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-maroon">{stats.rejected}</p>
              <p className="text-sm text-neo-navy/60">Rejected</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 bg-neo-cream">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Reports List */}
            <NeoCard className="overflow-hidden">
              <div className="p-4 border-b-[3px] border-neo-navy bg-neo-navy flex items-center justify-between">
                <h2 className="font-heading font-bold text-lg flex items-center gap-2 text-neo-cream">
                  <FileText className="w-5 h-5" />
                  Reports
                </h2>
                <div className="flex gap-1">
                  {['all', 'under_review', 'verified', 'rejected'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`
                        px-2 py-1 text-xs font-bold uppercase border-[2px] border-neo-cream transition-colors
                        ${filter === f 
                          ? 'bg-neo-orange text-neo-navy border-neo-orange' 
                          : 'bg-transparent text-neo-cream hover:bg-neo-teal'
                        }
                      `}
                    >
                      {f === 'all' ? 'All' : f === 'under_review' ? 'Review' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="max-h-[500px] overflow-y-auto divide-y-[2px] divide-neo-navy">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="w-10 h-10 border-4 border-neo-orange border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-neo-navy/60">Loading reports...</p>
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="p-8 text-center text-neo-navy/60">
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
                          : 'hover:bg-neo-cream/50'
                        }
                      `}
                      onClick={() => handleDecrypt(report)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className={`font-bold ${selectedReport?._id === report._id ? 'text-neo-navy' : 'text-neo-navy'}`}>
                            Session: {report.sessionId}
                          </p>
                          <p className="text-xs text-neo-navy/60">
                            {new Date(report.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-neo-navy/60">
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
              <div className="p-4 border-b-[3px] border-neo-navy bg-neo-teal">
                <h2 className="font-heading font-bold text-lg flex items-center gap-2 text-neo-cream">
                  <Eye className="w-5 h-5" />
                  Report Details
                </h2>
              </div>
              
              <div className="p-4">
                {!selectedReport ? (
                  <div className="h-64 flex items-center justify-center text-neo-navy/40 border-[3px] border-dashed border-neo-navy/30">
                    <div className="text-center">
                      <Eye className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>Select a report to decrypt and review</p>
                    </div>
                  </div>
                ) : decrypting ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-neo-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-neo-navy/60">Decrypting with authority key...</p>
                    </div>
                  </div>
                ) : decryptedData?.error ? (
                  <NeoCard variant="maroon" className="p-4">
                    <p className="text-neo-cream font-bold">Decryption failed: {decryptedData.error}</p>
                  </NeoCard>
                ) : decryptedData ? (
                  <div className="space-y-4">
                    {/* Decrypted Content */}
                    <div>
                      <p className="text-xs uppercase font-bold text-neo-navy/60 mb-2">Decrypted Report</p>
                      <NeoCard className="p-4 max-h-40 overflow-y-auto">
                        <p className="whitespace-pre-wrap text-neo-navy">{decryptedData.decrypted}</p>
                      </NeoCard>
                    </div>

                    {/* AI Analysis */}
                    {decryptedData.aiAnalysis && (
                      <NeoCard variant="navy" className="p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-neo-orange flex items-center justify-center">
                            <Bot className="w-5 h-5 text-neo-navy" />
                          </div>
                          <p className="font-bold text-neo-cream">AI Analysis (Gemini)</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="p-2 bg-neo-teal/20">
                            <p className="text-neo-cream/60 text-xs">Spam</p>
                            <p className={`font-bold ${decryptedData.aiAnalysis.isSpam ? 'text-neo-maroon' : 'text-neo-teal'}`}>
                              {decryptedData.aiAnalysis.isSpam ? 'Yes' : 'No'}
                            </p>
                          </div>
                          <div className="p-2 bg-neo-teal/20">
                            <p className="text-neo-cream/60 text-xs">Urgency</p>
                            <p className="text-neo-orange font-bold">{decryptedData.aiAnalysis.urgencyScore}/10</p>
                          </div>
                          <div className="p-2 bg-neo-teal/20">
                            <p className="text-neo-cream/60 text-xs">Category</p>
                            <p className="text-neo-cream capitalize font-bold">{decryptedData.aiAnalysis.category}</p>
                          </div>
                          <div className="p-2 bg-neo-teal/20">
                            <p className="text-neo-cream/60 text-xs">Credibility</p>
                            <p className="text-neo-orange font-bold">{decryptedData.aiAnalysis.credibilityScore}/10</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-neo-teal/30">
                          <p className="text-neo-cream/60 text-xs">Suggested Action</p>
                          <p className="capitalize font-bold text-neo-orange text-lg">{decryptedData.aiAnalysis.suggestedAction}</p>
                        </div>
                      </NeoCard>
                    )}

                    {/* Actions */}
                    {selectedReport.status === 'under_review' && (
                      <div className="flex gap-3 pt-2">
                        <NeoButton 
                          onClick={handleVerify}
                          disabled={actionLoading}
                          variant="teal"
                          className="flex-1"
                        >
                          {actionLoading ? (
                            <div className="w-4 h-4 border-2 border-neo-cream border-t-transparent rounded-full animate-spin" />
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
                          variant="maroon"
                          danger
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </NeoButton>
                      </div>
                    )}

                    {selectedReport.status === 'verified' && (
                      <NeoCard variant="teal" className="p-4 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-neo-cream" />
                        <p className="font-bold text-neo-cream">This report has been verified and rewarded.</p>
                      </NeoCard>
                    )}

                    {selectedReport.status === 'rejected' && (
                      <NeoCard variant="maroon" className="p-4 flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-neo-cream" />
                        <p className="font-bold text-neo-cream">This report has been rejected.</p>
                      </NeoCard>
                    )}
                  </div>
                ) : null}
              </div>
            </NeoCard>
          </div>
        </div>
      </section>
    </Layout>
  );
}
