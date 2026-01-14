import { Link } from 'react-router-dom';
import { Shield, Lock, Zap, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-24 lg:py-32">
        <div className="max-w-5xl">
          <div className="inline-flex items-center gap-2 border-b border-[#F0ECD9]/20 pb-2 mb-12">
            <Shield className="w-4 h-4 text-[#D94A3A]" />
            <span className="text-[#F0ECD9]/60 text-sm font-medium uppercase tracking-widest">Anonymous & Encrypted</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black text-[#F0ECD9] mb-8 tracking-tight leading-[0.9]">
            Say<span className="text-[#D94A3A]">Less</span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-[#F0ECD9]/80 mb-4 font-light max-w-2xl">
            Anonymous Crime Reporting Protocol
          </p>
          
          <p className="text-[#F0ECD9]/40 max-w-xl mb-16 text-lg leading-relaxed">
            Report crimes anonymously via WhatsApp. Your report is encrypted in your browser 
            before it leaves your device. Even we cannot read it.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <Link to="/authority">
              <Button size="lg" className="group">
                Authority Dashboard
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="https://wa.me/14155238886?text=REPORT" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="group">
                <MessageSquare className="w-4 h-4 mr-2" />
                Start on WhatsApp
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </a>
          </div>
        </div>
      </div>
      
      {/* Features */}
      <div className="container mx-auto px-6 py-24 border-t border-[#F0ECD9]/10">
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16 max-w-6xl">
          <div className="group hover-scale">
            <div className="mb-6">
              <Lock className="w-8 h-8 text-[#D94A3A]" />
            </div>
            <h3 className="text-xl font-display font-bold text-[#F0ECD9] mb-4">End-to-End Encrypted</h3>
            <p className="text-[#F0ECD9]/50 leading-relaxed">
              Reports are encrypted in your browser using NaCl cryptography. 
              Only the authority can decrypt them.
            </p>
          </div>
          
          <div className="group hover-scale">
            <div className="mb-6">
              <Zap className="w-8 h-8 text-[#D94A3A]" />
            </div>
            <h3 className="text-xl font-display font-bold text-[#F0ECD9] mb-4">Blockchain Verified</h3>
            <p className="text-[#F0ECD9]/50 leading-relaxed">
              Every report creates an immutable record on Ethereum. 
              Tamper-proof and permanently verifiable.
            </p>
          </div>
          
          <div className="group hover-scale">
            <div className="mb-6">
              <Shield className="w-8 h-8 text-[#D94A3A]" />
            </div>
            <h3 className="text-xl font-display font-bold text-[#F0ECD9] mb-4">Rewarded & Anonymous</h3>
            <p className="text-[#F0ECD9]/50 leading-relaxed">
              Earn rewards for verified reports. Your identity is never revealed 
              to authorities or stored on-chain.
            </p>
          </div>
        </div>
      </div>
      
      {/* How it works */}
      <div className="container mx-auto px-6 py-24 border-t border-[#F0ECD9]/10">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-[#F0ECD9] mb-20 tracking-tight">How It Works</h2>
        
        <div className="max-w-3xl space-y-16">
          <div className="flex items-start gap-8 group">
            <div className="w-12 h-12 border border-[#F0ECD9]/20 flex items-center justify-center flex-shrink-0 text-[#D94A3A] font-display font-bold text-xl transition-colors group-hover:border-[#D94A3A] group-hover:bg-[#D94A3A]/10">
              1
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-[#F0ECD9] mb-3">Text "REPORT" on WhatsApp</h3>
              <p className="text-[#F0ECD9]/50 leading-relaxed">
                Send a message to our WhatsApp number. You'll receive a secure, one-time link.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-8 group">
            <div className="w-12 h-12 border border-[#F0ECD9]/20 flex items-center justify-center flex-shrink-0 text-[#D94A3A] font-display font-bold text-xl transition-colors group-hover:border-[#D94A3A] group-hover:bg-[#D94A3A]/10">
              2
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-[#F0ECD9] mb-3">Write Your Report</h3>
              <p className="text-[#F0ECD9]/50 leading-relaxed">
                Open the link in your browser. Describe the incident. Your text is encrypted 
                before it ever leaves your device.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-8 group">
            <div className="w-12 h-12 border border-[#F0ECD9]/20 flex items-center justify-center flex-shrink-0 text-[#D94A3A] font-display font-bold text-xl transition-colors group-hover:border-[#D94A3A] group-hover:bg-[#D94A3A]/10">
              3
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-[#F0ECD9] mb-3">Stored Securely</h3>
              <p className="text-[#F0ECD9]/50 leading-relaxed">
                Encrypted report is stored on IPFS. A cryptographic proof is recorded on 
                Ethereum. Only the authority can decrypt and review.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-8 group">
            <div className="w-12 h-12 border border-[#F0ECD9]/20 flex items-center justify-center flex-shrink-0 text-[#D94A3A] font-display font-bold text-xl transition-colors group-hover:border-[#D94A3A] group-hover:bg-[#D94A3A]/10">
              4
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-[#F0ECD9] mb-3">Get Rewarded</h3>
              <p className="text-[#F0ECD9]/50 leading-relaxed">
                If your report is verified, you receive ETH rewards to your anonymous wallet. 
                Check with "REWARDS" on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-[#F0ECD9]/10 py-12">
        <div className="container mx-auto px-6">
          <p className="text-[#F0ECD9]/30 text-sm">
            SayLess Protocol • Built for Project VEIL • Encrypted, Anonymous, Verified
          </p>
        </div>
      </footer>
    </div>
  );
}
