import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Lock, Upload, CheckCircle, AlertCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { encryptWithNaCl, encryptFile } from '../lib/encryption';
import { checkSession, submitReport } from '../lib/api';

export default function Report() {
  const { sessionId } = useParams();
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('loading'); // loading, valid, invalid, encrypting, submitting, done, error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    async function validateSession() {
      try {
        const data = await checkSession(sessionId);
        if (data.valid) {
          setSessionInfo(data);
          setStatus('valid');
        } else {
          setError(data.error || 'Invalid session');
          setStatus('invalid');
        }
      } catch (err) {
        setError('Failed to validate session');
        setStatus('invalid');
      }
    }
    validateSession();
  }, [sessionId]);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Please enter your report');
      return;
    }

    try {
      setStatus('encrypting');
      setError(null);

      // Encrypt report text
      const encryptedReport = encryptWithNaCl(text);

      // Encrypt files if any
      const encryptedFiles = await Promise.all(
        files.map(f => encryptFile(f))
      );

      // Build payload
      const payload = {
        report: encryptedReport,
        files: encryptedFiles,
        timestamp: Date.now()
      };

      setStatus('submitting');

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

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Validating session...</p>
        </div>
      </div>
    );
  }

  // Invalid session
  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/50 border border-red-500/30 rounded-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Session</h1>
          <p className="text-slate-400 mb-6">{error || 'This session has expired or does not exist.'}</p>
          <Link to="/">
            <Button variant="outline" className="border-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Report Submitted!</h1>
          <p className="text-slate-400 mb-6">
            Your encrypted report has been stored on IPFS and verified on blockchain.
          </p>
          
          <div className="bg-slate-800/50 rounded-xl p-4 text-left space-y-3 mb-6">
            <div>
              <p className="text-xs text-slate-500 uppercase">IPFS CID</p>
              <p className="text-sm text-slate-300 font-mono break-all">{result.cid}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Transaction Hash</p>
              <p className="text-sm text-slate-300 font-mono break-all">{result.txHash}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Report ID</p>
              <p className="text-sm text-slate-300 font-mono">{result.reportId}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <a 
              href={`https://sepolia.etherscan.io/tx/${result.txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                View on Etherscan
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
            <p className="text-xs text-slate-500">
              Send STATUS {sessionId} on WhatsApp to track your report.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-4">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">End-to-End Encrypted</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Anonymous Report</h1>
          <p className="text-slate-400">Session: {sessionId}</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8">
          {/* Security Notice */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-emerald-300 font-medium">Your report is encrypted in this browser</p>
                <p className="text-xs text-slate-400 mt-1">
                  Content is encrypted before leaving your device. Only the designated authority can decrypt it.
                </p>
              </div>
            </div>
          </div>

          {/* Report Text */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Describe the incident
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Provide as much detail as possible about the incident..."
              className="w-full h-48 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              disabled={status === 'encrypting' || status === 'submitting'}
            />
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Evidence (optional)
            </label>
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-slate-600 transition-colors">
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <input
                type="file"
                multiple
                onChange={(e) => setFiles([...e.target.files])}
                className="hidden"
                id="file-upload"
                disabled={status === 'encrypting' || status === 'submitting'}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-sm text-slate-400">
                  Click to upload files or drag and drop
                </span>
              </label>
              {files.length > 0 && (
                <div className="mt-3 text-sm text-emerald-400">
                  {files.length} file(s) selected
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && status === 'error' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={status === 'encrypting' || status === 'submitting' || !text.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg"
          >
            {status === 'valid' && (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Encrypt & Submit Report
              </>
            )}
            {status === 'encrypting' && (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Encrypting...
              </>
            )}
            {status === 'submitting' && (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting to blockchain...
              </>
            )}
            {status === 'error' && 'Try Again'}
          </Button>

          <p className="text-xs text-slate-500 text-center mt-4">
            By submitting, you confirm this is a genuine report. False reports will result in reputation penalties.
          </p>
        </div>
      </div>
    </div>
  );
}


