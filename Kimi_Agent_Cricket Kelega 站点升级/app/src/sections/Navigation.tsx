import { useState, useEffect } from 'react';
import { Menu, X, Search, Bell } from 'lucide-react';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Live Scores', href: '#live-scores' },
    { name: 'Fixtures', href: '#fixtures' },
    { name: 'Stats', href: '#stats' },
    { name: 'Teams', href: '#teams' },
    { name: 'News', href: '#news' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
        isScrolled
          ? 'bg-navy/95 backdrop-blur-md border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo - BIGGER */}
          <a href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Cricket Kelega"
              className="h-14 sm:h-16 w-auto object-contain"
            />
            <span className="font-display font-bold text-lg sm:text-xl tracking-wide hidden sm:block">
              CRICKET <span className="text-coral">KHELEGA</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-white/80 hover:text-coral transition-colors duration-300 uppercase tracking-wider"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 text-white/80 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <a 
              href="#alerts"
              className="hidden sm:flex items-center gap-2 btn-primary text-sm"
            >
              <Bell className="w-4 h-4" />
              <span>Get Alerts</span>
            </a>
            <button
              className="lg:hidden p-2 text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-navy/98 backdrop-blur-lg border-t border-white/10">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block text-lg font-medium text-white/80 hover:text-coral transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a 
              href="#alerts"
              className="w-full btn-primary mt-4 flex items-center justify-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Bell className="w-4 h-4" />
              <span>Get Alerts</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
