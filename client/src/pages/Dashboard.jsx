import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Key,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  Star,
  MessageSquare,
} from "lucide-react";
import { BrutalCard, BrutalCardHeader, BrutalCardTitle } from "../components/BrutalCard";
import { BrutalButton } from "../components/BrutalButton";
import { Skeleton, SkeletonStats, SkeletonText } from "../components/Skeleton";

// Mock data for demo
const MOCK_USER = {
  id: "0x8F3...A2B1",
  balance: 0.245,
  reputation: 87,
  activeReports: 2,
};

const MOCK_REPORTS = [
  {
    id: "rpt_001",
    sessionId: "sess_abc123",
    status: "verified",
    stake: 0.01,
    reward: 0.005,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    txHash: "0x1234567890abcdef1234567890abcdef12345678",
  },
  {
    id: "rpt_002",
    sessionId: "sess_def456",
    status: "pending",
    stake: 0.01,
    reward: 0,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    txHash: "0xabcdef1234567890abcdef1234567890abcdef12",
  },
  {
    id: "rpt_003",
    sessionId: "sess_ghi789",
    status: "under_review",
    stake: 0.01,
    reward: 0,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    txHash: "0x567890abcdef1234567890abcdef1234567890ab",
  },
];

const MOCK_HISTORY = [
  {
    id: "tx_001",
    type: "reward",
    amount: 0.005,
    description: "Report verified",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "tx_002",
    type: "stake",
    amount: -0.01,
    description: "Stake locked",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "tx_003",
    type: "refund",
    amount: 0.01,
    description: "Stake refunded",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setUser(MOCK_USER);
      setReports(MOCK_REPORTS);
      setHistory(MOCK_HISTORY);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      verified: {
        className: "bg-veil-success text-white",
        icon: CheckCircle,
        label: "Verified",
      },
      rejected: {
        className: "bg-veil-danger text-white",
        icon: XCircle,
        label: "Rejected",
      },
      pending: {
        className: "bg-veil-muted text-veil-ink",
        icon: Clock,
        label: "Pending",
      },
      under_review: {
        className: "bg-veil-warning text-white",
        icon: Clock,
        label: "Review",
      },
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

  const filteredReports =
    activeTab === "all"
      ? reports
      : reports.filter((r) => r.status === activeTab);

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-veil-bg min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <SkeletonStats />
            <SkeletonStats />
            <SkeletonStats />
            <SkeletonStats />
          </div>
          <div className="space-y-4">
            <div className="bg-white border-2 border-veil-muted rounded-xl p-4">
              <Skeleton className="h-5 w-24 mb-4" />
              <Skeleton className="h-20 w-full rounded-xl mb-3" />
              <Skeleton className="h-20 w-full rounded-xl mb-3" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-veil-bg min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h1 className="text-2xl font-display font-bold text-veil-ink">
              My Dashboard
            </h1>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-veil-ink rounded-full text-xs font-mono font-semibold">
              <Wallet className="w-3 h-3" />
              {user.id}
            </div>
          </div>
          <p className="text-sm text-veil-ink/60">
            Track your reports, rewards, and reputation
          </p>
        </div>

        {/* Stats - 2x2 Grid Always */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <BrutalCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-veil-accent rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-display font-bold text-veil-ink">
                  {user.balance}
                </p>
                <p className="text-xs text-veil-ink/50 uppercase tracking-wide">
                  ETH Balance
                </p>
              </div>
            </div>
          </BrutalCard>

          <BrutalCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-veil-success rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-display font-bold text-veil-success">
                  {user.reputation}
                </p>
                <p className="text-xs text-veil-ink/50 uppercase tracking-wide">
                  Reputation
                </p>
              </div>
            </div>
          </BrutalCard>

          <BrutalCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-veil-warning rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-display font-bold text-veil-warning">
                  {user.activeReports}
                </p>
                <p className="text-xs text-veil-ink/50 uppercase tracking-wide">
                  Active Reports
                </p>
              </div>
            </div>
          </BrutalCard>

          <BrutalCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-veil-ink rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-display font-bold text-veil-ink">
                  {reports.filter((r) => r.status === "verified").length}
                </p>
                <p className="text-xs text-veil-ink/50 uppercase tracking-wide">
                  Verified
                </p>
              </div>
            </div>
          </BrutalCard>
        </div>

        {/* Reports Section */}
        <BrutalCard noPadding className="mb-6">
          <div className="p-4 border-b-2 border-veil-ink">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-veil-accent" />
                <h2 className="font-display font-bold text-veil-ink">My Reports</h2>
              </div>
            </div>
            {/* Filter Tabs - Scrollable */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {["all", "pending", "verified", "rejected"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all whitespace-nowrap capitalize ${
                    activeTab === tab
                      ? "bg-veil-ink text-white border-veil-ink"
                      : "bg-white text-veil-ink border-veil-muted"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Report Cards - Mobile Optimized */}
          <div className="divide-y-2 divide-veil-muted">
            {filteredReports.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-10 h-10 text-veil-muted mx-auto mb-3" />
                <p className="text-veil-ink/40 text-sm">No reports found</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-veil-ink/60">
                        Stake: <span className="font-mono font-semibold text-veil-ink">{report.stake} ETH</span>
                      </span>
                      {report.reward > 0 && (
                        <span className="text-veil-success font-semibold">
                          +{report.reward} ETH
                        </span>
                      )}
                    </div>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${report.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-veil-accent hover:bg-veil-accent/10 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </BrutalCard>

        {/* Rewards History */}
        <BrutalCard className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-veil-accent" />
            <h2 className="font-display font-bold text-veil-ink">Rewards & Penalties</h2>
          </div>
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-veil-muted/20 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      item.amount > 0
                        ? "bg-veil-success/20 text-veil-success"
                        : "bg-veil-danger/20 text-veil-danger"
                    }`}
                  >
                    {item.amount > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-veil-ink">
                      {item.description}
                    </p>
                    <p className="text-xs text-veil-ink/40">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-mono text-sm font-bold ${
                    item.amount > 0 ? "text-veil-success" : "text-veil-danger"
                  }`}
                >
                  {item.amount > 0 ? "+" : ""}
                  {item.amount} ETH
                </span>
              </div>
            ))}
          </div>
        </BrutalCard>

        {/* Key Safety */}
        <BrutalCard className="bg-veil-accent/5 border-veil-accent mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-veil-accent rounded-xl flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-veil-ink">Key Safety</p>
              <p className="text-xs text-veil-ink/60">Your encryption keys</p>
            </div>
          </div>
          <p className="text-sm text-veil-ink/60 mb-4">
            Keys are stored locally in this browser. Export them for backup.
          </p>
          <BrutalButton variant="outline" className="w-full">
            <Download className="w-4 h-4" />
            Export Keys
          </BrutalButton>
        </BrutalCard>

        {/* Quick Actions */}
        <BrutalCard>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-veil-accent" />
            <h2 className="font-display font-bold text-veil-ink">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://wa.me/14155238886?text=REPORT"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BrutalButton variant="primary" className="w-full" showArrow>
                <MessageSquare className="w-4 h-4" />
                Report
              </BrutalButton>
            </a>
            <a
              href="https://wa.me/14155238886?text=STATUS"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BrutalButton variant="secondary" className="w-full">
                Status
              </BrutalButton>
            </a>
          </div>
        </BrutalCard>
      </div>
    </div>
  );
}
