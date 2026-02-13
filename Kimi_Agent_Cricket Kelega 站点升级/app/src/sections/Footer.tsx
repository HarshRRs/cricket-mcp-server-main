import { useEffect, useRef } from 'react';
import { Twitter, Instagram, Youtube, Facebook } from 'lucide-react';

const footerLinks = {
  matches: [
    { name: 'Live Scores', href: '#live' },
    { name: 'Fixtures', href: '#fixtures' },
    { name: 'Results', href: '#results' },
    { name: 'Highlights', href: '#highlights' },
  ],
  explore: [
    { name: 'Stats', href: '#stats' },
    { name: 'Teams', href: '#teams' },
    { name: 'Players', href: '#players' },
    { name: 'Rankings', href: '#rankings' },
  ],
  company: [
    { name: 'About Us', href: '#about' },
    { name: 'Careers', href: '#careers' },
    { name: 'Contact', href: '#contact' },
    { name: 'Press', href: '#press' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' },
    { name: 'Cookie Policy', href: '#cookies' },
  ],
};

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'YouTube', icon: Youtube, href: '#' },
  { name: 'Facebook', icon: Facebook, href: '#' },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const setupAnimation = () => {
      if (typeof window !== 'undefined' && window.gsap) {
        const gsap = window.gsap;

        const columns = footer.querySelectorAll('.footer-column');
        const socials = footer.querySelectorAll('.social-icon');

        gsap.fromTo(
          columns,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: footer,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        gsap.fromTo(
          socials,
          { scale: 0.96, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            stagger: 0.05,
            duration: 0.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: footer,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        return true;
      }
      return false;
    };

    if (!setupAnimation()) {
      const interval = setInterval(() => {
        if (setupAnimation()) {
          clearInterval(interval);
        }
      }, 100);
      setTimeout(() => clearInterval(interval), 5000);
    }
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative py-16 lg:py-20"
      style={{ zIndex: 90, backgroundColor: '#08152B' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-3 lg:col-span-2 footer-column">
              <a href="#" className="flex items-center gap-3 mb-4">
                <img
                  src="/logo.png"
                  alt="Cricket Khelega"
                  className="h-12 w-auto object-contain"
                />
              </a>
              <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-6">
                Cricket Khelega — Built for fans who live and breathe cricket. Live
                scores, highlights, and exclusive content.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="social-icon w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-coral hover:text-white transition-all"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Matches */}
            <div className="footer-column">
              <h4 className="font-display font-semibold text-white mb-4 uppercase tracking-wider text-sm">
                Matches
              </h4>
              <ul className="space-y-3">
                {footerLinks.matches.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-coral transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Explore */}
            <div className="footer-column">
              <h4 className="font-display font-semibold text-white mb-4 uppercase tracking-wider text-sm">
                Explore
              </h4>
              <ul className="space-y-3">
                {footerLinks.explore.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-coral transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="footer-column">
              <h4 className="font-display font-semibold text-white mb-4 uppercase tracking-wider text-sm">
                Company
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-coral transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="footer-column">
              <h4 className="font-display font-semibold text-white mb-4 uppercase tracking-wider text-sm">
                Legal
              </h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-coral transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              &copy; {new Date().getFullYear()} Cricket Khelega. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#privacy"
                className="text-sm text-white/40 hover:text-white transition-colors"
              >
                Privacy
              </a>
              <a
                href="#terms"
                className="text-sm text-white/40 hover:text-white transition-colors"
              >
                Terms
              </a>
              <a
                href="#cookies"
                className="text-sm text-white/40 hover:text-white transition-colors"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
