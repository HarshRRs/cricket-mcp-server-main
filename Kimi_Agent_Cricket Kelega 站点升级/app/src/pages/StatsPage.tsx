import { useEffect, useState } from 'react';
import { TrendingUp, Award, Target, Zap, User } from 'lucide-react';
import Navigation from '../sections/Navigation';
import Footer from '../sections/Footer';

interface PlayerStat {
  rank: number;
  player: string;
  team: string;
  value: number;
  matches: number;
}

const battingStats: PlayerStat[] = [
  { rank: 1, player: 'Virat Kohli', team: 'IND', value: 847, matches: 12 },
  { rank: 2, player: 'Rohit Sharma', team: 'IND', value: 712, matches: 12 },
  { rank: 3, player: 'Steve Smith', team: 'AUS', value: 698, matches: 11 },
  { rank: 4, player: 'Babar Azam', team: 'PAK', value: 654, matches: 10 },
  { rank: 5, player: 'Joe Root', team: 'ENG', value: 621, matches: 11 },
];

const bowlingStats: PlayerStat[] = [
  { rank: 1, player: 'Jasprit Bumrah', team: 'IND', value: 28, matches: 12 },
  { rank: 2, player: 'Pat Cummins', team: 'AUS', value: 26, matches: 11 },
  { rank: 3, player: 'Shaheen Afridi', team: 'PAK', value: 24, matches: 10 },
  { rank: 4, player: 'Mark Wood', team: 'ENG', value: 22, matches: 11 },
  { rank: 5, player: 'Trent Boult', team: 'NZ', value: 21, matches: 10 },
];

