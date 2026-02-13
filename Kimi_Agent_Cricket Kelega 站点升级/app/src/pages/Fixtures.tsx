import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Bell, Filter } from 'lucide-react';
import Navigation from '../sections/Navigation';
import Footer from '../sections/Footer';

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

export default function Fixtures() {
  const [filter, setFilter] = useState<'all' | 'odi' | 'test' | 't20'>('all');
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<number[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchFixtures();
  }, []);

  const fetchFixtures = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://cricket-mcp-server-main-production.up.railway.app/schedule');
      const data = await response.json();

      const transformed = data.map((item: any, index: number): Fixture => {
        // Simple parsing of "Team1 vs Team2 - Info"
        return {
          id: index,
          date: item.date || 'TBA',
          time: 'TBA',
          team1: item.teams?.[0] || 'Team A',
          team2: item.teams?.[1] || 'Team B',
          venue: item.venue || 'TBA',
          matchType: 'ODI', // Defaulting for now
          series: item.name
        };
      });
      setFixtures(transformed);
    } catch (error) {
      console.error('Failed to fetch fixtures:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReminder = (id: number) => {
    setReminders((prev: number[]) =>
      prev.includes(id) ? prev.filter((r: number) => r !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="relative bg-navy min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredFixtures = filter === 'all'
    ? fixtures
    : fixtures.filter((f: Fixture) => f.matchType.toLowerCase() === filter);

  return (
    <div className="relative bg-navy min-h-screen">
      <div className="grain-overlay" />
      <Navigation />

      <main className="pt-20 lg:pt-24 pb-16">
        {/* Header */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mb-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-display font-bold text-white text-3xl sm:text-4xl lg:text-5xl mb-2">
              MATCH <span className="text-coral">FIXTURES</span>
            </h1>
            <p className="text-white/60">Complete schedule of upcoming matches</p>
          </div>
        </div>

        {/* Filter */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Filter className="w-4 h-4 text-white/50 mr-2" />
              {(['all', 'test', 'odi', 't20'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium uppercase transition-colors ${filter === type
                    ? 'bg-coral text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                >
                  {type === 'all' ? 'All Matches' : type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fixtures List */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-4">
              {filteredFixtures.map((fixture) => (
                <div
                  key={fixture.id}
                  className="glass rounded-xl p-4 sm:p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Date & Time */}
                    <div className="flex items-center gap-4 lg:w-48 shrink-0">
                      <div className="w-14 h-14 rounded-lg bg-coral/20 flex flex-col items-center justify-center">
                        <span className="text-xs text-coral font-medium uppercase">
                          {fixture.date.split(',')[0].slice(0, 3)}
                        </span>
                        <span className="font-display font-bold text-white text-lg">
                          {fixture.date.match(/\d+/)?.[0] || '--'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-white/70 text-sm">
                          <Clock className="w-3 h-3" />
                          {fixture.time}
                        </div>
                        <div className="text-xs text-white/50">{fixture.date}</div>
                      </div>
                    </div>

                    {/* Teams */}
                    <div className="flex-1 flex items-center gap-3 sm:gap-6">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center text-xs sm:text-sm font-bold">
                          {fixture.team1.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-display font-semibold text-white text-sm sm:text-base">{fixture.team1}</span>
                      </div>
                      <span className="text-coral font-bold text-sm sm:text-base">VS</span>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center text-xs sm:text-sm font-bold">
                          {fixture.team2.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-display font-semibold text-white text-sm sm:text-base">{fixture.team2}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-sm text-white/60">
                      <span className="px-2 py-1 bg-white/5 rounded text-xs uppercase">{fixture.matchType}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {fixture.venue}
                      </span>
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => toggleReminder(fixture.id)}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${reminders.includes(fixture.id)
                        ? 'bg-coral text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                    >
                      <Bell className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {reminders.includes(fixture.id) ? 'Reminder Set' : 'Remind Me'}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Download */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mt-12">
          <div className="max-w-6xl mx-auto">
            <div className="glass rounded-xl p-6 sm:p-8 text-center">
              <Calendar className="w-10 h-10 text-coral mx-auto mb-4" />
              <h3 className="font-display font-semibold text-xl text-white mb-2">
                Never Miss a Match
              </h3>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                Download the complete fixture calendar or sync with your favorite calendar app.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button className="btn-primary w-full sm:w-auto">
                  Download ICS File
                </button>
                <button className="btn-outline w-full sm:w-auto">
                  Sync with Google Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
