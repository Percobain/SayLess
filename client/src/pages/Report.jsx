import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  Shield, Lock, Upload, CheckCircle, AlertCircle, 
  ExternalLink, ArrowLeft, FileText, AlertTriangle, Zap 
} from 'lucide-react';
import Layout from '../components/Layout';
import NeoCard from '../components/NeoCard';
import NeoButton from '../components/NeoButton';
import { encryptWithNaCl, encryptFile } from '../lib/encryption';
import { checkSession, submitReport } from '../lib/api';

const crimeCategories = [
  { id: 'theft', label: 'Theft / Robbery', icon: '🔓' },
  { id: 'assault', label: 'Assault / Violence', icon: '⚠️' },
  { id: 'fraud', label: 'Fraud / Scam', icon: '💳' },
  { id: 'corruption', label: 'Corruption / Bribery', icon: '🏛️' },
  { id: 'harassment', label: 'Harassment', icon: '🚨' },
  { id: 'drugs', label: 'Drug-related', icon: '💊' },
  { id: 'cybercrime', label: 'Cybercrime', icon: '💻' },
  { id: 'other', label: 'Other', icon: '📋' },
];

export default function Report() {
  const { sessionId: paramSessionId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = paramSessionId || searchParams.get('session') || 'DEMO-SESSION';
  
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState(5);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('valid');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || !category) {
      setError('Please select a category and enter your report');
      return;
    }
    setShowWarning(true);
  };

  const confirmSubmit = async () => {
    setShowWarning(false);
    
    try {
      setStatus('encrypting');
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const encryptedReport = encryptWithNaCl(text);
      const encryptedFiles = await Promise.all(files.map(f => encryptFile(f)));
      const payload = {
        report: encryptedReport,
        category,
        severity,
        files: encryptedFiles,
        timestamp: Date.now()
      };
      setStatus('submitting');
      await new Promise(resolve => setTimeout(resolve, 2000));
      const data = await submitReport(sessionId, payload);
      if (data.success) {
        setResult(data);
        setStatus('done');
      } else {
        setError(data.error || 'Submission failed');
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred');
      setStatus('error');
    }
  };

  // Encrypting state
  if (status === 'encrypting') {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-neo-cream">
          <NeoCard className="p-12 text-center max-w-md">
            <div className="w-24 h-24 border-[4px] border-neo-orange border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-heading font-bold mb-2 text-neo-navy">Encrypting Report...</h2>
            <p className="text-neo-navy/60">Your report is being encrypted in this browser</p>
            <NeoCard variant="navy" className="mt-6 p-4">
              <code className="text-sm text-neo-orange font-mono">🔐 NaCl encryption in progress...</code>
            </NeoCard>
          </NeoCard>
        </div>
      </Layout>
    );
  }

  // Submitting state
  if (status === 'submitting') {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-neo-navy">
          <NeoCard variant="teal" className="p-12 text-center max-w-md">
            <div className="w-24 h-24 border-[4px] border-neo-orange border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-heading font-bold text-neo-cream mb-2">Submitting to Blockchain...</h2>
            <p className="text-neo-cream/70">Storing on IPFS & recording proof on Ethereum</p>
            <div className="mt-8 space-y-3 text-left">
              <div className="flex items-center gap-3 text-neo-cream">
                <div className="w-8 h-8 bg-neo-orange border-[2px] border-neo-cream flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-neo-navy" />
                </div>
                <span className="font-bold">Encrypted locally</span>
              </div>
              <div className="flex items-center gap-3 text-neo-cream animate-pulse">
                <div className="w-8 h-8 border-[2px] border-neo-cream flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-neo-orange border-t-transparent rounded-full animate-spin" />
                </div>
                <span className="font-bold">Uploading to IPFS...</span>
              </div>
              <div className="flex items-center gap-3 text-neo-cream/50">
                <div className="w-8 h-8 border-[2px] border-neo-cream/50 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <span>Recording on Ethereum</span>
              </div>
            </div>
          </NeoCard>
        </div>
      </Layout>
    );
  }

  // Success state
  if (status === 'done') {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-neo-teal">
          <NeoCard className="p-8 text-center max-w-lg">
            <div className="w-20 h-20 bg-neo-orange border-[3px] border-neo-navy flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-neo-navy" />
            </div>
            <h2 className="text-3xl font-heading font-bold mb-2 text-neo-navy">Report Submitted!</h2>
            <p className="text-neo-navy/70 mb-6">
              Your encrypted report has been stored on IPFS and verified on blockchain.
            </p>
            
            <NeoCard variant="navy" className="p-4 text-left space-y-3 mb-6">
              <div>
                <p className="text-xs uppercase font-bold text-neo-orange">IPFS CID</p>
                <p className="text-sm font-mono text-neo-cream break-all">{result?.cid || 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'}</p>
              </div>
              <div className="neo-divider bg-neo-teal/30"></div>
              <div>
                <p className="text-xs uppercase font-bold text-neo-orange">Transaction Hash</p>
                <p className="text-sm font-mono text-neo-cream break-all">{result?.txHash || '0x8a7d3b9c...e2f1a4b5'}</p>
              </div>
              <div className="neo-divider bg-neo-teal/30"></div>
              <div>
                <p className="text-xs uppercase font-bold text-neo-orange">Report ID</p>
                <p className="text-sm font-mono text-neo-cream">{result?.reportId || 'RPT-' + Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
              </div>
            </NeoCard>
            
            <div className="space-y-3">
              <a 
                href={`https://sepolia.etherscan.io/tx/${result?.txHash || '0x123'}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <NeoButton variant="orange" className="w-full">
                  View on Etherscan
                  <ExternalLink className="w-4 h-4 ml-2" />
                </NeoButton>
              </a>
              <Link to="/reporter">
                <NeoButton variant="navy" className="w-full">
                  Back to Dashboard
                </NeoButton>
              </Link>
            </div>
          </NeoCard>
        </div>
      </Layout>
    );
  }

  // Main form
  return (
    <Layout>
      {/* Header Section */}
      <section className="bg-neo-navy py-8 border-b-[4px] border-neo-navy">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/reporter" className="inline-flex items-center gap-2 text-neo-cream/70 hover:text-neo-orange mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-neo-cream mb-2">Create Report</h1>
              <div className="flex items-center gap-3">
                <span className="neo-badge-orange">
                  <Lock className="w-3 h-3" />
                  Encrypted
                </span>
                <span className="text-sm text-neo-cream/50 font-mono">Session: {sessionId}</span>
              </div>
            </div>
            <NeoCard className="p-3 bg-neo-teal border-neo-teal">
              <div className="flex items-center gap-2 text-neo-cream">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-bold">End-to-End Encrypted</span>
              </div>
            </NeoCard>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 bg-neo-cream">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <NeoCard className="p-6 md:p-8">
                {/* Category */}
                <div className="mb-8">
                  <label className="block font-heading font-bold mb-4 text-neo-navy text-lg">
                    Crime Category <span className="text-neo-maroon">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {crimeCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`
                          p-4 border-[3px] border-neo-navy text-left transition-all
                          ${category === cat.id 
                            ? 'bg-neo-orange shadow-none translate-x-[2px] translate-y-[2px]' 
                            : 'bg-neo-cream shadow-neo hover:bg-neo-teal hover:text-neo-cream'
                          }
                        `}
                      >
                        <span className="text-2xl block mb-2">{cat.icon}</span>
                        <span className="text-xs font-bold uppercase leading-tight">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity */}
                <div className="mb-8">
                  <label className="block font-heading font-bold mb-4 text-neo-navy text-lg">
                    Severity Level
                  </label>
                  <NeoCard variant="navy" className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-neo-cream">Low</span>
                      <span className="text-4xl font-heading font-bold text-neo-orange">{severity}</span>
                      <span className="text-neo-cream">Critical</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={severity}
                      onChange={(e) => setSeverity(Number(e.target.value))}
                      className="w-full h-4 bg-neo-teal appearance-none cursor-pointer
                                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 
                                 [&::-webkit-slider-thumb]:bg-neo-orange [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-neo-cream
                                 [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </NeoCard>
                </div>

                {/* Report Text */}
                <div className="mb-8">
                  <label className="block font-heading font-bold mb-2 text-neo-navy text-lg">
                    Describe the Incident <span className="text-neo-maroon">*</span>
                  </label>
                  <div className="flex items-center gap-2 text-neo-teal text-sm mb-3">
                    <Lock className="w-4 h-4" />
                    <span>This content will be encrypted before leaving your device</span>
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Provide as much detail as possible about the incident. Include dates, locations, descriptions of people involved, and any other relevant information..."
                    className="neo-textarea h-48"
                    disabled={status === 'encrypting' || status === 'submitting'}
                  />
                </div>

                {/* File Upload */}
                <div className="mb-8">
                  <label className="block font-heading font-bold mb-3 text-neo-navy text-lg">
                    Evidence <span className="text-neo-navy/50 text-sm font-normal">(optional)</span>
                  </label>
                  <div className="border-[3px] border-dashed border-neo-navy p-8 text-center hover:bg-neo-teal/10 transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-neo-teal mx-auto mb-4" />
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setFiles([...e.target.files])}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <NeoButton variant="teal" size="sm">Choose Files</NeoButton>
                      <p className="text-sm text-neo-navy/60 mt-3">Images, videos, documents • Max 10MB each</p>
                    </label>
                    {files.length > 0 && (
                      <NeoCard variant="orange" className="mt-4 p-3 inline-block">
                        <span className="font-bold text-neo-navy">{files.length} file(s) selected</span>
                      </NeoCard>
                    )}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <NeoCard className="p-4 mb-6 bg-neo-maroon border-neo-maroon">
                    <div className="flex items-center gap-2 text-neo-cream">
                      <AlertCircle className="w-5 h-5" />
                      <p className="font-bold">{error}</p>
                    </div>
                  </NeoCard>
                )}

                {/* Submit */}
                <NeoButton
                  onClick={handleSubmit}
                  variant="orange"
                  size="lg"
                  className="w-full"
                  disabled={!text.trim() || !category}
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Encrypt & Submit Report
                </NeoButton>
              </NeoCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Security Info */}
              <NeoCard variant="navy" className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-neo-orange flex items-center justify-center">
                    <Shield className="w-5 h-5 text-neo-navy" />
                  </div>
                  <h3 className="font-heading font-bold text-neo-cream">Your Safety</h3>
                </div>
                <ul className="space-y-3 text-sm text-neo-cream/80">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-neo-orange flex-shrink-0 mt-0.5" />
                    <span>Report encrypted in browser</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-neo-orange flex-shrink-0 mt-0.5" />
                    <span>No personally identifiable data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-neo-orange flex-shrink-0 mt-0.5" />
                    <span>Stored on decentralized IPFS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-neo-orange flex-shrink-0 mt-0.5" />
                    <span>Only authorities can decrypt</span>
                  </li>
                </ul>
              </NeoCard>

              {/* Rewards */}
              <NeoCard variant="teal" className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-neo-orange flex items-center justify-center">
                    <Zap className="w-5 h-5 text-neo-navy" />
                  </div>
                  <h3 className="font-heading font-bold text-neo-cream">Earn Rewards</h3>
                </div>
                <p className="text-sm text-neo-cream/80">
                  Verified reports earn ETH rewards. Higher severity + detailed evidence = higher rewards.
                </p>
                <div className="mt-4 p-3 bg-neo-navy/30">
                  <p className="text-xs text-neo-cream/60 uppercase">Average Reward</p>
                  <p className="text-2xl font-heading font-bold text-neo-orange">0.005 ETH</p>
                </div>
              </NeoCard>

              {/* Tips */}
              <NeoCard className="p-5">
                <h3 className="font-heading font-bold text-neo-navy mb-3">Report Tips</h3>
                <ul className="space-y-2 text-sm text-neo-navy/70">
                  <li>• Be specific with dates and times</li>
                  <li>• Include location details</li>
                  <li>• Describe suspects if known</li>
                  <li>• Attach evidence if available</li>
                  <li>• Review before submitting</li>
                </ul>
              </NeoCard>
            </div>
          </div>

          <p className="text-xs text-neo-navy/50 text-center mt-8 max-w-2xl mx-auto">
            By submitting, you confirm this is a genuine report. False reports will result in reputation penalties and stake slashing.
          </p>
        </div>
      </section>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-neo-navy/90 flex items-center justify-center p-4 z-50">
          <NeoCard className="max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-neo-orange border-[3px] border-neo-navy flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-neo-navy" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-neo-navy">Confirm Submission</h3>
                <p className="text-sm text-neo-navy/60">This action is permanent</p>
              </div>
            </div>
            <NeoCard variant="maroon" className="p-4 mb-6">
              <p className="text-neo-cream text-sm">
                Once submitted, your report cannot be modified or deleted. It will be permanently 
                stored on the blockchain.
              </p>
            </NeoCard>
            <div className="flex gap-3">
              <NeoButton 
                variant="navy" 
                className="flex-1"
                onClick={() => setShowWarning(false)}
              >
                Cancel
              </NeoButton>
              <NeoButton 
                variant="orange" 
                danger
                className="flex-1"
                onClick={confirmSubmit}
              >
                Submit Report
              </NeoButton>
            </div>
          </NeoCard>
        </div>
      )}
    </Layout>
  );
}
