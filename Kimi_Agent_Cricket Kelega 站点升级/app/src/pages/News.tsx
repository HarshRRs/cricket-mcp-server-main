import { useEffect, useState } from 'react';
import { Newspaper, Clock, ChevronRight, Share2, Bookmark } from 'lucide-react';
import Navigation from '../sections/Navigation';
import Footer from '../sections/Footer';

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  time: string;
  image: string;
  featured?: boolean;
}

const newsArticles: NewsArticle[] = [
  {
    id: 1,
    title: 'India Clinches Thrilling Victory Against Australia in Final Over',
    excerpt: 'Virat Kohli\'s masterful century guides India to a memorable win as they chase down 288 in the final over at Sydney.',
    category: 'Match Report',
    author: 'Rahul Sharma',
    time: '2 hours ago',
    image: '/match_india_australia.jpg',
    featured: true,
  },
  {
    id: 2,
    title: 'Bumrah Ruled Out of Remaining ODIs Due to Back Injury',
    excerpt: 'Indian pace spearhead Jasprit Bumrah has been ruled out of the remaining ODIs against Australia due to a back spasm.',
    category: 'Injury Update',
    author: 'Sports Desk',
    time: '4 hours ago',
    image: '/player_spotlight.jpg',
  },
  {
    id: 3,
    title: 'ICC Announces New Format for 2024 T20 World Cup',
    excerpt: 'The ICC has revealed an expanded format for the upcoming T20 World Cup with 20 teams competing for the trophy.',
    category: 'Tournament',
    author: 'ICC Media',
    time: '6 hours ago',
    image: '/winning_celebration.jpg',
  },
  {
    id: 4,
    title: 'Smith Surpasses 10,000 Test Runs Milestone',
    excerpt: 'Australian batting maestro Steve Smith becomes the 15th player in history to reach 10,000 Test runs.',
    category: 'Milestone',
    author: 'Cricket Australia',
    time: '8 hours ago',
    image: '/match_pakistan_england.jpg',
  },
  {
    id: 5,
    title: 'England Announces Squad for Pakistan Tour',
    excerpt: 'Ben Stokes returns to lead England in the upcoming Test series against Pakistan starting next month.',
    category: 'Team News',
    author: 'ECB',
    time: '12 hours ago',
    image: '/moment_catch.jpg',
  },
  {
    id: 6,
    title: 'IPL 2024 Auction: Record-Breaking Bids Expected',
    excerpt: 'Franchises prepare for the biggest auction yet with several marquee players set to go under the hammer.',
    category: 'IPL',
    author: 'IPL Correspondent',
    time: '1 day ago',
    image: '/hero_crowd.jpg',
  },
];

const categories = ['All', 'Match Report', 'Team News', 'Injury Update', 'Tournament', 'Milestone', 'IPL'];

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savedArticles, setSavedArticles] = useState<number[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://cricket-mcp-server-main-production.up.railway.app/news');
      const data = await response.json();

      const transformed = data.map((item: any, index: number) => ({
        id: index + 1,
        title: item.title,
        excerpt: item.description || 'Read the full story on the official site.',
        category: 'Latest News',
        author: 'Staff Writer',
        time: 'Just now',
        image: '/hero_crowd.jpg', // Default image as API might not provide it
        featured: index === 0,
        url: item.url
      }));
      setNews(transformed);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = (id: number) => {
    setSavedArticles((prev: number[]) =>
      prev.includes(id) ? prev.filter((a: number) => a !== id) : [...prev, id]
    );
  };

  const filteredArticles = selectedCategory === 'All'
    ? news
    : news.filter((a: any) => a.category === selectedCategory);

  const featuredArticle = news.find((a: any) => a.featured);
  const regularArticles = filteredArticles.filter((a: any) => !a.featured || selectedCategory !== 'All');

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
              CRICKET <span className="text-coral">NEWS</span>
            </h1>
            <p className="text-white/60">Latest updates from the world of cricket</p>
          </div>
        </div>

        {/* Categories */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${selectedCategory === cat
                    ? 'bg-coral text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Article */}
        {featuredArticle && selectedCategory === 'All' && (
          <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mb-8">
            <div className="max-w-6xl mx-auto">
              <div className="glass rounded-xl overflow-hidden group cursor-pointer">
                <div className="grid lg:grid-cols-2">
                  <div className="h-48 sm:h-64 lg:h-auto">
                    <img
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
                    <span className="inline-block w-fit px-3 py-1 bg-coral/20 text-coral text-xs font-medium rounded-full mb-4">
                      {featuredArticle.category}
                    </span>
                    <h2 className="font-display font-bold text-xl sm:text-2xl lg:text-3xl text-white mb-3 group-hover:text-coral transition-colors">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-white/60 mb-4 line-clamp-2 sm:line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-white/50">
                        <span>{featuredArticle.author}</span>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {featuredArticle.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSave(featuredArticle.id); }}
                          className={`p-2 rounded-lg transition-colors ${savedArticles.includes(featuredArticle.id)
                            ? 'bg-coral text-white'
                            : 'bg-white/5 text-white/50 hover:bg-white/10'
                            }`}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-white/5 text-white/50 hover:bg-white/10 rounded-lg transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* News Grid */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {regularArticles.map((article) => (
                <div
                  key={article.id}
                  className="glass rounded-xl overflow-hidden group cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="h-40 sm:h-48 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 sm:p-5">
                    <span className="inline-block px-2 py-0.5 bg-white/10 text-white/70 text-xs rounded mb-3">
                      {article.category}
                    </span>
                    <h3 className="font-display font-semibold text-white text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-coral transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-white/50 text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <Clock className="w-3 h-3" />
                        {article.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSave(article.id); }}
                          className={`p-1.5 rounded transition-colors ${savedArticles.includes(article.id)
                            ? 'text-coral'
                            : 'text-white/30 hover:text-white'
                            }`}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-coral group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Load More */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mt-8">
          <div className="max-w-6xl mx-auto text-center">
            <button className="btn-outline">
              Load More Articles
            </button>
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mt-12">
          <div className="max-w-6xl mx-auto">
            <div className="glass rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Newspaper className="w-10 h-10 text-coral" />
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Stay Updated</h3>
                  <p className="text-white/60 text-sm">Get the latest cricket news delivered to your inbox</p>
                </div>
              </div>
              <a href="/alerts" className="btn-primary whitespace-nowrap">
                Subscribe Now
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
