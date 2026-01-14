import { Link } from 'react-router-dom';
import { Shield, User, Scale, MessageSquare, Lock, Zap, Eye } from 'lucide-react';
import Layout from '../components/Layout';
import NeoCard from '../components/NeoCard';
import NeoButton from '../components/NeoButton';

const roleCards = [
  {
    title: 'Reporter',
    description: 'Submit anonymous crime reports with full encryption. Your identity is protected by cryptography.',
    icon: User,
    path: '/reporter',
    variant: 'orange',
    buttonText: 'Start Reporting',
  },
  {
    title: 'Authority',
    description: 'Review and verify encrypted reports. Decrypt content securely and take action.',
    icon: Shield,
    path: '/authority',
    variant: 'green',
    buttonText: 'View Dashboard',
  },
  {
    title: 'Jury',
    description: 'Participate in dispute resolution. Vote on contested reports using reputation-weighted governance.',
    icon: Scale,
    path: '/jury',
    variant: 'purple',
    buttonText: 'Join Jury',
  },
];

const features = [
  {
    icon: Lock,
    title: 'End-to-End Encrypted',
    description: 'Reports encrypted in your browser using NaCl cryptography. Only authorities can decrypt.',
  },
  {
    icon: Zap,
    title: 'Blockchain Verified',
    description: 'Every report creates an immutable record on Ethereum. Tamper-proof and permanent.',
  },
  {
    icon: Eye,
    title: 'True Anonymity',
    description: 'No personal data stored. Session-based identity. Even we cannot link reports to you.',
  },
];

export default function Landing() {
  return (
    <Layout showAlert={true}>
      {/* Hero Section */}
      <section className="bg-neo-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-block neo-badge-green mb-6">
              <Shield className="w-4 h-4" />
              <span>Anonymous & Encrypted</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-8xl font-heading font-bold mb-6 tracking-tight">
              SAY<span className="text-neo-orange">LESS</span>
            </h1>

            {/* Tagline */}
            <p className="text-2xl md:text-3xl font-heading font-bold mb-4">
              Report Without Speaking
            </p>

            {/* Description */}
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
              Anonymous crime reporting via WhatsApp, SMS, or Web. Your report is encrypted 
              before it leaves your device. Even we cannot read it.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/reporter">
                <NeoButton variant="orange" size="lg">
                  <User className="w-5 h-5 mr-2" />
                  Start Reporting
                </NeoButton>
              </Link>
              <a 
                href="https://wa.me/14155238886?text=REPORT" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <NeoButton variant="green" size="lg">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Report via WhatsApp
                </NeoButton>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="neo-divider"></div>

      {/* Role Cards */}
      <section className="bg-gray-100 py-16 md:py-24 border-y-[3px] border-neo-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">
            Choose Your Role
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
            SAYLESS has three distinct roles in the anonymous reporting ecosystem
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {roleCards.map((role) => (
              <NeoCard 
                key={role.title} 
                variant={role.variant}
                hover
                className="p-6"
              >
                <div className={`
                  w-14 h-14 border-[3px] border-neo-black flex items-center justify-center mb-4
                  ${role.variant === 'purple' ? 'bg-neo-white text-neo-black' : 'bg-neo-black text-neo-white'}
                `}>
                  <role.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-3">{role.title}</h3>
                <p className={`mb-6 ${role.variant === 'purple' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {role.description}
                </p>
                <Link to={role.path}>
                  <NeoButton variant="black" size="sm" className="w-full">
                    {role.buttonText} →
                  </NeoButton>
                </Link>
              </NeoCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-neo-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">
            Why SAYLESS?
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => (
              <NeoCard key={feature.title} className="p-6">
                <div className="w-12 h-12 bg-neo-orange border-[3px] border-neo-black flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-neo-black" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </NeoCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-neo-black text-neo-white py-16 md:py-24 border-y-[3px] border-neo-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { step: 1, title: 'Text "REPORT" on WhatsApp', desc: 'Send a message to our WhatsApp number. You\'ll receive a secure, one-time link.' },
              { step: 2, title: 'Write Your Report', desc: 'Open the link in your browser. Describe the incident. Your text is encrypted before it ever leaves your device.' },
              { step: 3, title: 'Stored Securely', desc: 'Encrypted report is stored on IPFS. A cryptographic proof is recorded on Ethereum.' },
              { step: 4, title: 'Get Rewarded', desc: 'If your report is verified, you receive ETH rewards to your anonymous wallet.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-6">
                <div className="w-12 h-12 bg-neo-orange border-[3px] border-neo-white flex items-center justify-center flex-shrink-0">
                  <span className="font-heading font-bold text-xl">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-xl font-heading font-bold mb-1">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
