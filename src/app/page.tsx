import { BarChart3, Calendar, Search, Sparkles, Star, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { AnimatedCards } from '@/components/AnimatedCards';
import PublicNavbar from '@/components/PublicNavbar';
import { Button } from '@/components/ui/button';
import { authOptions } from '@/lib/authOptions';

export default async function Landing() {
  const session = await getServerSession(authOptions);

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Search & Track',
      description: 'Find anime, inspect details, and add titles to your personal list.',
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Rate & Review',
      description: 'Score anime and keep your favorites easy to compare.',
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Seasonal Anime',
      description: 'Browse currently airing and seasonal anime.',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Statistics',
      description: 'Track your watching habits with personal stats.',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Track Progress',
      description: 'Update episode progress and watching status.',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Personal Library',
      description: 'Build a private anime library that follows your taste.',
    },
  ];

  const animeCovers = [
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx172019-3cfZbrYBmV23.jpg',
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx160275-cBOWJpcCGeMq.jpg',
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx182469-JQ808NBPxmgn.jpg',
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx154587-qQTzQnEJJ3oB.jpg',
    'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx174576-tpKcHG0eO6CS.jpg',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0c1a2e]/80 to-[#020617] text-white overflow-hidden">
      <PublicNavbar isAuthenticated={!!session?.user} />

      <section className="container mx-auto px-6 py-20 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-full flex items-center justify-center mb-8">
            <Image
              src="/logo.png"
              alt="JodMe logo"
              width={300}
              height={300}
              className="pointer-events-none"
            />
          </div>

          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-sky-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
            Manage your anime list in one place
          </h1>

          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Save, track, and analyze the anime you watch with search, seasonal browsing, progress tracking, and stats.
          </p>

          <div className="flex justify-center gap-4">
            <a href={session?.user ? '/me' : '/auth'}>
              <Button size="lg" className="bg-gradient-to-r from-sky-600 to-teal-500">
                <Sparkles className="w-5 h-5 mr-2" />
                {session?.user ? 'Open My List' : 'Start for free'}
              </Button>
            </a>
          </div>
        </div>

        <AnimatedCards covers={animeCovers} />
      </section>

      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
          <p className="text-slate-400">Browse publicly, then log in when you are ready to save.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-sky-950/30 rounded-xl p-6 border border-sky-800/40 hover:scale-105 transition"
            >
              <div className="w-12 h-12 bg-teal-500/15 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-8 text-slate-400 text-sm">
        Copyright 2026 JodMe. Anime data from AniList API.
      </footer>
    </div>
  );
}
