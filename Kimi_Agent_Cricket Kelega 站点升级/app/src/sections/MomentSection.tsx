import { useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

export default function MomentSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    const label = labelRef.current;
    if (!section || !card) return;

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
        if (label) {
          tl.fromTo(
            label,
            { x: '-10vw', opacity: 0 },
            { x: 0, opacity: 1, ease: 'none' },
            0
          );
        }

        tl.fromTo(
          card,
          { x: '60vw', opacity: 0, scale: 0.96 },
          { x: 0, opacity: 1, scale: 1, ease: 'none' },
          0
        );

        const headlines = card.querySelectorAll('.headline-line');
        tl.fromTo(
          headlines,
          { y: '10vh', opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.07, ease: 'none' },
          0.05
        );

        // EXIT (70% - 100%)
        tl.to(card, {
          y: '-40vh',
          opacity: 0,
          ease: 'power2.in',
        }, 0.7);

        if (label) {
          tl.to(label, {
            opacity: 0,
            ease: 'power2.in',
          }, 0.75);
        }

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
      className="section-pinned flex items-center justify-end"
      style={{ zIndex: 40 }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/moment_catch.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(270deg, rgba(11,29,58,0.9) 0%, rgba(11,29,58,0.5) 60%, rgba(11,29,58,0.3) 100%)',
          }}
        />
      </div>

      {/* Vertical Label */}
      <div
        ref={labelRef}
        className="absolute left-[3.2vw] top-1/2 -translate-y-1/2 hidden lg:block"
        style={{ transform: 'translateY(-50%) rotate(-90deg)' }}
      >
        <span className="text-xs font-mono tracking-[0.25em] text-white/50 uppercase whitespace-nowrap">
          Match Moments
        </span>
      </div>

      {/* Editorial Card */}
      <div
        ref={cardRef}
        className="relative z-10 mr-[6vw] w-[88vw] sm:w-[60vw] lg:w-[44vw] min-h-[64vh] glass rounded-lg p-6 sm:p-8 lg:p-10 flex flex-col justify-center"
      >
        {/* Headlines */}
        <div className="space-y-1 mb-8">
          <h2
            className="headline-line font-display font-bold text-white leading-none"
            style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
          >
            CATCH
          </h2>
          <h2
            className="headline-line font-display font-bold text-white leading-none"
            style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
          >
            OF THE
          </h2>
          <h2
            className="headline-line font-display font-bold text-coral leading-none"
            style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
          >
            MATCH
          </h2>
        </div>

        {/* Content */}
        <p className="card-content text-white/70 text-base lg:text-lg leading-relaxed mb-8 max-w-md">
          A game-changing grab under pressure. Relive the moment that turned the
          innings and shifted momentum.
        </p>

        {/* Video Thumbnail */}
        <div className="card-content relative mb-8 rounded-lg overflow-hidden group cursor-pointer">
          <img
            src="/moment_catch.jpg"
            alt="Catch Replay"
            className="w-full h-32 object-cover opacity-60 group-hover:opacity-80 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-coral/90 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
            </div>
          </div>
          <div className="absolute bottom-2 left-3 text-xs font-mono text-white/70">
            0:42
          </div>
        </div>

        {/* CTA */}
        <button className="card-content btn-primary w-fit flex items-center gap-2">
          <Play className="w-4 h-4" fill="currentColor" />
          Watch Replay
        </button>
      </div>
    </section>
  );
}
