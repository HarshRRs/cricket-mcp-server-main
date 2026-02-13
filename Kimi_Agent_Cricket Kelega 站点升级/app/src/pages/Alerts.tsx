import { useEffect, useState } from 'react';
import { Bell, Mail, Check, Smartphone, Globe } from 'lucide-react';
import Navigation from '../sections/Navigation';
import Footer from '../sections/Footer';

export default function Alerts() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [preferences, setPreferences] = useState({
    matchAlerts: true,
    scoreUpdates: true,
    newsDigest: false,
    teamNews: true,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
    }
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="relative bg-navy min-h-screen">
      <div className="grain-overlay" />
      <Navigation />
      
      <main className="pt-20 lg:pt-24 pb-16">
        {/* Header */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <Bell className="w-12 h-12 text-coral mx-auto mb-4" />
            <h1 className="font-display font-bold text-white text-3xl sm:text-4xl lg:text-5xl mb-2">
              MATCH <span className="text-coral">ALERTS</span>
            </h1>
            <p className="text-white/60">Never miss a moment of the action</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="max-w-2xl mx-auto">
            {isSubscribed ? (
              <div className="glass rounded-xl p-6 sm:p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-coral/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-coral" />
                </div>
                <h2 className="font-display font-semibold text-2xl text-white mb-2">
                  You&apos;re All Set!
                </h2>
                <p className="text-white/60 mb-6">
                  We&apos;ve sent a confirmation email to <span className="text-white">{email}</span>. 
                  Click the link to verify your subscription.
                </p>
                <div className="glass-light rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-white mb-3">Your Preferences</h3>
                  <div className="space-y-2 text-sm text-white/60">
                    {preferences.matchAlerts && <div>Match Start Alerts</div>}
                    {preferences.scoreUpdates && <div>Live Score Updates</div>}
                    {preferences.newsDigest && <div>Weekly News Digest</div>}
                    {preferences.teamNews && <div>Team News & Updates</div>}
                  </div>
                </div>
                <button 
                  onClick={() => { setIsSubscribed(false); setEmail(''); }}
                  className="btn-outline"
                >
                  Subscribe Another Email
                </button>
              </div>
            ) : (
              <>
                {/* Alert Types */}
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: Mail, title: 'Email Alerts', desc: 'Get updates in your inbox' },
                    { icon: Smartphone, title: 'Push Notifications', desc: 'Instant mobile alerts' },
                    { icon: Globe, title: 'Browser Alerts', desc: 'Desktop notifications' },
                  ].map((type, i) => (
                    <div key={i} className="glass rounded-lg p-4 text-center">
                      <type.icon className="w-8 h-8 text-coral mx-auto mb-2" />
                      <h3 className="font-medium text-white text-sm">{type.title}</h3>
                      <p className="text-xs text-white/50">{type.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass rounded-xl p-6 sm:p-8">
                  <h2 className="font-display font-semibold text-xl text-white mb-6">
                    Set Your Preferences
                  </h2>

                  {/* Email Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-coral transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="space-y-3 mb-8">
                    <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={preferences.matchAlerts}
                        onChange={() => togglePreference('matchAlerts')}
                        className="w-5 h-5 rounded border-white/30 bg-white/5 text-coral focus:ring-coral"
                      />
                      <div>
                        <div className="text-white text-sm">Match Start Alerts</div>
                        <div className="text-xs text-white/50">Get notified when matches begin</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={preferences.scoreUpdates}
                        onChange={() => togglePreference('scoreUpdates')}
                        className="w-5 h-5 rounded border-white/30 bg-white/5 text-coral focus:ring-coral"
                      />
                      <div>
                        <div className="text-white text-sm">Live Score Updates</div>
                        <div className="text-xs text-white/50">Key moments and milestones</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={preferences.newsDigest}
                        onChange={() => togglePreference('newsDigest')}
                        className="w-5 h-5 rounded border-white/30 bg-white/5 text-coral focus:ring-coral"
                      />
                      <div>
                        <div className="text-white text-sm">Weekly News Digest</div>
                        <div className="text-xs text-white/50">Top stories every Monday</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={preferences.teamNews}
                        onChange={() => togglePreference('teamNews')}
                        className="w-5 h-5 rounded border-white/30 bg-white/5 text-coral focus:ring-coral"
                      />
                      <div>
                        <div className="text-white text-sm">Team News & Updates</div>
                        <div className="text-xs text-white/50">Squad announcements and injuries</div>
                      </div>
                    </label>
                  </div>

                  {/* Submit */}
                  <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2">
                    <Bell className="w-4 h-4" />
                    Subscribe to Alerts
                  </button>

                  <p className="text-xs text-white/40 text-center mt-4">
                    Unsubscribe anytime. We respect your privacy.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
