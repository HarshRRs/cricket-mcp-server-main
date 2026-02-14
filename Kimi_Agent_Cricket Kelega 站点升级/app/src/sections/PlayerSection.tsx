import { useEffect, useRef, useState } from 'react';
import { User } from 'lucide-react';

interface PlayerProfile {
  name: string;
  rank: number;
  rating: string;
}

export default function PlayerSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    fetchTopPlayer();
  }, []);

  const fetchTopPlayer = async () => {
    try {
      const response = await fetch('https://cricket-mcp-server-main-production.up.railway.app/rankings');
      const data = await response.json();

      const batsmen = data.find((curr: any) => curr.type === 'ICC Batting Rankings' && curr.format === 'ODI');
      if (batsmen && batsmen.rank && batsmen.rank.length > 0) {
        const top = batsmen.rank[0];
        setPlayer({
          name: top.player,
          rank: 1,
          rating: top.rating
        });
      }
    } catch (e) {
      console.error('Failed to fetch player', e);
    }
  };

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
  }, [player]);

  if (!player) return null; // Or skeleton

  // Split name for display
  const nameParts = player.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

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
            ICC #1 Batsman (ODI)
          </span>
        </div>

        {/* Headlines */}
        <div className="space-y-1 mb-8">
          <h2
            className="headline-line font-display font-bold text-white leading-none uppercase"
            style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
          >
            {firstName}
          </h2>
          {lastName && (
            <h2
              className="headline-line font-display font-bold text-coral leading-none uppercase"
              style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
            >
              {lastName}
            </h2>
          )}
        </div>

        {/* Content */}
        <p className="card-content text-white/70 text-base lg:text-lg leading-relaxed mb-8 max-w-md">
          Currently topping the global charts. A force to be reckoned with.
        </p>

        {/* Stats */}
        <div className="card-content grid grid-cols-2 gap-4 mb-8">
          <div className="stat-item text-center p-4 bg-white/5 rounded-lg">
            <div className="text-xs text-white/50 font-mono mb-1">RANK</div>
            <div className="font-display font-bold text-2xl lg:text-3xl text-white">
              #{player.rank}
            </div>
          </div>
          <div className="stat-item text-center p-4 bg-white/5 rounded-lg">
            <div className="text-xs text-white/50 font-mono mb-1">RATING</div>
            <div className="font-display font-bold text-2xl lg:text-3xl text-coral">
              {player.rating}
            </div>
          </div>
        </div>

        {/* CTA */}
        <button className="card-content btn-primary w-fit flex items-center gap-2">
          <User className="w-4 h-4" />
          View Rankings
        </button>
      </div>
    </section>
  );
}
