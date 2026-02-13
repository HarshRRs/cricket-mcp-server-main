import { useEffect, useRef } from 'react';
import { Play, Calendar } from 'lucide-react';

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-play entrance animation on load
    // Background entrance
    if (bgRef.current) {
      bgRef.current.style.opacity = '0';
      bgRef.current.style.transform = 'scale(1.06)';
      setTimeout(() => {
        if (bgRef.current) {
          bgRef.current.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
          bgRef.current.style.opacity = '1';
          bgRef.current.style.transform = 'scale(1)';
        }
      }, 100);
    }

    // Headline entrance
    if (headlineRef.current) {
      const words = headlineRef.current.querySelectorAll('.word');
      words.forEach((word, i) => {
        (word as HTMLElement).style.opacity = '0';
        (word as HTMLElement).style.transform = 'translateY(40px)';
        setTimeout(() => {
          (word as HTMLElement).style.transition = 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
          (word as HTMLElement).style.opacity = '1';
          (word as HTMLElement).style.transform = 'translateY(0)';
        }, 200 + i * 60);
      });
    }

    // Subheadline entrance
    if (subheadRef.current) {
      subheadRef.current.style.opacity = '0';
      subheadRef.current.style.transform = 'translateY(18px)';
      setTimeout(() => {
        if (subheadRef.current) {
          subheadRef.current.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
          subheadRef.current.style.opacity = '1';
          subheadRef.current.style.transform = 'translateY(0)';
        }
      }, 500);
    }

    // CTA entrance
    if (ctaRef.current) {
      ctaRef.current.style.opacity = '0';
      ctaRef.current.style.transform = 'translateY(14px) scale(0.98)';
      setTimeout(() => {
        if (ctaRef.current) {
          ctaRef.current.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
          ctaRef.current.style.opacity = '1';
          ctaRef.current.style.transform = 'translateY(0) scale(1)';
        }
      }, 650);
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-pinned flex items-center justify-center"
      style={{ zIndex: 10 }}
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/hero_crowd.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(11,29,58,0.35) 0%, rgba(11,29,58,0.75) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Micro Label */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-mono tracking-widest text-white/85">
            <span className="w-2 h-2 rounded-full bg-coral live-dot" />
            LIVE MATCH CENTER
          </span>
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="font-display font-bold text-white mb-6 leading-none"
          style={{ fontSize: 'clamp(48px, 10vw, 120px)' }}
        >
          <span className="word inline-block">CRICKET</span>{' '}
          <span className="word inline-block text-coral">KHELEGA</span>
        </h1>

        {/* Subheadline */}
        <p
          ref={subheadRef}
          className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Live scores, highlights, and fixtures—built for fans who breathe cricket.
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="btn-primary flex items-center gap-2 text-base">
            <Play className="w-5 h-5" fill="currentColor" />
            Watch Live
          </button>
          <button className="btn-outline flex items-center gap-2 text-base">
            <Calendar className="w-5 h-5" />
            View Fixtures
          </button>
        </div>
      </div>
    </section>
  );
}
