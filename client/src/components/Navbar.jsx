import { Link, useLocation } from 'react-router-dom';
import { Shield, User, Scale, Wallet, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { path: '/', label: 'Home', icon: null },
  { path: '/reporter', label: 'Reporter', icon: User },
  { path: '/authority', label: 'Authority', icon: Shield },
  { path: '/jury', label: 'Jury', icon: Scale },
  { path: '/wallet', label: 'Wallet', icon: Wallet },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-neo-cream border-b-[3px] border-neo-navy">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="neo-badge-orange">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-heading text-2xl font-bold tracking-tight text-neo-navy">
              SAY<span className="text-neo-orange">LESS</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    px-4 py-2 font-heading font-bold text-sm uppercase tracking-wide
                    border-[2px] border-neo-navy transition-all duration-150
                    ${isActive 
                      ? 'bg-neo-navy text-neo-cream' 
                      : 'bg-neo-cream text-neo-navy hover:bg-neo-orange hover:translate-x-[1px] hover:translate-y-[1px]'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden neo-btn p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-[3px] border-neo-navy py-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    block w-full px-4 py-3 font-heading font-bold text-sm uppercase tracking-wide
                    border-[3px] border-neo-navy transition-all duration-150
                    ${isActive 
                      ? 'bg-neo-navy text-neo-cream shadow-none' 
                      : 'bg-neo-cream text-neo-navy shadow-neo hover:bg-neo-orange'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
