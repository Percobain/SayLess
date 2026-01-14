import { useState, useEffect } from "react";
import {
  Shield,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Bot,
  FileText,
  Loader2,
  Users,
  AlertCircle,
} from "lucide-react";
import { BrutalCard } from "../components/BrutalCard";
import { BrutalButton } from "../components/BrutalButton";
import { Skeleton, SkeletonStats } from "../components/Skeleton";
import {
  getAuthorityReports,
  decryptReport,
  verifyReport,
  rejectReport,
  getAuthorityStats,
} from "../lib/api";

export default function Authority() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);
  const [decrypting, setDecrypting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsData, statsData] = await Promise.all([
        getAuthorityReports(),
        getAuthorityStats(),
      ]);
      setReports(reportsData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
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
    setShowDetail(true);

    try {
      const data = await decryptReport(report._id);
      setDecryptedData(data);
    } catch (err) {
      console.error("Decryption failed:", err);
      setDecryptedData({ error: err.message });
    }

    setDecrypting(false);
  };

  const handleVerify = async () => {
    if (!selectedReport) return;
    setActionLoading(true);

    try {
      await verifyReport(selectedReport._id, "0.005");
      await fetchData();
      setSelectedReport(null);
      setDecryptedData(null);
      setShowDetail(false);
    } catch (err) {
      console.error("Verification failed:", err);
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
      setShowDetail(false);
    } catch (err) {
      console.error("Rejection failed:", err);
    }

    setActionLoading(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      under_review: { className: "bg-veil-warning text-white", icon: Clock, label: "Review" },
      verified: { className: "bg-veil-success text-white", icon: CheckCircle, label: "Verified" },
      rejected: { className: "bg-veil-danger text-white", icon: XCircle, label: "Rejected" },
      pending: { className: "bg-veil-muted text-veil-ink", icon: Clock, label: "Pending" },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg ${badge.className}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-veil-bg min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-56 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <SkeletonStats />
            <SkeletonStats />
            <SkeletonStats />
            <SkeletonStats />
          </div>
          <div className="bg-white border-2 border-veil-muted rounded-xl p-4">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-20 w-full rounded-xl mb-3" />
            <Skeleton className="h-20 w-full rounded-xl mb-3" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-veil-bg min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-veil-ink mb-1">
              Authority Dashboard
            </h1>
            <p className="text-sm text-veil-ink/60">
              Review encrypted reports
            </p>
          </div>
          <BrutalButton onClick={fetchData} variant="secondary" size="sm">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </BrutalButton>
        </div>

        {/* Stats - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <BrutalCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-veil-ink rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-display font-bold text-veil-ink">{stats.total}</p>
                <p className="text-xs text-veil-ink/50 uppercase">Total</p>
              </div>
            </div>
          </BrutalCard>

          <BrutalCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-veil-warning rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-display font-bold text-veil-warning">{stats.pending}</p>
                <p className="text-xs text-veil-ink/50 uppercase">Pending</p>
              </div>
            </div>
          </BrutalCard>

          <BrutalCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-veil-success rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-display font-bold text-veil-success">{stats.verified}</p>
                <p className="text-xs text-veil-ink/50 uppercase">Verified</p>
              </div>
            </div>
          </BrutalCard>

          <BrutalCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-veil-danger rounded-xl flex items-center justify-center">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-display font-bold text-veil-danger">{stats.rejected}</p>
                <p className="text-xs text-veil-ink/50 uppercase">Rejected</p>
              </div>
            </div>
          </BrutalCard>
        </div>

        {/* Reports List - Full Width on Mobile */}
        {!showDetail ? (
          <BrutalCard noPadding>
            <div className="p-4 border-b-2 border-veil-ink flex items-center gap-2">
              <FileText className="w-5 h-5 text-veil-accent" />
              <h2 className="font-display font-bold text-veil-ink">Reports Inbox</h2>
            </div>

            <div className="divide-y-2 divide-veil-muted max-h-[60vh] overflow-y-auto">
              {reports.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-10 h-10 text-veil-muted mx-auto mb-3" />
                  <p className="text-veil-ink/40 text-sm">No reports yet</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div
                    key={report._id}
                    className="p-4 active:bg-veil-accent/10 cursor-pointer transition-colors"
                    onClick={() => handleDecrypt(report)}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-mono text-sm font-semibold text-veil-ink">
                          {report.sessionId}
                        </p>
                        <p className="text-xs text-veil-ink/40 mt-0.5">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-veil-ink/50">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Rep: {report.reporterReputation || 0}
                      </span>
                      {report.txHash && (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${report.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-veil-accent"
                        >
                          TX <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </BrutalCard>
        ) : (
          /* Report Detail View - Full Screen on Mobile */
          <div className="space-y-4">
            {/* Back Button */}
            <button
              onClick={() => {
                setShowDetail(false);
                setSelectedReport(null);
                setDecryptedData(null);
              }}
              className="flex items-center gap-2 text-sm font-semibold text-veil-ink/60 hover:text-veil-ink transition-colors"
            >
              ← Back to Reports
            </button>

            <BrutalCard>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-veil-accent" />
                <h2 className="font-display font-bold text-veil-ink">Report Details</h2>
              </div>

              {decrypting ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 text-veil-accent animate-spin mx-auto mb-3" />
                  <p className="text-veil-ink/40 text-sm">Decrypting with authority key...</p>
                </div>
              ) : decryptedData?.error ? (
                <div className="bg-veil-danger/10 border-2 border-veil-danger rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-veil-danger" />
                    <p className="text-veil-danger font-semibold text-sm">
                      Decryption failed: {decryptedData.error}
                    </p>
                  </div>
                </div>
              ) : decryptedData ? (
                <div className="space-y-4">
                  {/* Session Info */}
                  <div className="flex items-center justify-between p-3 bg-veil-muted/30 rounded-xl">
                    <div>
                      <p className="text-xs text-veil-ink/50 uppercase">Session</p>
                      <p className="font-mono text-sm font-semibold text-veil-ink">
                        {selectedReport.sessionId}
                      </p>
                    </div>
                    {getStatusBadge(selectedReport.status)}
                  </div>

                  {/* Decrypted Content */}
                  <div>
                    <p className="text-xs text-veil-ink/50 uppercase mb-2">Decrypted Report</p>
                    <div className="bg-veil-muted/20 border-2 border-veil-ink rounded-xl p-4 max-h-40 overflow-y-auto">
                      <p className="text-sm text-veil-ink whitespace-pre-wrap leading-relaxed">
                        {decryptedData.decrypted}
                      </p>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {decryptedData.aiAnalysis && (
                    <div className="bg-veil-accent/5 border-2 border-veil-accent rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="w-5 h-5 text-veil-accent" />
                        <p className="font-display font-bold text-veil-ink">AI Analysis</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-xs text-veil-ink/50 mb-1">Spam</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            decryptedData.aiAnalysis.isSpam
                              ? "bg-veil-danger/20 text-veil-danger"
                              : "bg-veil-success/20 text-veil-success"
                          }`}>
                            {decryptedData.aiAnalysis.isSpam ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-xs text-veil-ink/50 mb-1">Urgency</p>
                          <p className="font-bold text-veil-ink">{decryptedData.aiAnalysis.urgencyScore}/10</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-xs text-veil-ink/50 mb-1">Category</p>
                          <p className="font-semibold text-veil-ink capitalize text-xs">
                            {decryptedData.aiAnalysis.category}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-xs text-veil-ink/50 mb-1">Credibility</p>
                          <p className="font-bold text-veil-ink">{decryptedData.aiAnalysis.credibilityScore}/10</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-veil-accent/30">
                        <p className="text-xs text-veil-ink/50 mb-1">Suggested Action</p>
                        <span className="inline-flex items-center px-2 py-1 bg-veil-accent text-white text-xs font-semibold rounded-lg capitalize">
                          {decryptedData.aiAnalysis.suggestedAction}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {selectedReport.status === "under_review" && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <BrutalButton
                        onClick={handleVerify}
                        loading={actionLoading}
                        variant="success"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Verify
                      </BrutalButton>
                      <BrutalButton
                        onClick={handleReject}
                        disabled={actionLoading}
                        variant="danger"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </BrutalButton>
                    </div>
                  )}

                  {selectedReport.status === "verified" && (
                    <div className="bg-veil-success/10 border-2 border-veil-success rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-veil-success" />
                      <p className="text-veil-ink font-semibold text-sm">
                        Report verified and rewarded.
                      </p>
                    </div>
                  )}

                  {selectedReport.status === "rejected" && (
                    <div className="bg-veil-danger/10 border-2 border-veil-danger rounded-xl p-4 flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-veil-danger" />
                      <p className="text-veil-ink font-semibold text-sm">
                        Report rejected.
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </BrutalCard>
          </div>
        )}
      </div>
    </div>
  );
}
