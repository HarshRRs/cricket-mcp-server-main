import { useEffect, useState } from 'react';
import { Radio, Trophy, TrendingUp, Calendar } from 'lucide-react';
import Navigation from '../sections/Navigation';
import Footer from '../sections/Footer';

interface Match {
  id: number;
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  overs: string;
  status: 'live' | 'upcoming' | 'completed';
  matchType: string;
  venue: string;
}

// Live and Recent matches will be fetched from API

export default function LiveScores() {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'recent'>('live');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchLiveMatches();
  }, []);

  const fetchLiveMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://cricket-mcp-server-main-production.up.railway.app/live');
      const data = await response.json();

      // Transform backend data to frontend Match interface
      const transformed = data.map((m: any): Match => ({
        id: m.id,
        team1: m.teams[0],
        team2: m.teams[1],
        score1: m.score?.[0]?.r ? `${m.score[0].r}/${m.score[0].w}` : '-',
        score2: m.score?.[1]?.r ? `${m.score[1].r}/${m.score[1].w}` : '-',
        overs: m.score?.[0]?.o || m.score?.[1]?.o || '-',
        status: m.status.toLowerCase().includes('live') ? 'live' : 'completed',
        matchType: 'International', // Generic as free API is limited
        venue: m.venue
      }));

      setMatches(transformed);
    } catch (error) {
      console.error('Failed to fetch live matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatches = () => {
    // For now, using filtered results from the single live/recent endpoint
    if (activeTab === 'live') return matches.filter((m: Match) => m.status === 'live');
    if (activeTab === 'recent') return matches.filter((m: Match) => m.status === 'completed');
    return []; // Upcoming will be handled by Fixtures or separate endpoint
  };

  if (loading) {
    return (
      <div className="relative bg-navy min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative bg-navy min-h-screen">
      <div className="grain-overlay" />
      <Navigation />

      <main className="pt-20 lg:pt-24 pb-16">
        {/* Header */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-display font-bold text-white text-3xl sm:text-4xl lg:text-5xl mb-2">
                  LIVE <span className="text-coral">SCORES</span>
                </h1>
                <p className="text-white/60">Real-time match updates from around the world</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-coral live-dot" />
                <span className="text-sm text-white/70 font-mono">{matches.filter((m: Match) => m.status === 'live').length} MATCHES LIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-2 sm:gap-4 border-b border-white/10">
              {(['live', 'upcoming', 'recent'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium uppercase tracking-wider transition-colors relative ${activeTab === tab ? 'text-coral' : 'text-white/60 hover:text-white'
                    }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-coral" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              {getMatches().map((match) => (
                <div
                  key={match.id}
                  className="glass rounded-xl p-4 sm:p-6 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  {/* Match Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {match.status === 'live' && (
                        <span className="w-2 h-2 rounded-full bg-coral live-dot" />
                      )}
                      <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
                        {match.matchType}
                      </span>
                    </div>
                    <span className="text-xs text-white/40">{match.venue}</span>
                  </div>

                  {/* Teams */}
                  <div className="space-y-3">
                    {/* Team 1 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                          {match.team1.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-display font-semibold text-lg text-white">{match.team1}</span>
                      </div>
                      <span className={`font-mono text-xl ${match.status === 'live' ? 'text-coral' : 'text-white'}`}>
                        {match.score1 || '-'}
                      </span>
                    </div>

                    {/* Team 2 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                          {match.team2.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-display font-semibold text-lg text-white">{match.team2}</span>
                      </div>
                      <span className="font-mono text-xl text-white">{match.score2 || '-'}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    {match.status === 'live' ? (
                      <>
                        <span className="text-sm text-white/60 font-mono">Overs: {match.overs}</span>
                        <button className="flex items-center gap-2 text-coral text-sm font-medium group-hover:underline">
                          <Radio className="w-4 h-4" />
                          Watch Live
                        </button>
                      </>
                    ) : match.status === 'upcoming' ? (
                      <>
                        <span className="text-sm text-white/60 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Tomorrow, 2:00 PM
                        </span>
                        <button className="text-coral text-sm font-medium group-hover:underline">
                          Set Reminder
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-white/60">Match Completed</span>
                        <button className="flex items-center gap-2 text-coral text-sm font-medium group-hover:underline">
                          <TrendingUp className="w-4 h-4" />
                          View Summary
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mt-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display font-semibold text-xl text-white mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-coral" />
              TODAY&apos;S HIGHLIGHTS
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Matches', value: '4', sub: '2 Live' },
                { label: 'Total Runs', value: '1,247', sub: 'Across all matches' },
                { label: 'Wickets', value: '42', sub: 'Today' },
                { label: 'Sixes', value: '28', sub: 'Maximum hits' },
              ].map((stat, i) => (
                <div key={i} className="glass rounded-lg p-4 text-center">
                  <div className="text-xs text-white/50 uppercase tracking-wider mb-1">{stat.label}</div>
                  <div className="font-display font-bold text-2xl sm:text-3xl text-white">{stat.value}</div>
                  <div className="text-xs text-white/40">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
