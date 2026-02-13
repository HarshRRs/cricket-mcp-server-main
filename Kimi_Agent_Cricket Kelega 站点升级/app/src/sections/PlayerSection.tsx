import { useEffect, useRef } from 'react';
import { User } from 'lucide-react';

export default function PlayerSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card) return;

    const setupAnimation = () => {
      if (typeof window !== 'undefined' && window.gsap) {
        const gsap = window.gsap;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=130%',
            pin: true,
            scrub: 0.6,
          },
        });

        // ENTRANCE (0% - 30%)
        tl.fromTo(
          card,
          { x: '-60vw', opacity: 0, scale: 0.96 },
          { x: 0, opacity: 1, scale: 1, ease: 'none' },
          0
        );

        const headlines = card.querySelectorAll('.headline-line');
        tl.fromTo(
          headlines,
          { x: '-18vw', opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.08, ease: 'none' },
          0
        );

        const stats = card.querySelectorAll('.stat-item');
        tl.fromTo(
          stats,
          { y: '8vh', opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, ease: 'none' },
          0.1
        );

        // EXIT (70% - 100%)
        tl.to(card, {
          x: '55vw',
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
      className="section-pinned flex items-center"
      style={{ zIndex: 50 }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/player_spotlight.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(11,29,58,0.9) 0%, rgba(11,29,58,0.5) 60%, rgba(11,29,58,0.3) 100%)',
          }}
        />
      </div>

      {/* Editorial Card */}
      <div
        ref={cardRef}
        className="relative z-10 ml-[6vw] w-[88vw] sm:w-[60vw] lg:w-[44vw] min-h-[64vh] glass rounded-lg p-6 sm:p-8 lg:p-10 flex flex-col justify-center"
      >
        {/* Micro Label */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-mono tracking-[0.18em] text-white/70 uppercase">
            Player of the Match
          </span>
        </div>

        {/* Headlines */}
        <div className="space-y-1 mb-8">
          <h2
            className="headline-line font-display font-bold text-white leading-none"
            style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
          >
            VIRAT
          </h2>
          <h2
            className="headline-line font-display font-bold text-coral leading-none"
            style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
          >
            KOHLI
          </h2>
        </div>

        {/* Content */}
        <p className="card-content text-white/70 text-base lg:text-lg leading-relaxed mb-8 max-w-md">
          A masterclass in chasing—composed, clinical, and relentless under pressure.
        </p>

        {/* Stats */}
        <div className="card-content grid grid-cols-3 gap-4 mb-8">
          <div className="stat-item text-center p-4 bg-white/5 rounded-lg">
            <div className="text-xs text-white/50 font-mono mb-1">RUNS</div>
            <div className="font-display font-bold text-2xl lg:text-3xl text-white">
              112<span className="text-coral text-lg">*</span>
            </div>
          </div>
          <div className="stat-item text-center p-4 bg-white/5 rounded-lg">
            <div className="text-xs text-white/50 font-mono mb-1">BALLS</div>
            <div className="font-display font-bold text-2xl lg:text-3xl text-white">
              98
            </div>
          </div>
          <div className="stat-item text-center p-4 bg-white/5 rounded-lg">
            <div className="text-xs text-white/50 font-mono mb-1">4s/6s</div>
            <div className="font-display font-bold text-2xl lg:text-3xl text-coral">
              9/3
            </div>
          </div>
        </div>

        {/* CTA */}
        <button className="card-content btn-primary w-fit flex items-center gap-2">
          <User className="w-4 h-4" />
          View Profile
        </button>
      </div>
    </section>
  );
}
