import { Link } from 'react-router-dom';
import { Shield, Lock, Zap, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-8">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">Anonymous & Encrypted</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Say<span className="text-emerald-400">Less</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 mb-4">
            Anonymous Crime Reporting Protocol
          </p>
          
          <p className="text-slate-500 max-w-2xl mx-auto mb-12">
            Report crimes anonymously via WhatsApp. Your report is encrypted in your browser 
            before it leaves your device. Even we cannot read it.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/authority">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                Authority Dashboard
              </Button>
            </Link>
            <a href="https://wa.me/14155238886?text=REPORT" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 px-8">
                <MessageSquare className="w-4 h-4 mr-2" />
                Start on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
      
      {/* Features */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">End-to-End Encrypted</h3>
            <p className="text-slate-400">
              Reports are encrypted in your browser using NaCl cryptography. 
              Only the authority can decrypt them.
            </p>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Blockchain Verified</h3>
            <p className="text-slate-400">
              Every report creates an immutable record on Ethereum. 
              Tamper-proof and permanently verifiable.
            </p>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Rewarded & Anonymous</h3>
            <p className="text-slate-400">
              Earn rewards for verified reports. Your identity is never revealed 
              to authorities or stored on-chain.
            </p>
          </div>
        </div>
      </div>
      
      {/* How it works */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-16">How It Works</h2>
        
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-start gap-6">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">1</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Text "REPORT" on WhatsApp</h3>
              <p className="text-slate-400">
                Send a message to our WhatsApp number. You'll receive a secure, one-time link.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-6">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">2</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Write Your Report</h3>
              <p className="text-slate-400">
                Open the link in your browser. Describe the incident. Your text is encrypted 
                before it ever leaves your device.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-6">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">3</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Stored Securely</h3>
              <p className="text-slate-400">
                Encrypted report is stored on IPFS. A cryptographic proof is recorded on 
                Ethereum. Only the authority can decrypt and review.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-6">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">4</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Get Rewarded</h3>
              <p className="text-slate-400">
                If your report is verified, you receive ETH rewards to your anonymous wallet. 
                Check with "REWARDS" on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500">
            SayLess Protocol • Built for Project VEIL • Encrypted, Anonymous, Verified
          </p>
        </div>
      </footer>
    </div>
  );
}


