import { useEffect, useRef, useState } from 'react';
import { Radio } from 'lucide-react';

interface Match {
  id: number;
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  overs: string;
  status: 'live' | 'upcoming' | 'completed';
  venue: string;
}

export default function LiveMatchSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveMatch();
  }, []);

  const fetchLiveMatch = async () => {
    try {
      const response = await fetch('https://cricket-mcp-server-main-production.up.railway.app/live');
      const data = await response.json();

      // Transform and find the best match to show (Live > Recent)
      const matches = data.map((m: any) => ({
        id: m.id,
        team1: m.teams[0],
        team2: m.teams[1],
        score1: m.score?.[0]?.r ? `${m.score[0].r}/${m.score[0].w}` : '0/0',
        score2: m.score?.[1]?.r ? `${m.score[1].r}/${m.score[1].w}` : '0/0',
        overs: m.score?.[0]?.o || m.score?.[1]?.o || '0.0',
        status: m.status.toLowerCase().includes('live') ? 'live' : 'completed',
        venue: m.venue
      }));

      const liveMatch = matches.find((m: any) => m.status === 'live');
      const recentMatch = matches[0]; // Fallback to first available if no live match

      setMatch(liveMatch || recentMatch || null);
    } catch (error) {
      console.error('Failed to fetch live match:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card) return;

    // Wait for GSAP to be available
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

        // Headline lines stagger
        const headlines = card.querySelectorAll('.headline-line');
        tl.fromTo(
          headlines,
          { x: '-20vw', opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.08, ease: 'none' },
          0
        );

        // Paragraph + CTA
        const content = card.querySelectorAll('.card-content');
        tl.fromTo(
          content,
          { y: '10vh', opacity: 0 },
          { y: 0, opacity: 1, ease: 'none' },
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
  }, [loading]); // Re-run animation setup when loading finishes/match renders

  if (!match && !loading) return null;

  return (
    <section
      ref={sectionRef}
      id="live"
      className="section-pinned flex items-center"
      style={{ zIndex: 20 }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/match_india_australia.jpg)',
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
        {match ? (
          <>
            {/* Micro Label */}
            <div className="flex items-center gap-2 mb-6">
              <span className={`w-2 h-2 rounded-full ${match.status === 'live' ? 'bg-coral live-dot' : 'bg-white/50'}`} />
              <span className="text-xs font-mono tracking-[0.18em] text-white/70 uppercase">
                {match.status === 'live' ? 'Live Match' : 'Recent Match'}
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
              {match.status === 'live'
                ? `Catch the live action from ${match.venue}. ${match.team1} takes on ${match.team2} in this thrilling encounter.`
                : `Match completed at ${match.venue}. Check out the final score and highlights.`}
            </p>

            {/* Score */}
            <div className="card-content flex items-center gap-6 mb-8 p-4 bg-white/5 rounded-lg">
              <div className="text-center">
                <div className="font-display font-bold text-2xl lg:text-3xl text-white">{match.team1.slice(0, 3).toUpperCase()}</div>
                <div className={`font-mono text-lg ${match.status === 'live' ? 'text-coral' : 'text-white'}`}>{match.score1}</div>
              </div>
              <div className="text-white/50 font-mono text-sm">vs</div>
              <div className="text-center">
                <div className="font-display font-bold text-2xl lg:text-3xl text-white">{match.team2.slice(0, 3).toUpperCase()}</div>
                <div className="font-mono text-white/60 text-lg">{match.score2}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs text-white/50 font-mono">OVERS</div>
                <div className="font-mono text-white">{match.overs}</div>
              </div>
            </div>

            {/* CTA */}
            <button className="card-content btn-primary w-fit flex items-center gap-2">
              <Radio className="w-4 h-4" />
              {match.status === 'live' ? 'Follow Live' : 'View Summary'}
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
