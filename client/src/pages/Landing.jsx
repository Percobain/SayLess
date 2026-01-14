import { Link } from 'react-router-dom';
import { Shield, User, Scale, MessageSquare, Lock, Zap, Eye, ArrowRight, Fingerprint, Database } from 'lucide-react';
import Layout from '../components/Layout';
import NeoCard from '../components/NeoCard';
import NeoButton from '../components/NeoButton';

const roleCards = [
  {
    title: 'Reporter',
    description: 'Submit anonymous crime reports with full encryption. Your identity is protected by cryptography.',
    icon: User,
    color: 'bg-neo-sage',
    path: '/reporter',
    number: '01',
  },
  {
    title: 'Authority',
    description: 'Review and verify encrypted reports. Decrypt content securely and take action.',
    icon: Shield,
    color: 'bg-neo-wheat',
    path: '/authority',
    number: '02',
  },
  {
    title: 'Jury',
    description: 'Participate in dispute resolution. Vote on contested reports using reputation-weighted governance.',
    icon: Scale,
    color: 'bg-neo-caramel',
    textLight: true,
    path: '/jury',
    number: '03',
  },
];

const stats = [
  { value: '100%', label: 'Anonymous' },
  { value: 'E2E', label: 'Encrypted' },
  { value: '24/7', label: 'Available' },
  { value: 'Zero', label: 'Data Stored' },
];