const sixesStats: PlayerStat[] = [
  { rank: 1, player: 'Rohit Sharma', team: 'IND', value: 28, matches: 12 },
  { rank: 2, player: 'Glenn Maxwell', team: 'AUS', value: 24, matches: 11 },
  { rank: 3, player: 'Nicholas Pooran', team: 'WI', value: 22, matches: 10 },
  { rank: 4, player: 'Jos Buttler', team: 'ENG', value: 20, matches: 11 },
  { rank: 5, player: 'Fakhar Zaman', team: 'PAK', value: 18, matches: 10 },
];

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState<'batting' | 'bowling' | 'sixes'>('batting');
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://cricket-mcp-server-main-production.up.railway.app/rankings');
      const data = await response.json();
      setRankings(data);
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatsData = () => {
    // Filter rankings based on tab
    // data structure: [ { "type": "Batsmen", "format": "Test", "rank": [ ... ] }, ... ]
    if (activeTab === 'sixes') {
      return { stats: sixesStats, label: 'Sixes', icon: Zap };
    }

    const type = activeTab === 'batting' ? 'Batsmen' : 'Bowlers';
    const relevant = rankings.find((r: any) => r.type === type && r.format === 'ODI'); // Default to ODI for demo

    if (!relevant) {
      return {
        stats: activeTab === 'batting' ? battingStats : bowlingStats,
        label: activeTab === 'batting' ? 'Runs' : 'Wickets',
        icon: activeTab === 'batting' ? TrendingUp : Target
      };
    }

    const mappedStats = relevant.rank.slice(0, 10).map((r: any): PlayerStat => ({
      rank: r.rank,
      player: r.player,
      team: r.team,
      value: r.rating, // Using rating as the value
      matches: 0 // Not provided in rankings API
    }));

    return {
      stats: mappedStats,
      label: 'Rating',
      icon: activeTab === 'batting' ? TrendingUp : Target
    };
  };

  const { stats, label } = getStatsData();

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
            <h1 className="font-display font-bold text-white text-3xl sm:text-4xl lg:text-5xl mb-2">
              PLAYER <span className="text-coral">STATISTICS</span>
            </h1>
            <p className="text-white/60">Comprehensive stats and rankings</p>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mb-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: 'Total Matches', value: '48', icon: Award },
                { label: 'Total Runs', value: '12,847', icon: TrendingUp },
                { label: 'Total Wickets', value: '486', icon: Target },
                { label: 'Centuries', value: '24', icon: User },
              ].map((stat, i) => (
                <div key={i} className="glass rounded-lg p-3 sm:p-4">
                  <stat.icon className="w-5 h-5 text-coral mb-2" />
                  <div className="font-display font-bold text-xl sm:text-2xl text-white">{stat.value}</div>
                  <div className="text-xs text-white/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-2 sm:gap-4 border-b border-white/10">
              {([
                { key: 'batting', label: 'Top Run Scorers', icon: TrendingUp },
                { key: 'bowling', label: 'Top Wicket Takers', icon: Target },
                { key: 'sixes', label: 'Most Sixes', icon: Zap },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex items-center gap-2 px-3 sm:px-6 py-3 text-sm sm:text-base font-medium uppercase tracking-wider transition-colors relative ${activeTab === tab.key ? 'text-coral' : 'text-white/60 hover:text-white'
                    }`}
                >
                  <tab.icon className="w-4 h-4 hidden sm:inline" />
                  <span className="text-xs sm:text-sm">{tab.label}</span>
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-coral" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Table */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="max-w-6xl mx-auto">
            <div className="glass rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="py-3 sm:py-4 px-3 sm:px-6 text-left text-xs font-mono text-white/60 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="py-3 sm:py-4 px-3 sm:px-6 text-left text-xs font-mono text-white/60 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="py-3 sm:py-4 px-3 sm:px-6 text-center text-xs font-mono text-white/60 uppercase tracking-wider">
                        Matches
                      </th>
                      <th className="py-3 sm:py-4 px-3 sm:px-6 text-right text-xs font-mono text-white/60 uppercase tracking-wider">
                        {label}
                      </th>
                      <th className="py-3 sm:py-4 px-3 sm:px-6 text-right text-xs font-mono text-white/60 uppercase tracking-wider hidden sm:table-cell">
                        Average
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((player) => (
                      <tr
                        key={player.rank}
                        className="border-t border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 sm:py-4 px-3 sm:px-6">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-bold ${player.rank === 1
                              ? 'bg-coral text-white'
                              : player.rank === 2
                                ? 'bg-yellow-500/80 text-white'
                                : player.rank === 3
                                  ? 'bg-orange-500/80 text-white'
                                  : 'bg-white/10 text-white'
                              }`}
                          >
                            {player.rank}
                          </span>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                              {player.player.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <span className="font-semibold text-white text-sm sm:text-base">{player.player}</span>
                              <span className="ml-2 text-xs font-mono text-white/50 px-1.5 sm:px-2 py-0.5 bg-white/5 rounded">
                                {player.team}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-center text-white/70 font-mono text-sm">
                          {player.matches}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-right">
                          <span className="font-display font-bold text-lg sm:text-xl text-coral">
                            {player.value}
                          </span>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-right text-white/70 font-mono text-sm hidden sm:table-cell">
                          {(player.value / player.matches).toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Team Rankings Preview */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mt-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display font-semibold text-xl text-white mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-coral" />
              ICC TEAM RANKINGS
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  format: 'Test', teams: [
                    { rank: 1, team: 'Australia', rating: 124 },
                    { rank: 2, team: 'India', rating: 116 },
                    { rank: 3, team: 'England', rating: 108 },
                  ]
                },
                {
                  format: 'ODI', teams: [
                    { rank: 1, team: 'India', rating: 121 },
                    { rank: 2, team: 'Australia', rating: 118 },
                    { rank: 3, team: 'South Africa', rating: 110 },
                  ]
                },
                {
                  format: 'T20', teams: [
                    { rank: 1, team: 'India', rating: 264 },
                    { rank: 2, team: 'England', rating: 256 },
                    { rank: 3, team: 'Australia', rating: 250 },
                  ]
                },
              ].map((format) => (
                <div key={format.format} className="glass rounded-xl p-4 sm:p-5">
                  <h3 className="font-display font-semibold text-lg text-white mb-4">{format.format}</h3>
                  <div className="space-y-3">
                    {format.teams.map((t) => (
                      <div key={t.rank} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/70">
                            {t.rank}
                          </span>
                          <span className="text-white text-sm">{t.team}</span>
                        </div>
                        <span className="font-mono text-coral text-sm">{t.rating}</span>
                      </div>
                    ))}
                  </div>
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
