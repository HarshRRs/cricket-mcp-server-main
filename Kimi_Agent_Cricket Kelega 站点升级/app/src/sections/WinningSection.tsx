import { useEffect, useRef } from 'react';
import { Play, Calendar } from 'lucide-react';

export default function WinningSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

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
        const headlines = content.querySelectorAll('.headline-line');
        tl.fromTo(
          headlines[0],
          { y: '60vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0
        );
        tl.fromTo(
          headlines[1],
          { y: '60vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.05
        );

        const otherContent = content.querySelectorAll('.other-content');
        tl.fromTo(
          otherContent,
          { y: '10vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.1
        );

        // EXIT (70% - 100%)
        tl.to(content, {
          scale: 1.08,
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

  return (
    <section
      ref={sectionRef}
      className="section-pinned flex items-center justify-center"
      style={{ zIndex: 60 }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/winning_celebration.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(11,29,58,0.4) 0%, rgba(11,29,58,0.7) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto"
      >
        {/* Headlines */}
        <div className="space-y-2 mb-8">
          <h2
            className="headline-line font-display font-bold text-white leading-none"
            style={{ fontSize: 'clamp(48px, 8vw, 100px)' }}
          >
            WINNING
          </h2>
          <h2
            className="headline-line font-display font-bold text-coral leading-none"
            style={{ fontSize: 'clamp(48px, 8vw, 100px)' }}
          >
            MOMENTS
          </h2>
        </div>

        {/* Subheadline */}
        <p className="other-content text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          From the final wicket to the trophy lift—experience every emotion as it
          happens.
        </p>

        {/* CTA Buttons */}
        <div className="other-content flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="btn-primary flex items-center gap-2 text-base">
            <Play className="w-5 h-5" fill="currentColor" />
            Watch Highlights
          </button>
          <button className="btn-outline flex items-center gap-2 text-base">
            <Calendar className="w-5 h-5" />
            See Fixtures
          </button>
        </div>
      </div>
    </section>
  );
}
