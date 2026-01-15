import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, ArrowLeft, RefreshCw, Eye, CheckCircle, XCircle,
  Clock, AlertTriangle, ExternalLink, Bot, FileText, Filter,
  Network, FileSearch, Brain
} from 'lucide-react';
import Layout from '../components/Layout';
import NeoCard from '../components/NeoCard';
import NeoButton from '../components/NeoButton';
import SourceNetwork from '../components/SourceNetwork';
import { getAuthorityReports, decryptReport, verifyReport, rejectReport, getAuthorityStats } from '../lib/api';
import { useI18n } from '../context/I18nContext';

export default function Authority() {
  const { t } = useI18n();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);
  const [decrypting, setDecrypting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('report'); // 'report', 'analysis', 'sources'

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
    setActiveTab('report');

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
      'under_review': { bg: 'bg-neo-orange text-neo-navy', label: t('authority.status.underReview'), icon: Clock },
      'verified': { bg: 'bg-neo-teal text-neo-cream', label: t('authority.status.verified'), icon: CheckCircle },
      'rejected': { bg: 'bg-neo-maroon text-neo-cream', label: t('authority.status.rejected'), icon: XCircle },
      'pending': { bg: 'bg-neo-cream text-neo-navy', label: t('authority.status.pending'), icon: Clock }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase border-[2px] border-neo-navy ${badge.bg}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const filteredReports = filter === 'all'
    ? reports
    : reports.filter(r => r.status === filter);

  const hasWebContext = decryptedData?.webContext?.sources?.length > 0;

  return (
    <Layout>
      {/* Compact Header */}
      <section className="bg-neo-navy py-4 border-b-[4px] border-neo-navy">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="neo-badge-teal">
                <Shield className="w-4 h-4" />
                {t('authority.badge')}
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-neo-cream">
                {t('authority.title')}
              </h1>
            </div>
            <NeoButton variant="orange" onClick={fetchData} className="!py-2 !px-3">
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              {t('authority.refresh')}
            </NeoButton>
          </div>
        </div>
      </section>

      {/* Compact Stats Bar */}
      <section className="bg-neo-cream border-b-[3px] border-neo-navy">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 divide-x-[2px] divide-neo-navy">
            <div className="py-3 text-center">
              <p className="text-2xl font-heading font-bold text-neo-navy">{stats.total}</p>
              <p className="text-xs text-neo-navy/60">{t('authority.totalReports')}</p>
            </div>
            <div className="py-3 text-center">
              <p className="text-2xl font-heading font-bold text-neo-orange">{stats.pending}</p>
              <p className="text-xs text-neo-navy/60">{t('authority.pendingReview')}</p>
            </div>
            <div className="py-3 text-center">
              <p className="text-2xl font-heading font-bold text-neo-teal">{stats.verified}</p>
              <p className="text-xs text-neo-navy/60">{t('authority.verified')}</p>
            </div>
            <div className="py-3 text-center">
              <p className="text-2xl font-heading font-bold text-neo-maroon">{stats.rejected}</p>
              <p className="text-xs text-neo-navy/60">{t('authority.rejected')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - 3 column layout */}
      <section className="py-4 bg-neo-cream min-h-[calc(100vh-200px)]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-4">
            {/* Reports List - Narrow Column */}
            <div className="lg:col-span-3">
              <NeoCard className="overflow-hidden h-full">
                <div className="p-3 border-b-[3px] border-neo-navy bg-neo-navy flex items-center justify-between">
                  <h2 className="font-heading font-bold text-sm flex items-center gap-2 text-neo-cream">
                    <FileText className="w-4 h-4" />
                    {t('authority.reports')}
                  </h2>
                </div>
                
                {/* Filter Pills */}
                <div className="p-2 border-b-[2px] border-neo-navy/20 flex flex-wrap gap-1">
                  {['all', 'under_review', 'verified', 'rejected'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`
                        px-2 py-0.5 text-[10px] font-bold uppercase border-[1px] transition-colors
                        ${filter === f
                          ? 'bg-neo-orange text-neo-navy border-neo-orange'
                          : 'bg-transparent text-neo-navy/60 border-neo-navy/30 hover:border-neo-teal'
                        }
                      `}
                    >
                      {f === 'all' ? 'All' : f === 'under_review' ? 'Review' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="max-h-[calc(100vh-350px)] overflow-y-auto divide-y divide-neo-navy/10">
                  {loading ? (
                    <div className="p-6 text-center">
                      <div className="w-8 h-8 border-3 border-neo-orange border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-neo-navy/60 text-xs">{t('authority.loadingReports')}</p>
                    </div>
                  ) : filteredReports.length === 0 ? (
                    <div className="p-6 text-center text-neo-navy/60 text-xs">
                      {t('authority.noReportsFound')}
                    </div>
                  ) : (
                    filteredReports.map((report) => (
                      <div
                        key={report._id}
                        className={`
                          p-3 cursor-pointer transition-colors
                          ${selectedReport?._id === report._id
                            ? 'bg-neo-orange'
                            : 'hover:bg-neo-cream/50'
                          }
                        `}
                        onClick={() => handleDecrypt(report)}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-bold text-sm text-neo-navy truncate">
                            {report.sessionId}
                          </p>
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-[10px] text-neo-navy/50">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </NeoCard>
            </div>

            {/* Details Panel - Wide Column */}
            <div className="lg:col-span-9">
              <NeoCard className="overflow-hidden h-full">
                {/* Tab Header */}
                <div className="border-b-[3px] border-neo-navy bg-neo-teal flex items-center justify-between">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('report')}
                      className={`px-4 py-3 font-bold text-sm flex items-center gap-2 transition-colors border-r-[2px] border-neo-navy/30
                        ${activeTab === 'report' ? 'bg-neo-cream text-neo-navy' : 'text-neo-cream hover:bg-neo-teal-dark'}`}
                    >
                      <FileSearch className="w-4 h-4" />
                      Report
                    </button>
                    <button
                      onClick={() => setActiveTab('analysis')}
                      disabled={!decryptedData?.aiAnalysis}
                      className={`px-4 py-3 font-bold text-sm flex items-center gap-2 transition-colors border-r-[2px] border-neo-navy/30
                        ${activeTab === 'analysis' ? 'bg-neo-cream text-neo-navy' : 'text-neo-cream hover:bg-neo-teal-dark'}
                        ${!decryptedData?.aiAnalysis ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Brain className="w-4 h-4" />
                      AI Analysis
                    </button>
                    <button
                      onClick={() => setActiveTab('sources')}
                      disabled={!hasWebContext}
                      className={`px-4 py-3 font-bold text-sm flex items-center gap-2 transition-colors
                        ${activeTab === 'sources' ? 'bg-neo-cream text-neo-navy' : 'text-neo-cream hover:bg-neo-teal-dark'}
                        ${!hasWebContext ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Network className="w-4 h-4" />
                      Sources
                      {hasWebContext && (
                        <span className="bg-neo-orange text-neo-navy text-[10px] px-1.5 py-0.5 font-bold">
                          {decryptedData.webContext.sources.length}
                        </span>
                      )}
                    </button>
                  </div>
                  
                  {/* Actions in header */}
                  {selectedReport?.status === 'under_review' && decryptedData && !decryptedData.error && (
                    <div className="flex gap-2 pr-3">
                      <NeoButton
                        onClick={handleVerify}
                        disabled={actionLoading}
                        variant="teal"
                        className="!py-1.5 !px-3 !text-xs"
                      >
                        {actionLoading ? (
                          <div className="w-3 h-3 border-2 border-neo-cream border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verify
                          </>
                        )}
                      </NeoButton>
                      <NeoButton
                        onClick={handleReject}
                        disabled={actionLoading}
                        variant="maroon"
                        className="!py-1.5 !px-3 !text-xs"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </NeoButton>
                    </div>
                  )}
                </div>

                {/* Tab Content */}
                <div className="p-4">
                  {!selectedReport ? (
                    <div className="h-64 flex items-center justify-center text-neo-navy/40 border-[3px] border-dashed border-neo-navy/30">
                      <div className="text-center">
                        <Eye className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>{t('authority.selectReportToDecrypt')}</p>
                      </div>
                    </div>
                  ) : decrypting ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-neo-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-neo-navy/60">{t('authority.decrypting')}</p>
                      </div>
                    </div>
                  ) : decryptedData?.error ? (
                    <NeoCard variant="maroon" className="p-4">
                      <p className="text-neo-cream font-bold">{t('authority.decryptionFailed')} {decryptedData.error}</p>
                    </NeoCard>
                  ) : decryptedData ? (
                    <>
                      {/* Report Tab */}
                      {activeTab === 'report' && (
                        <div className="space-y-4">
                          {/* Status Banner */}
                          {selectedReport.status === 'verified' && (
                            <div className="flex items-center gap-3 p-3 bg-neo-teal/10 border-l-4 border-neo-teal">
                              <CheckCircle className="w-5 h-5 text-neo-teal" />
                              <p className="font-bold text-neo-teal">{t('authority.reportVerifiedRewarded')}</p>
                            </div>
                          )}
                          {selectedReport.status === 'rejected' && (
                            <div className="flex items-center gap-3 p-3 bg-neo-maroon/10 border-l-4 border-neo-maroon">
                              <XCircle className="w-5 h-5 text-neo-maroon" />
                              <p className="font-bold text-neo-maroon">{t('authority.reportRejected')}</p>
                            </div>
                          )}
                          
                          {/* Decrypted Content */}
                          <div>
                            <p className="text-xs uppercase font-bold text-neo-navy/60 mb-2">{t('authority.decryptedReport')}</p>
                            <NeoCard className="p-4">
                              <p className="whitespace-pre-wrap text-neo-navy">{decryptedData.decrypted}</p>
                            </NeoCard>
                          </div>
                          
                          {/* Quick AI Summary */}
                          {decryptedData.aiAnalysis && (
                            <div className="grid grid-cols-4 gap-3">
                              <div className="p-3 bg-neo-navy text-center">
                                <p className="text-neo-cream/60 text-[10px] uppercase">Possibility</p>
                                <p className={`text-2xl font-bold ${
                                  decryptedData.aiAnalysis.possibilityScore >= 70 ? 'text-neo-teal' :
                                  decryptedData.aiAnalysis.possibilityScore >= 40 ? 'text-neo-orange' : 'text-neo-maroon'
                                }`}>
                                  {decryptedData.aiAnalysis.possibilityScore}%
                                </p>
                              </div>
                              <div className="p-3 bg-neo-navy text-center">
                                <p className="text-neo-cream/60 text-[10px] uppercase">Category</p>
                                <p className="text-neo-cream font-bold capitalize">{decryptedData.aiAnalysis.category}</p>
                              </div>
                              <div className="p-3 bg-neo-navy text-center">
                                <p className="text-neo-cream/60 text-[10px] uppercase">Urgency</p>
                                <p className="text-neo-orange font-bold text-xl">{decryptedData.aiAnalysis.urgencyScore}/10</p>
                              </div>
                              <div className="p-3 bg-neo-navy text-center">
                                <p className="text-neo-cream/60 text-[10px] uppercase">Action</p>
                                <p className="text-neo-teal font-bold capitalize">{decryptedData.aiAnalysis.suggestedAction}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Analysis Tab */}
                      {activeTab === 'analysis' && decryptedData.aiAnalysis && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-neo-orange flex items-center justify-center">
                              <Bot className="w-5 h-5 text-neo-navy" />
                            </div>
                            <p className="font-bold text-neo-navy">{t('authority.aiAnalysis')}</p>
                          </div>

                          {/* Verdict */}
                          {decryptedData.aiAnalysis.verdict && (
                            <div className="p-4 bg-neo-navy border-l-4 border-neo-orange">
                              <p className="text-neo-cream italic">"{decryptedData.aiAnalysis.verdict}"</p>
                            </div>
                          )}

                          {/* Possibility Score Bar */}
                          <div>
                            <div className="flex justify-between text-xs text-neo-navy/60 mb-1">
                              <span>Possibility of Truth</span>
                              <span className="font-bold text-neo-orange">{decryptedData.aiAnalysis.possibilityScore}%</span>
                            </div>
                            <div className="w-full h-4 bg-neo-navy/10 border border-neo-navy/20">
                              <div
                                className={`h-full transition-all ${decryptedData.aiAnalysis.possibilityScore >= 70 ? 'bg-neo-teal' :
                                    decryptedData.aiAnalysis.possibilityScore >= 40 ? 'bg-neo-orange' : 'bg-neo-maroon'
                                  }`}
                                style={{ width: `${decryptedData.aiAnalysis.possibilityScore}%` }}
                              />
                            </div>
                          </div>

                          {/* Metrics Grid */}
                          <div className="grid grid-cols-4 gap-3">
                            <div className="p-3 bg-neo-cream border-[2px] border-neo-navy">
                              <p className="text-neo-navy/60 text-xs">{t('authority.spam')}</p>
                              <p className={`font-bold text-lg ${decryptedData.aiAnalysis.isSpam ? 'text-neo-maroon' : 'text-neo-teal'}`}>
                                {decryptedData.aiAnalysis.isSpam ? 'Yes' : 'No'}
                              </p>
                            </div>
                            <div className="p-3 bg-neo-cream border-[2px] border-neo-navy">
                              <p className="text-neo-navy/60 text-xs">{t('authority.urgency')}</p>
                              <p className="text-neo-orange font-bold text-lg">{decryptedData.aiAnalysis.urgencyScore}/10</p>
                            </div>
                            <div className="p-3 bg-neo-cream border-[2px] border-neo-navy">
                              <p className="text-neo-navy/60 text-xs">{t('authority.category')}</p>
                              <p className="text-neo-navy capitalize font-bold">{decryptedData.aiAnalysis.category}</p>
                            </div>
                            <div className="p-3 bg-neo-cream border-[2px] border-neo-navy">
                              <p className="text-neo-navy/60 text-xs">{t('authority.credibility')}</p>
                              <p className="text-neo-orange font-bold text-lg">{decryptedData.aiAnalysis.credibilityScore}/10</p>
                            </div>
                          </div>

                          {/* Web Context Relevance */}
                          {decryptedData.aiAnalysis.webContextRelevance && (
                            <div className="p-4 bg-neo-teal/10 border-l-4 border-neo-teal">
                              <p className="text-neo-navy/60 text-xs mb-1">Web Context Analysis</p>
                              <p className="text-neo-navy text-sm">{decryptedData.aiAnalysis.webContextRelevance}</p>
                            </div>
                          )}

                          {/* Suggested Action */}
                          <div className="p-4 bg-neo-orange/10 border-[2px] border-neo-orange">
                            <p className="text-neo-navy/60 text-xs">{t('authority.suggestedAction')}</p>
                            <p className="capitalize font-bold text-neo-orange text-2xl">{decryptedData.aiAnalysis.suggestedAction}</p>
                          </div>
                        </div>
                      )}

                      {/* Sources Tab */}
                      {activeTab === 'sources' && hasWebContext && (
                        <SourceNetwork 
                          webContext={decryptedData.webContext}
                          onChainHash={selectedReport?.txHash}
                        />
                      )}
                    </>
                  ) : null}
                </div>
              </NeoCard>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

