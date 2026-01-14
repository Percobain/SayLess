import { Link } from "react-router-dom";
import {
  Shield,
  Lock,
  Zap,
  MessageSquare,
  ChevronDown,
  Eye,
} from "lucide-react";
import { BrutalCard } from "../components/BrutalCard";
import { BrutalButton } from "../components/BrutalButton";
import { useState } from "react";

export default function Landing() {
  return (
    <div className="bg-veil-bg">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-veil-accent text-white text-xs font-semibold rounded-full mb-6">
            <Shield className="w-3 h-3" />
            Anonymous & Encrypted
          </div>

          <h1 className="text-4xl font-display font-bold text-veil-ink mb-4 leading-tight">
            Report without
            <br />
            <span className="text-veil-accent">being seen.</span>
          </h1>

          <p className="text-base text-veil-ink/70 mb-3">
            Anonymous crime reporting powered by encryption and blockchain.
          </p>

          <p className="text-sm text-veil-ink/50 mb-8">
            Your report is encrypted in your browser before it leaves your device. Only the authority can decrypt it.
          </p>

          <div className="flex flex-col gap-3">
            <a
              href="https://wa.me/14155238886?text=REPORT"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BrutalButton variant="primary" size="lg" className="w-full" showArrow>
                <MessageSquare className="w-5 h-5" />
                Start Anonymous Report
              </BrutalButton>
            </a>
            <Link to="/dashboard">
              <BrutalButton variant="secondary" size="lg" className="w-full">
                View My Dashboard
              </BrutalButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-10 border-t-2 border-veil-ink">
        <div className="space-y-4">
          <BrutalCard className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-veil-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-veil-ink mb-1">
                  Encrypt in Browser
                </h3>
                <p className="text-sm text-veil-ink/60">
                  Reports encrypted using NaCl cryptography before leaving your device.
                </p>
              </div>
            </div>
          </BrutalCard>

          <BrutalCard className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-veil-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-veil-ink mb-1">
                  Commit On-Chain
                </h3>
                <p className="text-sm text-veil-ink/60">
                  Every report creates an immutable record on Ethereum blockchain.
                </p>
              </div>
            </div>
          </BrutalCard>

          <BrutalCard className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-veil-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-veil-ink mb-1">
                  No Message Required
                </h3>
                <p className="text-sm text-veil-ink/60">
                  Even a missed call can create a cryptographic proof. Report silently.
                </p>
              </div>
            </div>
          </BrutalCard>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-10 border-t-2 border-veil-ink">
        <h2 className="text-2xl font-display font-bold text-veil-ink mb-8">
          How It Works
        </h2>

        <div className="space-y-4">
          <StepItem
            number={1}
            title='Text "REPORT" on WhatsApp'
            description="Send a message to our WhatsApp number. You'll receive a secure link."
          />
          <StepItem
            number={2}
            title="Write Your Report"
            description="Open the link. Describe the incident. Your text is encrypted locally."
          />
          <StepItem
            number={3}
            title="Stored Securely"
            description="Encrypted report stored on IPFS with proof on Ethereum."
          />
          <StepItem
            number={4}
            title="Get Rewarded"
            description="Verified reports earn ETH rewards to your anonymous wallet."
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-10 border-t-2 border-veil-ink">
        <h2 className="text-2xl font-display font-bold text-veil-ink mb-8">
          Questions
        </h2>

        <div className="space-y-3">
          <FAQItem
            question="Who can read my report?"
            answer="Only the designated authority can decrypt and read your report. The encryption happens in your browser."
          />
          <FAQItem
            question="Why do I need to stake ETH?"
            answer="A small stake (0.01 ETH) prevents spam. Verified reports get stake + reward."
          />
          <FAQItem
            question="Is my identity stored?"
            answer="No. Your identity is never revealed or stored on-chain. Only your anonymous session ID exists."
          />
          <FAQItem
            question="What if my report is rejected?"
            answer="If rejected, your stake is slashed. This discourages false reports."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-10 border-t-2 border-veil-ink">
        <BrutalCard className="text-center py-8 px-4">
          <h2 className="text-xl font-display font-bold text-veil-ink mb-3">
            Ready to report anonymously?
          </h2>
          <p className="text-sm text-veil-ink/60 mb-6">
            Start a secure session via WhatsApp in minutes.
          </p>
          <a
            href="https://wa.me/14155238886?text=REPORT"
            target="_blank"
            rel="noopener noreferrer"
          >
            <BrutalButton variant="accent" showArrow>
              <MessageSquare className="w-4 h-4" />
              Start on WhatsApp
            </BrutalButton>
          </a>
        </BrutalCard>
      </section>
    </div>
  );
}

function StepItem({ number, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 border-2 border-veil-ink rounded-xl flex items-center justify-center flex-shrink-0 text-veil-accent font-display font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-base font-display font-bold text-veil-ink mb-1">
          {title}
        </h3>
        <p className="text-sm text-veil-ink/60">{description}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`bg-white border-2 border-veil-ink rounded-xl overflow-hidden transition-all ${
        isOpen ? "shadow-brutal" : ""
      }`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="p-4 flex items-center justify-between cursor-pointer">
        <h3 className="font-display font-bold text-veil-ink text-sm pr-4">{question}</h3>
        <ChevronDown
          className={`w-5 h-5 text-veil-ink flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 border-t-2 border-veil-ink">
          <p className="text-sm text-veil-ink/60 pt-4">{answer}</p>
        </div>
      )}
    </div>
  );
}
