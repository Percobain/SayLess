import { Shield, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-neo-dark text-neo-cream border-t-[3px] border-neo-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-neo-caramel border-[2px] border-neo-cream p-1.5">
                <Shield className="w-5 h-5 text-neo-cream" />
              </div>
              <span className="font-heading text-xl font-bold">
                SAY<span className="text-neo-caramel">LESS</span>
              </span>
            </div>
            <p className="text-neo-cream/60 text-sm">
              Anonymous crime reporting protocol. Your reports are encrypted and cannot be traced back to you.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-bold text-neo-caramel mb-4 uppercase">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/reporter" className="hover:text-neo-caramel transition-colors">
                  → Start Reporting
                </Link>
              </li>
              <li>
                <Link to="/authority" className="hover:text-neo-caramel transition-colors">
                  → Authority Dashboard
                </Link>
              </li>
              <li>
                <Link to="/reputation" className="hover:text-neo-caramel transition-colors">
                  → Check Reputation
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="font-heading font-bold text-neo-caramel mb-4 uppercase">Disclaimer</h4>
            <p className="text-neo-cream/60 text-sm">
              This is a frontend-only demo for Project VEIL. No actual blockchain transactions or data storage occurs.
              All data is mocked using local state.
            </p>
          </div>
        </div>

        <div className="neo-divider bg-neo-caramel/30 my-8"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neo-cream/50 text-sm">
            © 2026 SAYLESS Protocol • Built for Project VEIL
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-neo-cream/50 hover:text-neo-caramel transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-neo-cream/50 hover:text-neo-caramel transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
