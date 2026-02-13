import { useEffect, useRef, useState } from 'react';
import { Mail, Bell, Check } from 'lucide-react';

export default function NewsletterSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const form = formRef.current;
    if (!section || !headline || !form) return;

    const setupAnimation = () => {
      if (typeof window !== 'undefined' && window.gsap) {
        const gsap = window.gsap;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=120%',
            pin: true,
            scrub: 0.6,
          },
        });

        // ENTRANCE (0% - 30%)
        tl.fromTo(
          headline,
          { x: '-40vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0
        );

        tl.fromTo(
          form,
          { x: '40vw', opacity: 0, scale: 0.98 },
          { x: 0, opacity: 1, scale: 1, ease: 'none' },
          0
        );

        const formFields = form.querySelectorAll('.form-field');
        tl.fromTo(
          formFields,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, ease: 'none' },
          0.1
        );

        // EXIT (70% - 100%)
        tl.to([headline, form], {
          opacity: 0,
          ease: 'power2.in',
        }, 0.7);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="section-pinned flex items-center"
      style={{ zIndex: 80 }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/newsletter_texture.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-navy/90" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Headline */}
          <div ref={headlineRef}>
            <h2
              className="font-display font-bold text-white mb-6"
              style={{ fontSize: 'clamp(40px, 5vw, 72px)' }}
            >
              ALWAYS <span className="text-coral">ON</span>
            </h2>
            <p className="text-lg text-white/70 leading-relaxed max-w-md">
              Get match alerts, highlights, and exclusive features—delivered to
              your inbox. Never miss a moment of the action.
            </p>
          </div>

          {/* Form Card */}
          <div
            ref={formRef}
            className="glass-light rounded-xl p-6 sm:p-8"
          >
            {isSubscribed ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-coral/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-coral" />
                </div>
                <h3 className="font-display font-semibold text-2xl text-white mb-2">
                  You&apos;re Subscribed!
                </h3>
                <p className="text-white/60">
                  Get ready for match alerts and highlights.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-field mb-6">
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-coral transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="form-field flex items-start gap-3 mb-6">
                  <input
                    type="checkbox"
                    id="alerts"
                    className="mt-1 w-4 h-4 rounded border-white/30 bg-white/5 text-coral focus:ring-coral"
                    defaultChecked
                  />
                  <label htmlFor="alerts" className="text-sm text-white/70">
                    Send me match alerts and notifications
                  </label>
                </div>

                <button
                  type="submit"
                  className="form-field w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Subscribe
                </button>

                <p className="form-field text-xs text-white/40 text-center mt-4">
                  Unsubscribe anytime. No spam.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
