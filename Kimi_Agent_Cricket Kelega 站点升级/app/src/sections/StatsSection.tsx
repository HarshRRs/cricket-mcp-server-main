import { useEffect, useRef } from 'react';
import { TrendingUp, Calendar, Download, ChevronRight } from 'lucide-react';

const topRunScorers = [
  { rank: 1, player: 'Virat Kohli', team: 'IND', runs: 847, sr: 98.5 },
  { rank: 2, player: 'Rohit Sharma', team: 'IND', runs: 712, sr: 105.2 },
  { rank: 3, player: 'Steve Smith', team: 'AUS', runs: 698, sr: 89.4 },
  { rank: 4, player: 'Babar Azam', team: 'PAK', runs: 654, sr: 92.1 },
  { rank: 5, player: 'Joe Root', team: 'ENG', runs: 621, sr: 87.8 },
];

const upcomingFixtures = [
  {
    teams: 'South Africa vs New Zealand',
    date: 'Today, 2:00 PM',
    venue: 'Centurion',
  },
  {
    teams: 'Sri Lanka vs Bangladesh',
    date: 'Tomorrow, 10:00 AM',
    venue: 'Colombo',
  },
  {
    teams: 'West Indies vs Ireland',
    date: 'Sat, 6:00 PM',
    venue: 'Bridgetown',
  },
  {
    teams: 'Afghanistan vs Zimbabwe',
    date: 'Sun, 3:00 PM',
    venue: 'Sharjah',
  },
];

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const setupAnimation = () => {
      if (typeof window !== 'undefined' && window.gsap) {
        const gsap = window.gsap;

        const statsTable = section.querySelector('.stats-table-container');
        const fixtureCards = section.querySelectorAll('.fixture-card');
        const ctaRow = section.querySelector('.cta-row');

        gsap.fromTo(
          statsTable,
          { x: '-6vw', opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        gsap.fromTo(
          fixtureCards,
          { x: '6vw', opacity: 0 },
          {
            x: 0,
            opacity: 1,
            stagger: 0.08,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        gsap.fromTo(
          ctaRow,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: ctaRow,
              start: 'top 90%',
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
    <section
      ref={sectionRef}
      id="stats"
      className="relative py-20 lg:py-28"
      style={{ zIndex: 70, backgroundColor: '#F6F7FB' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-navy mb-4" style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}>
            STATS <span className="text-coral">&</span> FIXTURES
          </h2>
          <p className="text-navy/60 max-w-xl mx-auto">
            Stay updated with the latest rankings and upcoming matches
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Stats Table */}
          <div className="stats-table-container">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-coral" />
              <h3 className="font-display font-semibold text-xl text-navy">
                TOP RUN SCORERS
              </h3>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-navy/5">
                    <th className="py-3 px-4 text-left text-xs font-mono text-navy/60 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-mono text-navy/60 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-mono text-navy/60 uppercase tracking-wider">
                      Runs
                    </th>
                    <th className="py-3 px-4 text-right text-xs font-mono text-navy/60 uppercase tracking-wider">
                      SR
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topRunScorers.map((player) => (
                    <tr
                      key={player.rank}
                      className="border-t border-gray-100 hover:bg-navy/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            player.rank === 1
                              ? 'bg-coral text-white'
                              : 'bg-navy/10 text-navy'
                          }`}
                        >
                          {player.rank}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-navy">
                            {player.player}
                          </span>
                          <span className="text-xs font-mono text-navy/50 px-2 py-0.5 bg-navy/5 rounded">
                            {player.team}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-semibold text-navy">
                        {player.runs}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-navy/70">
                        {player.sr}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fixtures */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-5 h-5 text-coral" />
              <h3 className="font-display font-semibold text-xl text-navy">
                UPCOMING FIXTURES
              </h3>
            </div>

            <div className="space-y-4">
              {upcomingFixtures.map((fixture, index) => (
                <div
                  key={index}
                  className="fixture-card bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-navy group-hover:text-coral transition-colors">
                        {fixture.teams}
                      </h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-navy/60">
                        <span className="font-mono">{fixture.date}</span>
                        <span className="w-1 h-1 rounded-full bg-navy/30" />
                        <span>{fixture.venue}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-navy/30 group-hover:text-coral group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Row */}
        <div className="cta-row flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <button className="flex items-center gap-2 px-6 py-3 bg-coral text-white rounded-lg font-medium hover:bg-coral-dark transition-colors">
            <TrendingUp className="w-4 h-4" />
            View Full Stats
          </button>
          <button className="flex items-center gap-2 px-6 py-3 border-2 border-navy/20 text-navy rounded-lg font-medium hover:border-coral hover:text-coral transition-colors">
            <Download className="w-4 h-4" />
            Download Fixtures
          </button>
        </div>
      </div>
    </section>
  );
}
