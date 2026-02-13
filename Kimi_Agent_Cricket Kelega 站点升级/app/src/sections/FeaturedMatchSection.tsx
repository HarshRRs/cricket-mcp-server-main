import { useEffect, useRef, useState } from 'react';
import { Eye, Calendar, MapPin } from 'lucide-react';

interface Fixture {
  id: number;
  date: string;
  time: string;
  team1: string;
  team2: string;
  venue: string;
  matchType: string;
  series: string;
}

export default function FeaturedMatchSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [match, setMatch] = useState<Fixture | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedMatch();
  }, []);

  const fetchFeaturedMatch = async () => {
    try {
      const response = await fetch('https://cricket-mcp-server-main-production.up.railway.app/schedule');
      const data = await response.json();

      if (data && data.length > 0) {
        const item = data[0]; // Get the first upcoming match
        const fixture: Fixture = {
          id: 0,
          date: item.date || 'TBA',
          time: 'TBA',
          team1: item.teams?.[0] || 'Team A',
          team2: item.teams?.[1] || 'Team B',
          venue: item.venue || 'TBA',
          matchType: 'ODI',
          series: item.name
        };
        setMatch(fixture);
      }
    } catch (error) {
      console.error('Failed to fetch featured match:', error);
    } finally {
      setLoading(false);
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
          { x: '60vw', opacity: 0, scale: 0.96 },
          { x: 0, opacity: 1, scale: 1, ease: 'none' },
          0
        );

        const headlines = card.querySelectorAll('.headline-line');
        tl.fromTo(
          headlines,
          { x: '18vw', opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.08, ease: 'none' },
          0
        );

        const content = card.querySelectorAll('.card-content');
        tl.fromTo(
          content,
          { y: '10vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
          0.1
        );

        // EXIT (70% - 100%)
        tl.to(card, {
          x: '-55vw',
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
  }, [loading]);

  if (!match && !loading) return null;

  return (
    <section
      ref={sectionRef}
      className="section-pinned flex items-center justify-end"
      style={{ zIndex: 30 }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/match_pakistan_england.jpg)',
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

      {/* Editorial Card */}
      <div
        ref={cardRef}
        className="relative z-10 mr-[6vw] w-[88vw] sm:w-[60vw] lg:w-[44vw] min-h-[64vh] glass rounded-lg p-6 sm:p-8 lg:p-10 flex flex-col justify-center"
      >
        {match ? (
          <>
            {/* Micro Label */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-mono tracking-[0.18em] text-white/70 uppercase">
                Featured Match
              </span>
            </div>

            {/* Headlines */}
            <div className="space-y-1 mb-8">
              <h2
                className="headline-line font-display font-bold text-white leading-none uppercase"
                style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
              >
                {match.team1}
              </h2>
              <h2
                className="headline-line font-display font-bold text-coral leading-none"
                style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
              >
                VS
              </h2>
              <h2
                className="headline-line font-display font-bold text-white leading-none uppercase"
                style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
              >
                {match.team2}
              </h2>
            </div>

            {/* Content */}
            <p className="card-content text-white/70 text-base lg:text-lg leading-relaxed mb-8 max-w-md">
              {match.series}. Catch the upcoming action between these two cricketing giants.
            </p>

            {/* Match Info */}
            <div className="card-content flex items-center gap-4 mb-8 p-4 bg-white/5 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-white/50 font-mono mb-1">
                  <Calendar className="w-3 h-3" /> DATE
                </div>
                <div className="text-white font-medium">{match.date}</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-white/50 font-mono mb-1">
                  <MapPin className="w-3 h-3" /> VENUE
                </div>
                <div className="text-white font-medium">{match.venue}</div>
              </div>
            </div>

            {/* CTA */}
            <button className="card-content btn-primary w-fit flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Match Preview
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </section>
  );
}
