import { Link, useLocation } from "react-router-dom";
import { Shield, FileText, LayoutDashboard, UserCog, Menu, X } from "lucide-react";
import { useState } from "react";

/**
 * AppShell - Root layout wrapper with Neo-Brutalist header and footer
 * Fully responsive with mobile navigation
 */
export function AppShell({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Home", icon: Shield },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/authority", label: "Authority", icon: UserCog },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-veil-bg flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-2 border-veil-ink sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-veil-ink rounded-lg sm:rounded-brutal flex items-center justify-center shadow-brutal-sm transition-transform duration-200 group-hover:-translate-y-0.5">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-display font-bold text-veil-ink tracking-tight">
                Veil
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 lg:px-4 py-2 text-sm font-semibold rounded-brutal transition-all duration-200 flex items-center gap-2 ${
                    isActive(path)
                      ? "bg-veil-ink text-white"
                      : "text-veil-ink hover:bg-veil-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Status Badge - Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="brutal-badge-accent text-xs">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                Frontend Demo
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-veil-ink hover:bg-veil-muted rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-2 border-t-2 border-veil-muted pt-4 animate-fade-in">
              <div className="flex flex-col gap-2">
                {navLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 text-sm font-semibold rounded-brutal transition-all duration-200 flex items-center gap-3 ${
                      isActive(path)
                        ? "bg-veil-ink text-white"
                        : "text-veil-ink hover:bg-veil-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <div className="brutal-badge-accent text-xs">
                  <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  Frontend Demo
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-veil-ink mt-auto">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-veil-accent" />
              <span className="font-display font-bold text-veil-ink text-sm sm:text-base">
                Veil Protocol
              </span>
              <span className="text-veil-ink/40 hidden sm:inline">—</span>
              <span className="text-veil-ink/60 text-xs sm:text-sm hidden sm:inline">Demo UI</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs sm:text-sm text-veil-ink/60">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-veil-success rounded-full" />
                No data leaves this browser
              </span>
              <span className="brutal-badge text-xs">v0.1</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppShell;
