import { useEffect, useState } from 'react';
import Navigation from './sections/Navigation';
import HeroSection from './sections/HeroSection';
import LiveMatchSection from './sections/LiveMatchSection';
import FeaturedMatchSection from './sections/FeaturedMatchSection';
import MomentSection from './sections/MomentSection';
import PlayerSection from './sections/PlayerSection';
import WinningSection from './sections/WinningSection';
import StatsSection from './sections/StatsSection';
import NewsletterSection from './sections/NewsletterSection';
import Footer from './sections/Footer';

// Pages
import LiveScores from './pages/LiveScores';
import Fixtures from './pages/Fixtures';
import StatsPage from './pages/StatsPage';
import Teams from './pages/Teams';
import News from './pages/News';
import Alerts from './pages/Alerts';

declare global {
  interface Window {
    gsap: {
      registerPlugin: (plugin: unknown) => void;
      timeline: (config: unknown) => {
        fromTo: (target: unknown, from: unknown, to: unknown, position?: number | string) => unknown;
        to: (target: unknown, vars: unknown, position?: number | string) => unknown;
      };
      fromTo: (target: unknown, from: unknown, to: unknown) => unknown;
    };
    ScrollTrigger: {
      getAll: () => Array<{
        kill: () => void;
        vars: { pin?: boolean };
        start: number;
        end?: number;
      }>;
      maxScroll: (element: Window | Element) => number;
      create: (config: unknown) => void;
    };
  }
}

// Hash-based router for static deployment
function useHashRouter() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return hash;
}

function Router() {
  const hash = useHashRouter();

  switch (hash) {
    case '#live-scores':
      return <LiveScores />;
    case '#fixtures':
      return <Fixtures />;
    case '#stats':
      return <StatsPage />;
    case '#teams':
      return <Teams />;
    case '#news':
      return <News />;
    case '#alerts':
      return <Alerts />;
    default:
      return <HomePage />;
  }
}

function HomePage() {
  useEffect(() => {
    const checkGSAP = () => {
      if (window.gsap && window.ScrollTrigger) {
        window.gsap.registerPlugin(window.ScrollTrigger);
        
        setTimeout(() => {
          setupGlobalSnap();
        }, 800);
        
        return true;
      }
      return false;
    };

    if (!checkGSAP()) {
      const interval = setInterval(() => {
        if (checkGSAP()) {
          clearInterval(interval);
        }
      }, 100);
      setTimeout(() => clearInterval(interval), 5000);
    }

    return () => {
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      }
    };
  }, []);

  const setupGlobalSnap = () => {
    const pinned = window.ScrollTrigger.getAll()
      .filter((st) => st.vars.pin)
      .sort((a, b) => a.start - b.start);

    const maxScroll = window.ScrollTrigger.maxScroll(window);
    if (!maxScroll || pinned.length === 0) return;

    const pinnedRanges = pinned.map((st) => ({
      start: st.start / maxScroll,
      end: (st.end ?? st.start) / maxScroll,
      center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
    }));

    window.ScrollTrigger.create({
      snap: {
        snapTo: (value: number) => {
          const inPinned = pinnedRanges.some(
            (r) => value >= r.start - 0.02 && value <= r.end + 0.02
          );
          if (!inPinned) return value;

          const target = pinnedRanges.reduce(
            (closest, r) =>
              Math.abs(r.center - value) < Math.abs(closest - value)
                ? r.center
                : closest,
            pinnedRanges[0]?.center ?? 0
          );

          return target;
        },
        duration: { min: 0.15, max: 0.35 },
        delay: 0,
        ease: 'power2.out',
      },
    });
  };

  return (
    <div className="relative bg-navy min-h-screen">
      <div className="grain-overlay" />
      <Navigation />
      <main className="relative">
        <HeroSection />
        <LiveMatchSection />
        <FeaturedMatchSection />
        <MomentSection />
        <PlayerSection />
        <WinningSection />
        <StatsSection />
        <NewsletterSection />
        <Footer />
      </main>
    </div>
  );
}

function App() {
  return <Router />;
}

export default App;
