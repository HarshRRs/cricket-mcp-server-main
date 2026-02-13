import { useEffect, useState } from 'react';
import { Users, Trophy, TrendingUp, ChevronRight } from 'lucide-react';
import Navigation from '../sections/Navigation';
import Footer from '../sections/Footer';

interface Team {
  id: number;
  name: string;
  code: string;
  ranking: { test: number; odi: number; t20: number };
  titles: { worldCups: number; t20WorldCups: number; championsTrophy: number };
  captain: string;
  coach: string;
}

const teams: Team[] = [
  { id: 1, name: 'India', code: 'IND', ranking: { test: 2, odi: 1, t20: 1 }, titles: { worldCups: 2, t20WorldCups: 1, championsTrophy: 2 }, captain: 'Rohit Sharma', coach: 'Rahul Dravid' },
  { id: 2, name: 'Australia', code: 'AUS', ranking: { test: 1, odi: 2, t20: 3 }, titles: { worldCups: 5, t20WorldCups: 1, championsTrophy: 2 }, captain: 'Pat Cummins', coach: 'Andrew McDonald' },
  { id: 3, name: 'England', code: 'ENG', ranking: { test: 3, odi: 4, t20: 2 }, titles: { worldCups: 1, t20WorldCups: 2, championsTrophy: 0 }, captain: 'Jos Buttler', coach: 'Matthew Mott' },
  { id: 4, name: 'Pakistan', code: 'PAK', ranking: { test: 6, odi: 3, t20: 4 }, titles: { worldCups: 1, t20WorldCups: 1, championsTrophy: 1 }, captain: 'Babar Azam', coach: 'Grant Bradburn' },
  { id: 5, name: 'South Africa', code: 'SA', ranking: { test: 4, odi: 3, t20: 5 }, titles: { worldCups: 0, t20WorldCups: 0, championsTrophy: 1 }, captain: 'Aiden Markram', coach: 'Rob Walter' },
  { id: 6, name: 'New Zealand', code: 'NZ', ranking: { test: 5, odi: 5, t20: 6 }, titles: { worldCups: 0, t20WorldCups: 0, championsTrophy: 1 }, captain: 'Kane Williamson', coach: 'Gary Stead' },
  { id: 7, name: 'Sri Lanka', code: 'SL', ranking: { test: 7, odi: 8, t20: 8 }, titles: { worldCups: 1, t20WorldCups: 1, championsTrophy: 0 }, captain: 'Dasun Shanaka', coach: 'Chris Silverwood' },
  { id: 8, name: 'West Indies', code: 'WI', ranking: { test: 8, odi: 10, t20: 7 }, titles: { worldCups: 2, t20WorldCups: 2, championsTrophy: 1 }, captain: 'Shai Hope', coach: 'Andre Coley' },
];

export default function Teams() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
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

  const getTeamRank = (teamCode: string, format: string) => {
    const list = rankings.find((r: any) => r.type === 'Teams' && r.format.toLowerCase() === format.toLowerCase());
    if (!list) return 0;
    const team = list.rank.find((t: any) => t.team.includes(teamCode) || teamCode.includes(t.team));
    return team ? team.rank : 0;
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
            <h1 className="font-display font-bold text-white text-3xl sm:text-4xl lg:text-5xl mb-2">
              INTERNATIONAL <span className="text-coral">TEAMS</span>
            </h1>
            <p className="text-white/60">Explore team profiles, rankings, and achievements</p>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className="glass rounded-xl p-4 sm:p-5 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  {/* Team Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-coral/30 to-coral/10 flex items-center justify-center text-lg sm:text-xl font-bold text-white border border-coral/30">
                      {team.code}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-white text-lg">{team.name}</h3>
                      <p className="text-xs text-white/50">Captain: {team.captain}</p>
                    </div>
                  </div>

                  {/* Rankings */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { format: 'TEST', rank: getTeamRank(team.code, 'Test') || team.ranking.test },
                      { format: 'ODI', rank: getTeamRank(team.code, 'ODI') || team.ranking.odi },
                      { format: 'T20', rank: getTeamRank(team.code, 'T20') || team.ranking.t20 },
                    ].map((r) => (
                      <div key={r.format} className="text-center p-2 bg-white/5 rounded">
                        <div className="text-xs text-white/40">{r.format}</div>
                        <div className="font-display font-bold text-coral">#{r.rank}</div>
                      </div>
                    ))}
                  </div>

                  {/* Titles */}
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>{team.titles.worldCups} World Cups</span>
                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-coral group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Detail Modal */}
        {selectedTeam && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedTeam(null)}
          >
            <div
              className="glass rounded-2xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-coral/30 to-coral/10 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white border border-coral/30">
                  {selectedTeam.code}
                </div>
                <div>
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">{selectedTeam.name}</h2>
                  <p className="text-white/60">{selectedTeam.captain} (C)</p>
                </div>
              </div>

              {/* Rankings */}
              <div className="mb-6">
                <h3 className="text-sm font-mono text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  ICC Rankings
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { format: 'Test', rank: selectedTeam.ranking.test },
                    { format: 'ODI', rank: selectedTeam.ranking.odi },
                    { format: 'T20', rank: selectedTeam.ranking.t20 },
                  ].map((r) => (
                    <div key={r.format} className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-xs text-white/40 mb-1">{r.format}</div>
                      <div className="font-display font-bold text-xl sm:text-2xl text-coral">#{r.rank}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Titles */}
              <div className="mb-6">
                <h3 className="text-sm font-mono text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Major Titles
                </h3>
                <div className="space-y-2">
                  {[
                    { name: 'ICC Cricket World Cup', count: selectedTeam.titles.worldCups },
                    { name: 'ICC T20 World Cup', count: selectedTeam.titles.t20WorldCups },
                    { name: 'ICC Champions Trophy', count: selectedTeam.titles.championsTrophy },
                  ].map((title) => (
                    <div key={title.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/80 text-sm">{title.name}</span>
                      <span className="font-display font-bold text-coral">{title.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff */}
              <div>
                <h3 className="text-sm font-mono text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team Staff
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/60 text-sm">Captain</span>
                    <span className="text-white font-medium text-sm">{selectedTeam.captain}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/60 text-sm">Head Coach</span>
                    <span className="text-white font-medium text-sm">{selectedTeam.coach}</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedTeam(null)}
                className="w-full mt-6 btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Quick Facts */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mt-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display font-semibold text-xl text-white mb-6">QUICK FACTS</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Most World Cups', value: 'Australia (5)', icon: Trophy },
                { label: 'Current Test #1', value: 'Australia', icon: TrendingUp },
                { label: 'Current ODI #1', value: 'India', icon: TrendingUp },
                { label: 'Current T20 #1', value: 'India', icon: TrendingUp },
              ].map((fact, i) => (
                <div key={i} className="glass rounded-lg p-4 flex items-center gap-3">
                  <fact.icon className="w-8 h-8 text-coral" />
                  <div>
                    <div className="text-xs text-white/50">{fact.label}</div>
                    <div className="font-display font-semibold text-white">{fact.value}</div>
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
