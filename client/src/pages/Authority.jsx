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
      'under_review': { bg: 'bg-neo-orange text-neo-navy', label: t('authority.status.underReview'), icon: Clock },
      'verified': { bg: 'bg-neo-teal text-neo-cream', label: t('authority.status.verified'), icon: CheckCircle },
      'rejected': { bg: 'bg-neo-maroon text-neo-cream', label: t('authority.status.rejected'), icon: XCircle },
      'pending': { bg: 'bg-neo-cream text-neo-navy', label: t('authority.status.pending'), icon: Clock }
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
                {t('authority.badge')}
              </div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-neo-cream mb-2">
                {t('authority.title')}
              </h1>
              <p className="text-neo-cream/60">
                {t('authority.subtitle')}
              </p>
            </div>
            <NeoButton variant="orange" onClick={fetchData}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t('authority.refresh')}
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
              <p className="text-sm text-neo-navy/60">{t('authority.totalReports')}</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-orange">{stats.pending}</p>
              <p className="text-sm text-neo-navy/60">{t('authority.pendingReview')}</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-teal">{stats.verified}</p>
              <p className="text-sm text-neo-navy/60">{t('authority.verified')}</p>
            </div>
            <div className="py-6 text-center">
              <p className="text-4xl font-heading font-bold text-neo-maroon">{stats.rejected}</p>
              <p className="text-sm text-neo-navy/60">{t('authority.rejected')}</p>
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
                  {t('authority.reports')}
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
                      {f === 'all' ? t('authority.filterAll') : f === 'under_review' ? t('authority.filterReview') : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto divide-y-[2px] divide-neo-navy">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="w-10 h-10 border-4 border-neo-orange border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-neo-navy/60">{t('authority.loadingReports')}</p>
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="p-8 text-center text-neo-navy/60">
                    {t('authority.noReportsFound')}
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
                            {t('common.session')}: {report.sessionId}
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
                  {t('authority.reportDetails')}
                </h2>
              </div>

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
                  <div className="space-y-4">
                    {/* Decrypted Content */}
                    <div>
                      <p className="text-xs uppercase font-bold text-neo-navy/60 mb-2">{t('authority.decryptedReport')}</p>
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
                          <p className="font-bold text-neo-cream">{t('authority.aiAnalysis')}</p>
                        </div>

                        {/* Verdict */}
                        {decryptedData.aiAnalysis.verdict && (
                          <div className="mb-4 p-3 bg-neo-teal/20 border-l-4 border-neo-orange">
                            <p className="text-neo-cream text-sm italic">"{decryptedData.aiAnalysis.verdict}"</p>
                          </div>
                        )}

                        {/* Possibility Score Bar */}
                        {decryptedData.aiAnalysis.possibilityScore !== undefined && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-neo-cream/60 mb-1">
                              <span>Possibility of Truth</span>
                              <span className="font-bold text-neo-orange">{decryptedData.aiAnalysis.possibilityScore}%</span>
                            </div>
                            <div className="w-full h-3 bg-neo-navy-light border border-neo-cream/20">
                              <div
                                className={`h-full transition-all ${decryptedData.aiAnalysis.possibilityScore >= 70 ? 'bg-neo-teal' :
                                    decryptedData.aiAnalysis.possibilityScore >= 40 ? 'bg-neo-orange' : 'bg-neo-maroon'
                                  }`}
                                style={{ width: `${decryptedData.aiAnalysis.possibilityScore}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="p-2 bg-neo-teal/20">
                            <p className="text-neo-cream/60 text-xs">{t('authority.spam')}</p>
                            <p className={`font-bold ${decryptedData.aiAnalysis.isSpam ? 'text-neo-maroon' : 'text-neo-teal'}`}>
                              {decryptedData.aiAnalysis.isSpam ? 'Yes' : 'No'}
                            </p>
                          </div>
                          <div className="p-2 bg-neo-teal/20">
                            <p className="text-neo-cream/60 text-xs">{t('authority.urgency')}</p>
                            <p className="text-neo-orange font-bold">{decryptedData.aiAnalysis.urgencyScore}/10</p>
                          </div>
                          <div className="p-2 bg-neo-teal/20">
                            <p className="text-neo-cream/60 text-xs">{t('authority.category')}</p>
                            <p className="text-neo-cream capitalize font-bold">{decryptedData.aiAnalysis.category}</p>
                          </div>
                          <div className="p-2 bg-neo-teal/20">
                            <p className="text-neo-cream/60 text-xs">{t('authority.credibility')}</p>
                            <p className="text-neo-orange font-bold">{decryptedData.aiAnalysis.credibilityScore}/10</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neo-teal/30">
                          <p className="text-neo-cream/60 text-xs">{t('authority.suggestedAction')}</p>
                          <p className="capitalize font-bold text-neo-orange text-lg">{decryptedData.aiAnalysis.suggestedAction}</p>
                        </div>

                        {/* Web Context Relevance */}
                        {decryptedData.aiAnalysis.webContextRelevance && (
                          <div className="mt-3 pt-3 border-t border-neo-teal/30">
                            <p className="text-neo-cream/60 text-xs">Web Context Analysis</p>
                            <p className="text-neo-cream text-sm">{decryptedData.aiAnalysis.webContextRelevance}</p>
                          </div>
                        )}
                      </NeoCard>
                    )}

                    {/* Web Search Context */}
                    {decryptedData.webContext && decryptedData.webContext.sources && decryptedData.webContext.sources.length > 0 && (
                      <NeoCard className="p-4 bg-neo-cream/5 border-neo-teal/30">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-neo-teal flex items-center justify-center">
                            <svg className="w-4 h-4 text-neo-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <p className="font-bold text-neo-navy text-sm">Web Search Context (Tavily)</p>
                        </div>

                        {decryptedData.webContext.answer && (
                          <p className="text-neo-navy/80 text-sm mb-3 italic">"{decryptedData.webContext.answer}"</p>
                        )}

                        <div className="space-y-2">
                          {decryptedData.webContext.sources.slice(0, 3).map((source, idx) => (
                            <a
                              key={idx}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-2 bg-neo-cream border border-neo-navy/20 hover:border-neo-teal transition-colors"
                            >
                              <p className="text-xs font-bold text-neo-navy truncate">{source.title}</p>
                              <p className="text-xs text-neo-navy/60 line-clamp-2">{source.snippet}</p>
                            </a>
                          ))}
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
                              {t('authority.verifyAndReward')}
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
                          {t('authority.reject')}
                        </NeoButton>
                      </div>
                    )}

                    {selectedReport.status === 'verified' && (
                      <NeoCard variant="teal" className="p-4 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-neo-cream" />
                        <p className="font-bold text-neo-cream">{t('authority.reportVerifiedRewarded')}</p>
                      </NeoCard>
                    )}

                    {selectedReport.status === 'rejected' && (
                      <NeoCard variant="maroon" className="p-4 flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-neo-cream" />
                        <p className="font-bold text-neo-cream">{t('authority.reportRejected')}</p>
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
