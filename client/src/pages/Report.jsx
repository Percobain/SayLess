import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Shield,
  Lock,
  Upload,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ArrowLeft,
  Key,
  Cloud,
  Hash,
  FileText,
  Loader2,
} from "lucide-react";
import { BrutalCard } from "../components/BrutalCard";
import { BrutalButton } from "../components/BrutalButton";
import { Skeleton } from "../components/Skeleton";
import { encryptWithNaCl, encryptFile } from "../lib/encryption";
import { checkSession, submitReport } from "../lib/api";

const ENCRYPTION_STEPS = [
  { id: "key", label: "Generate Key", icon: Key },
  { id: "encrypt", label: "Encrypt", icon: Lock },
  { id: "wrap", label: "Wrap Key", icon: Shield },
  { id: "ipfs", label: "Upload IPFS", icon: Cloud },
  { id: "hash", label: "On-Chain", icon: Hash },
];

export default function Report() {
  const { sessionId } = useParams();
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("loading");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);

  useEffect(() => {
    async function validateSession() {
      try {
        const data = await checkSession(sessionId);
        if (data.valid) {
          setSessionInfo(data);
          setStatus("valid");
        } else {
          setError(data.error || "Invalid session");
          setStatus("invalid");
        }
      } catch (err) {
        setError("Failed to validate session");
        setStatus("invalid");
      }
    }
    validateSession();
  }, [sessionId]);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Please enter your report");
      return;
    }

    try {
      setStatus("encrypting");
      setError(null);

      for (let i = 0; i < ENCRYPTION_STEPS.length - 1; i++) {
        setCurrentStep(i);
        await new Promise((r) => setTimeout(r, 600));
      }

      const encryptedReport = encryptWithNaCl(text);
      const encryptedFiles = await Promise.all(files.map((f) => encryptFile(f)));

      const payload = {
        report: encryptedReport,
        files: encryptedFiles,
        timestamp: Date.now(),
      };

      setCurrentStep(ENCRYPTION_STEPS.length - 1);
      setStatus("submitting");

      const data = await submitReport(sessionId, payload);

      if (data.success) {
        setResult(data);
        setStatus("done");
      } else {
        setError(data.error || "Submission failed");
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred");
      setStatus("error");
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="bg-veil-bg min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white border-2 border-veil-muted rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div>
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
          <div className="bg-white border-2 border-veil-muted rounded-xl p-4">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-40 w-full rounded-xl mb-4" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Invalid session
  if (status === "invalid") {
    return (
      <div className="bg-veil-bg min-h-screen flex items-center justify-center p-4">
        <BrutalCard className="max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-veil-danger rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-veil-ink mb-3">
            Invalid Session
          </h1>
          <p className="text-sm text-veil-ink/60 mb-6">
            {error || "This session has expired or does not exist."}
          </p>
          <Link to="/">
            <BrutalButton variant="secondary" className="w-full">
              <ArrowLeft className="w-4 h-4" />
              Go Home
            </BrutalButton>
          </Link>
        </BrutalCard>
      </div>
    );
  }

  // Success state
  if (status === "done") {
    return (
      <div className="bg-veil-bg min-h-screen flex items-center justify-center p-4">
        <BrutalCard className="max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-veil-success rounded-xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-veil-ink mb-3">
            Report Submitted
          </h1>
          <p className="text-sm text-veil-ink/60 mb-6">
            Encrypted and stored on blockchain.
          </p>

          <div className="bg-veil-muted/30 rounded-xl p-4 text-left space-y-3 mb-6">
            <div>
              <p className="text-xs text-veil-ink/50 uppercase mb-1">IPFS CID</p>
              <p className="text-xs text-veil-ink font-mono break-all">{result.cid}</p>
            </div>
            <div>
              <p className="text-xs text-veil-ink/50 uppercase mb-1">TX Hash</p>
              <p className="text-xs text-veil-ink font-mono break-all">{result.txHash}</p>
            </div>
            <div>
              <p className="text-xs text-veil-ink/50 uppercase mb-1">Report ID</p>
              <p className="text-xs text-veil-ink font-mono">{result.reportId}</p>
            </div>
          </div>

          <a
            href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-3"
          >
            <BrutalButton variant="primary" className="w-full">
              View on Etherscan
              <ExternalLink className="w-4 h-4" />
            </BrutalButton>
          </a>
          <p className="text-xs text-veil-ink/40">
            Send STATUS {sessionId} on WhatsApp to track.
          </p>
        </BrutalCard>
      </div>
    );
  }

  // Main form
  return (
    <div className="bg-veil-bg min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Session Banner */}
        <BrutalCard className="mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-veil-accent rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-veil-ink/50 uppercase">Session</p>
                <p className="font-mono text-sm font-semibold text-veil-ink truncate max-w-[150px]">
                  {sessionId}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-veil-success text-white text-xs font-semibold rounded-lg">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
              Secure
            </span>
          </div>
        </BrutalCard>

        {/* Security Notice */}
        <div className="bg-veil-accent/10 border-2 border-veil-accent rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-veil-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-veil-ink mb-1">End-to-End Encrypted</p>
              <p className="text-xs text-veil-ink/60">
                Content encrypted in your browser. Only the authority can decrypt.
              </p>
            </div>
          </div>
        </div>

        {/* Report Form */}
        <BrutalCard className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-veil-accent" />
            <h2 className="font-display font-bold text-veil-ink">Write Your Report</h2>
          </div>

          <div className="mb-4">
            <label className="text-xs text-veil-ink/50 uppercase block mb-2">
              Describe the incident
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Provide as much detail as possible..."
              className="w-full h-36 p-4 bg-veil-muted/20 border-2 border-veil-ink rounded-xl text-sm text-veil-ink placeholder:text-veil-ink/30 focus:outline-none focus:ring-2 focus:ring-veil-accent resize-none"
              disabled={status === "encrypting" || status === "submitting"}
            />
            <div className="flex justify-between mt-2 text-xs text-veil-ink/40">
              <span>{text.length} characters</span>
              <span>Min 50 recommended</span>
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="text-xs text-veil-ink/50 uppercase block mb-2">
              Evidence (optional)
            </label>
            <div className="border-2 border-dashed border-veil-ink/20 rounded-xl p-6 text-center">
              <Upload className="w-6 h-6 text-veil-ink/30 mx-auto mb-2" />
              <input
                type="file"
                multiple
                onChange={(e) => setFiles([...e.target.files])}
                className="hidden"
                id="file-upload"
                disabled={status === "encrypting" || status === "submitting"}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-xs text-veil-ink/50">Tap to upload files</span>
              </label>
              {files.length > 0 && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-1 bg-veil-accent text-white text-xs font-semibold rounded-lg">
                    {files.length} file(s)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && status === "error" && (
            <div className="bg-veil-danger/10 border-2 border-veil-danger rounded-xl p-4 mb-4">
              <p className="text-sm text-veil-danger font-semibold">{error}</p>
            </div>
          )}

          <BrutalButton
            onClick={handleSubmit}
            disabled={status === "encrypting" || status === "submitting" || !text.trim()}
            variant="primary"
            className="w-full"
            loading={status === "encrypting" || status === "submitting"}
          >
            {status === "valid" && (
              <>
                <Lock className="w-4 h-4" />
                Encrypt & Submit
              </>
            )}
            {status === "encrypting" && "Encrypting..."}
            {status === "submitting" && "Submitting..."}
            {status === "error" && "Try Again"}
          </BrutalButton>

          <p className="text-xs text-veil-ink/40 text-center mt-3">
            False reports result in stake penalties.
          </p>
        </BrutalCard>

        {/* Encryption Progress */}
        <BrutalCard className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-veil-accent" />
            <h2 className="font-display font-bold text-veil-ink">Encryption Pipeline</h2>
          </div>
          <div className="space-y-2">
            {ENCRYPTION_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === idx;
              const isComplete = currentStep > idx;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    isComplete
                      ? "bg-veil-success/10 border-veil-success"
                      : isActive
                      ? "bg-veil-accent/10 border-veil-accent"
                      : "bg-veil-muted/20 border-veil-muted"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isComplete
                        ? "bg-veil-success text-white"
                        : isActive
                        ? "bg-veil-accent text-white"
                        : "bg-veil-muted text-veil-ink/40"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isComplete || isActive ? "text-veil-ink" : "text-veil-ink/40"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </BrutalCard>

        {/* Stake Panel */}
        <BrutalCard className="bg-veil-warning/10 border-veil-warning">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-veil-warning rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-veil-ink">Stake Required</p>
              <p className="text-xl font-display font-bold text-veil-warning">0.01 ETH</p>
            </div>
          </div>
          <p className="text-xs text-veil-ink/60">
            A small stake prevents spam. Verified reports get stake + reward.
          </p>
        </BrutalCard>
      </div>
    </div>
  );
}
