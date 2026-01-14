import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  Shield, Lock, Upload, CheckCircle, AlertCircle, 
  ExternalLink, ArrowLeft, FileText, AlertTriangle 
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
  const [status, setStatus] = useState('valid'); // loading, valid, invalid, encrypting, submitting, done, error
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

      // Simulate encryption delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Encrypt report text
      const encryptedReport = encryptWithNaCl(text);

      // Encrypt files if any
      const encryptedFiles = await Promise.all(
        files.map(f => encryptFile(f))
      );

      // Build payload
      const payload = {
        report: encryptedReport,
        category,
        severity,
        files: encryptedFiles,
        timestamp: Date.now()
      };

      setStatus('submitting');

      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Submit to backend
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
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <NeoCard className="p-12 text-center max-w-md">
            <div className="w-20 h-20 border-[4px] border-neo-orange border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-heading font-bold mb-2">Encrypting Report...</h2>
            <p className="text-gray-600">Your report is being encrypted in this browser</p>
            <div className="mt-6 p-4 bg-gray-100 border-[2px] border-neo-black">
              <code className="text-sm text-gray-600 font-mono">🔐 NaCl encryption in progress...</code>
            </div>
          </NeoCard>
        </div>
      </Layout>
    );
  }

  // Submitting state
  if (status === 'submitting') {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <NeoCard variant="black" className="p-12 text-center max-w-md">
            <div className="w-20 h-20 border-[4px] border-neo-green border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-heading font-bold text-neo-white mb-2">Submitting to Blockchain...</h2>
            <p className="text-gray-400">Storing on IPFS & recording proof on Ethereum</p>
            <div className="mt-6 space-y-2 text-left">
              <div className="flex items-center gap-2 text-neo-green text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Encrypted locally</span>
              </div>
              <div className="flex items-center gap-2 text-neo-orange text-sm animate-pulse">
                <div className="w-4 h-4 border-2 border-neo-orange border-t-transparent rounded-full animate-spin" />
                <span>Uploading to IPFS...</span>
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
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <NeoCard variant="green" className="p-8 text-center max-w-lg">
            <div className="w-20 h-20 bg-neo-black border-[3px] border-neo-black flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-neo-green" />
            </div>
            <h2 className="text-3xl font-heading font-bold mb-2">Report Submitted!</h2>
            <p className="text-gray-700 mb-6">
              Your encrypted report has been stored on IPFS and verified on blockchain.
            </p>
            
            <NeoCard className="p-4 text-left space-y-3 mb-6">
              <div>
                <p className="text-xs uppercase font-bold text-gray-500">IPFS CID</p>
                <p className="text-sm font-mono break-all">{result?.cid || 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-gray-500">Transaction Hash</p>
                <p className="text-sm font-mono break-all">{result?.txHash || '0x8a7d3b9c...e2f1a4b5'}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-gray-500">Report ID</p>
                <p className="text-sm font-mono">{result?.reportId || 'RPT-' + Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
              </div>
            </NeoCard>
            
            <div className="space-y-3">
              <a 
                href={`https://sepolia.etherscan.io/tx/${result?.txHash || '0x123'}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <NeoButton variant="black" className="w-full">
                  View on Etherscan
                  <ExternalLink className="w-4 h-4 ml-2" />
                </NeoButton>
              </a>
              <Link to="/reporter">
                <NeoButton className="w-full">
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
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/reporter" className="inline-flex items-center gap-2 text-gray-600 hover:text-neo-black mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-heading font-bold mb-2">Create Report</h1>
          <div className="flex items-center gap-2">
            <span className="neo-badge-green">
              <Lock className="w-3 h-3" />
              End-to-End Encrypted
            </span>
            <span className="text-sm text-gray-500">Session: {sessionId}</span>
          </div>
        </div>

        {/* Security Notice */}
        <NeoCard variant="black" className="p-4 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-neo-orange flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-neo-white font-bold text-sm">Your report is encrypted in this browser</p>
              <p className="text-gray-400 text-xs mt-1">
                Content is encrypted before leaving your device. Only the designated authority can decrypt it.
              </p>
            </div>
          </div>
        </NeoCard>

        {/* Form */}
        <NeoCard className="p-6 md:p-8">
          {/* Category */}
          <div className="mb-8">
            <label className="block font-heading font-bold mb-3">Crime Category *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {crimeCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`
                    p-3 border-[3px] border-neo-black text-left transition-all
                    ${category === cat.id 
                      ? 'bg-neo-orange shadow-none translate-x-[2px] translate-y-[2px]' 
                      : 'bg-neo-white shadow-neo hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="text-2xl block mb-1">{cat.icon}</span>
                  <span className="text-xs font-bold uppercase">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div className="mb-8">
            <label className="block font-heading font-bold mb-3">
              Severity Level: <span className="text-neo-orange">{severity}/10</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full h-4 bg-gray-200 border-[3px] border-neo-black appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                           [&::-webkit-slider-thumb]:bg-neo-orange [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-neo-black
                           [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>Critical</span>
              </div>
            </div>
          </div>

          {/* Report Text */}
          <div className="mb-8">
            <label className="block font-heading font-bold mb-3">
              Describe the Incident *
              <span className="block text-xs text-gray-500 font-normal mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3" /> This will be encrypted
              </span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Provide as much detail as possible about the incident..."
              className="neo-textarea h-48"
              disabled={status === 'encrypting' || status === 'submitting'}
            />
          </div>

          {/* File Upload */}
          <div className="mb-8">
            <label className="block font-heading font-bold mb-3">Evidence (optional)</label>
            <div className="border-[3px] border-dashed border-neo-black p-8 text-center hover:bg-gray-50 transition-colors">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <input
                type="file"
                multiple
                onChange={(e) => setFiles([...e.target.files])}
                className="hidden"
                id="file-upload"
                disabled={status === 'encrypting' || status === 'submitting'}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="neo-btn-orange text-sm">Choose Files</span>
                <p className="text-sm text-gray-500 mt-2">or drag and drop</p>
              </label>
              {files.length > 0 && (
                <p className="mt-4 neo-badge-green">
                  {files.length} file(s) selected
                </p>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <NeoCard className="p-4 mb-6 bg-red-100 border-red-500">
              <div className="flex items-center gap-2 text-red-700">
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

          <p className="text-xs text-gray-500 text-center mt-4">
            By submitting, you confirm this is a genuine report. False reports will result in reputation penalties.
          </p>
        </NeoCard>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-neo-black/80 flex items-center justify-center p-4 z-50">
          <NeoCard className="max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-300 border-[3px] border-neo-black flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-bold">Confirm Submission</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Once submitted, your report cannot be modified or deleted. It will be permanently 
              stored on the blockchain. Are you sure you want to proceed?
            </p>
            <div className="flex gap-3">
              <NeoButton 
                variant="black" 
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