export default function Landing() {
  return (
    <Layout showAlert={true}>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-neo-cream">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-32 h-32 border-[4px] border-neo-dark rotate-12"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border-[4px] border-neo-sage -rotate-6"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-neo-sage"></div>
          <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-neo-wheat rotate-45"></div>
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 neo-badge-sage mb-6">
                <Lock className="w-4 h-4" />
                <span>End-to-End Encrypted</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-7xl md:text-9xl font-heading font-bold mb-4 leading-none text-neo-dark">
                SAY
                <span className="block text-neo-caramel relative">
                  LESS
                  <svg className="absolute -bottom-2 left-0 w-full h-4" viewBox="0 0 200 20">
                    <path d="M0 10 Q50 0, 100 10 T200 10" stroke="#D4A373" strokeWidth="4" fill="none"/>
                  </svg>
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-2xl md:text-3xl font-heading font-bold mb-4 text-neo-dark">
                Report Without Speaking
              </p>

              {/* Description */}
              <p className="text-lg text-neo-dark/70 mb-8 max-w-md">
                The anonymous crime reporting protocol. Your report is encrypted in your browser 
                before it ever leaves your device. <span className="font-bold text-neo-dark">Even we cannot read it.</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/reporter">
                  <NeoButton variant="caramel" size="lg">
                    <User className="w-5 h-5 mr-2" />
                    Start Reporting
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </NeoButton>
                </Link>
                <a 
                  href="https://wa.me/14155238886?text=REPORT" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <NeoButton variant="dark" size="lg">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    WhatsApp
                  </NeoButton>
                </a>
              </div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="relative hidden lg:block">
              {/* Stacked Cards Visual */}
              <div className="relative animate-float">
                {/* Back card */}
                <div className="absolute top-8 left-8 w-full h-80 bg-neo-dark border-[4px] border-neo-dark"></div>
                {/* Middle card */}
                <div className="absolute top-4 left-4 w-full h-80 bg-neo-sage border-[4px] border-neo-dark"></div>
                {/* Front card */}
                <div className="relative w-full h-80 bg-neo-wheat border-[4px] border-neo-dark p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-neo-dark flex items-center justify-center">
                        <Shield className="w-6 h-6 text-neo-cream" />
                      </div>
                      <span className="font-heading font-bold text-xl text-neo-dark">SECURE REPORT</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-neo-dark/20 w-full"></div>
                      <div className="h-4 bg-neo-dark/20 w-3/4"></div>
                      <div className="h-4 bg-neo-dark/20 w-5/6"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-neo-dark/60">****-****-****</span>
                    <div className="neo-badge-caramel">
                      <Lock className="w-3 h-3 mr-1" />
                      ENCRYPTED
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-neo-dark border-y-[4px] border-neo-dark">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x-[2px] divide-neo-caramel/30">
            {stats.map((stat, i) => (
              <div key={i} className="py-8 text-center">
                <p className="text-4xl md:text-5xl font-heading font-bold text-neo-caramel">{stat.value}</p>
                <p className="text-neo-cream/70 uppercase text-sm tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="py-16 md:py-24 bg-neo-mint">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="neo-badge-caramel mb-4">Choose Your Path</span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-neo-dark">
              Three Roles, One Mission
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {roleCards.map((role) => (
              <Link 
                key={role.title} 
                to={role.path}
                className={`
                  group relative border-[4px] border-neo-dark ${role.color} p-6 
                  transition-all duration-200 shadow-neo
                  hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none
                `}
              >
                {/* Number */}
                <span className={`absolute top-4 right-4 text-6xl font-heading font-bold opacity-20 ${role.textLight ? 'text-neo-cream' : 'text-neo-dark'}`}>
                  {role.number}
                </span>
                
                {/* Icon */}
                <div className={`
                  w-16 h-16 border-[3px] border-neo-dark flex items-center justify-center mb-6
                  ${role.textLight ? 'bg-neo-cream text-neo-dark' : 'bg-neo-dark text-neo-cream'}
                `}>
                  <role.icon className="w-8 h-8" />
                </div>

                {/* Content */}
                <h3 className={`text-2xl font-heading font-bold mb-2 ${role.textLight ? 'text-neo-cream' : 'text-neo-dark'}`}>
                  {role.title}
                </h3>
                <p className={`text-sm mb-4 ${role.textLight ? 'text-neo-cream/80' : 'text-neo-dark/70'}`}>
                  {role.description}
                </p>

                {/* Arrow */}
                <div className={`flex items-center gap-2 font-bold text-sm uppercase ${role.textLight ? 'text-neo-cream' : 'text-neo-dark'}`}>
                  Enter Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 border-t-[4px] border-neo-dark bg-neo-cream">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Left - Title */}
            <div className="md:w-1/3 md:sticky md:top-8">
              <span className="neo-badge-sage mb-4">Security First</span>
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-neo-dark">
                Built for Zero Trust
              </h2>
              <p className="text-neo-dark/70">
                Every layer of SAYLESS is designed with your privacy as the top priority.
              </p>
            </div>

            {/* Right - Feature Cards */}
            <div className="md:w-2/3 grid sm:grid-cols-2 gap-4">
              <NeoCard variant="wheat" className="p-6">
                <div className="w-14 h-14 bg-neo-caramel border-[3px] border-neo-dark flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7 text-neo-cream" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-2 text-neo-dark">Client-Side Encryption</h3>
                <p className="text-neo-dark/70 text-sm">
                  Reports are encrypted using NaCl cryptography in your browser before transmission.
                </p>
              </NeoCard>

              <NeoCard variant="sage" className="p-6">
                <div className="w-14 h-14 bg-neo-dark border-[3px] border-neo-dark flex items-center justify-center mb-4">
                  <Fingerprint className="w-7 h-7 text-neo-cream" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-2 text-neo-dark">Session-Based Identity</h3>
                <p className="text-neo-dark/70 text-sm">
                  No accounts, no logins. Each session generates a unique, untraceable identifier.
                </p>
              </NeoCard>

              <NeoCard variant="sage" className="p-6">
                <div className="w-14 h-14 bg-neo-caramel border-[3px] border-neo-dark flex items-center justify-center mb-4">
                  <Database className="w-7 h-7 text-neo-cream" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-2 text-neo-dark">IPFS + Blockchain</h3>
                <p className="text-neo-dark/70 text-sm">
                  Encrypted data stored on IPFS. Proof of existence recorded on Ethereum.
                </p>
              </NeoCard>

              <NeoCard variant="wheat" className="p-6">
                <div className="w-14 h-14 bg-neo-dark border-[3px] border-neo-dark flex items-center justify-center mb-4">
                  <Eye className="w-7 h-7 text-neo-cream" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-2 text-neo-dark">Authority-Only Decryption</h3>
                <p className="text-neo-dark/70 text-sm">
                  Only designated authorities hold the keys to decrypt submitted reports.
                </p>
              </NeoCard>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-neo-dark text-neo-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="neo-badge-caramel mb-4">Simple Process</span>
            <h2 className="text-4xl md:text-5xl font-heading font-bold">
              How It Works
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[4px] bg-neo-caramel transform md:-translate-x-1/2"></div>

              {/* Steps */}
              {[
                { step: 1, title: 'Send "REPORT" on WhatsApp', desc: 'Message our WhatsApp number. Receive a secure, one-time link instantly.' },
                { step: 2, title: 'Write Your Report', desc: 'Open the link. Describe the incident. Everything encrypts before leaving your device.' },
                { step: 3, title: 'Stored Securely', desc: 'Encrypted report goes to IPFS. Cryptographic proof recorded on Ethereum blockchain.' },
                { step: 4, title: 'Get Rewarded', desc: 'Verified reports earn ETH rewards to your anonymous wallet.' },
              ].map((item, i) => (
                <div key={item.step} className={`relative flex items-center gap-6 mb-12 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  {/* Step Number */}
                  <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-16 h-16 bg-neo-caramel border-[4px] border-neo-cream flex items-center justify-center z-10">
                    <span className="font-heading font-bold text-2xl text-neo-cream">{item.step}</span>
                  </div>

                  {/* Content */}
                  <div className={`ml-24 md:ml-0 md:w-[calc(50%-3rem)] ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <h3 className="text-xl font-heading font-bold mb-2 text-neo-caramel">{item.title}</h3>
                    <p className="text-neo-cream/70">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-neo-caramel border-t-[4px] border-neo-dark">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-neo-cream">
            Ready to Report?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-neo-cream/80">
            Your safety is our priority. Start your anonymous report now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/reporter">
              <NeoButton variant="dark" size="lg">
                <Shield className="w-5 h-5 mr-2" />
                Create Anonymous Report
              </NeoButton>
            </Link>
            <Link to="/authority">
              <NeoButton size="lg">
                Authority Login
              </NeoButton>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
