import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Lock, Upload, CheckCircle, AlertCircle, ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
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
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#D94A3A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#F0ECD9]/50 uppercase tracking-widest text-sm">Validating session...</p>
        </div>
      </div>
    );
  }

  // Invalid session
  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-fade-in">
          <AlertCircle className="w-16 h-16 text-[#D94A3A] mx-auto mb-6" />
          <h1 className="text-3xl font-display font-bold text-[#F0ECD9] mb-4">Invalid Session</h1>
          <p className="text-[#F0ECD9]/50 mb-10">{error || 'This session has expired or does not exist.'}</p>
          <Link to="/">
            <Button variant="outline" className="group">
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
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
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center animate-fade-in">
          <CheckCircle className="w-16 h-16 text-[#D94A3A] mx-auto mb-6" />
          <h1 className="text-3xl font-display font-bold text-[#F0ECD9] mb-4">Report Submitted</h1>
          <p className="text-[#F0ECD9]/50 mb-10">
            Your encrypted report has been stored on IPFS and verified on blockchain.
          </p>
          
          <div className="bg-[#F0ECD9]/5 p-6 text-left space-y-4 mb-10 border border-[#F0ECD9]/10">
            <div>
              <p className="text-xs text-[#F0ECD9]/40 uppercase tracking-widest mb-1">IPFS CID</p>
              <p className="text-sm text-[#F0ECD9] font-mono break-all">{result.cid}</p>
            </div>
            <div>
              <p className="text-xs text-[#F0ECD9]/40 uppercase tracking-widest mb-1">Transaction Hash</p>
              <p className="text-sm text-[#F0ECD9] font-mono break-all">{result.txHash}</p>
            </div>
            <div>
              <p className="text-xs text-[#F0ECD9]/40 uppercase tracking-widest mb-1">Report ID</p>
              <p className="text-sm text-[#F0ECD9] font-mono">{result.reportId}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <a 
              href={`https://sepolia.etherscan.io/tx/${result.txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button className="w-full group">
                View on Etherscan
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
            <p className="text-xs text-[#F0ECD9]/30">
              Send STATUS {sessionId} on WhatsApp to track your report.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-[#0A0A0A] py-16 px-6">
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 border-b border-[#F0ECD9]/20 pb-2 mb-8">
            <Lock className="w-4 h-4 text-[#D94A3A]" />
            <span className="text-[#F0ECD9]/60 text-sm uppercase tracking-widest">End-to-End Encrypted</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[#F0ECD9] mb-3 tracking-tight">Anonymous Report</h1>
          <p className="text-[#F0ECD9]/40 font-mono text-sm">Session: {sessionId}</p>
        </div>

        {/* Form */}
        <div className="space-y-8">
          {/* Security Notice */}
          <div className="bg-[#D94A3A]/5 border-l-2 border-[#D94A3A] p-5">
            <div className="flex items-start gap-4">
              <Shield className="w-5 h-5 text-[#D94A3A] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-[#F0ECD9] font-medium mb-1">Your report is encrypted in this browser</p>
                <p className="text-xs text-[#F0ECD9]/40">
                  Content is encrypted before leaving your device. Only the designated authority can decrypt it.
                </p>
              </div>
            </div>
          </div>

          {/* Report Text */}
          <div>
            <label className="block text-sm font-medium text-[#F0ECD9]/60 uppercase tracking-widest mb-3">
              Describe the incident
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Provide as much detail as possible about the incident..."
              className="w-full h-48 bg-[#F0ECD9]/5 border border-[#F0ECD9]/10 p-5 text-[#F0ECD9] placeholder-[#F0ECD9]/20 focus:outline-none focus:border-[#D94A3A] resize-none transition-colors"
              disabled={status === 'encrypting' || status === 'submitting'}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-[#F0ECD9]/60 uppercase tracking-widest mb-3">
              Evidence (optional)
            </label>
            <div className="border border-dashed border-[#F0ECD9]/20 p-8 text-center hover:border-[#F0ECD9]/40 transition-colors cursor-pointer">
              <Upload className="w-6 h-6 text-[#F0ECD9]/30 mx-auto mb-3" />
              <input
                type="file"
                multiple
                onChange={(e) => setFiles([...e.target.files])}
                className="hidden"
                id="file-upload"
                disabled={status === 'encrypting' || status === 'submitting'}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-sm text-[#F0ECD9]/40">
                  Click to upload files or drag and drop
                </span>
              </label>
              {files.length > 0 && (
                <div className="mt-4 text-sm text-[#D94A3A]">
                  {files.length} file(s) selected
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && status === 'error' && (
            <div className="bg-[#D94A3A]/10 border-l-2 border-[#D94A3A] p-4">
              <p className="text-sm text-[#D94A3A]">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={status === 'encrypting' || status === 'submitting' || !text.trim()}
            className="w-full py-6 text-base group"
            size="lg"
          >
            {status === 'valid' && (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Encrypt & Submit Report
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </>
            )}
            {status === 'encrypting' && (
              <>
                <div className="w-5 h-5 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin mr-2" />
                Encrypting...
              </>
            )}
            {status === 'submitting' && (
              <>
                <div className="w-5 h-5 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin mr-2" />
                Submitting to blockchain...
              </>
            )}
            {status === 'error' && 'Try Again'}
          </Button>

          <p className="text-xs text-[#F0ECD9]/30 text-center">
            By submitting, you confirm this is a genuine report. False reports will result in reputation penalties.
          </p>
        </div>
      </div>
    </div>
  );
}
