'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Clock, Star } from 'lucide-react';
import { MonthlyWatchStat, RecentWatchStat, UserAnimeEntry, WeeklyWatchStat } from '@/types/anime';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

interface Props {
  initialList: UserAnimeEntry[];
  monthlyWatchStats: MonthlyWatchStat[];
  weeklyWatchStats: WeeklyWatchStat[];
  recentWatchStats: RecentWatchStat[];
}

type WatchRange = 'monthly' | 'weekly';

export default function StatsClient({ initialList, monthlyWatchStats, weeklyWatchStats, recentWatchStats }: Props) {
  const [watchRange, setWatchRange] = useState<WatchRange>('monthly');

  const animeList = useMemo(
    () => Array.isArray(initialList) ? initialList : [],
    [initialList]
  );

  const stats = useMemo(() => calculateStats(animeList), [animeList]);

  const topRated = useMemo(() => {
    return animeList
      .filter(entry => entry.score !== null)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 5);
  }, [animeList]);

  const monthlyData = useMemo(() => {
    return monthlyWatchStats.map(item => ({
      label: formatMonth(item.month),
      episodes: item.episodes,
      anime: item.anime,
    }));
  }, [monthlyWatchStats]);

  const weeklyData = useMemo(() => {
    return weeklyWatchStats.map(item => ({
      label: formatWeek(item.week),
      episodes: item.episodes,
      anime: item.anime,
    }));
  }, [weeklyWatchStats]);

  const watchChartData = watchRange === 'monthly' ? monthlyData : weeklyData;

  const genreColors = ['#3b82f6', '#10b981', '#ec4899', '#f59e0b', '#8b5cf6'];

  const scoreColors = stats.scoreDistribution.map(({ score }) => {
    if (score >= 9) return '#10b981';
    if (score >= 7) return '#3b82f6';
    if (score >= 5) return '#f59e0b';
    return '#64748b';
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard icon="🎬" label="Total Anime" value={stats.totalAnime} />
        <StatCard icon="📺" label="Episodes" value={stats.episodesWatched} />
        <StatCard icon="⏱️" label="Days Watched" value={stats.daysWatched} />
        <StatCard icon="⭐" label="Avg Score" value={stats.avgScore} suffix="/10" />
      </div>

      <div className="bg-slate-800/40 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-medium">📈 Watch history</h2>
            <p className="text-xs text-slate-500">Episodes and unique anime watched</p>
          </div>

          <Select value={watchRange} onValueChange={(value) => setWatchRange(value as WatchRange)}>
            <SelectTrigger className="w-[130px] border-slate-700 bg-slate-900/40 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-slate-700 bg-slate-900 text-slate-200">
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={watchChartData}>
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 8,
                color: '#e2e8f0',
              }}
            />
            <Line
              type="monotone"
              dataKey="episodes"
              name="Episodes"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="anime"
              name="Anime"
              stroke="#34d399"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800/40 rounded-lg p-6">
          <h2 className="text-sm font-medium mb-4">🎭 Top genres</h2>
          {stats.genreDistribution.length > 0 ? (
            <div className="space-y-3">
              {stats.genreDistribution.map((item, index) => (
                <div key={item.genre} className="flex items-center gap-3">
                  <span className="text-sm w-24 truncate">{item.genre}</span>
                  <div className="flex-1 h-2 bg-slate-700 rounded">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${(item.count / Math.max(stats.totalAnime, 1)) * 100}%`,
                        backgroundColor: genreColors[index % genreColors.length],
                      }}
                    />
                  </div>
                  <span className="text-sm w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No genre data yet.</p>
          )}
        </div>

        <div className="bg-slate-800/40 rounded-lg p-6">
          <h2 className="text-sm font-medium mb-4">🏆 Score distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.scoreDistribution}>
              <XAxis dataKey="score" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  color: '#e2e8f0',
                }}
              />
              <Bar dataKey="count">
                {stats.scoreDistribution.map((_, index) => (
                  <Cell key={index} fill={scoreColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800/40 rounded-lg p-6">
          <h2 className="text-sm font-medium mb-4">✨ Top rated</h2>
          {topRated.length > 0 ? (
            <div className="space-y-3">
              {topRated.map((entry, index) => (
                <div key={entry.anime.id} className="flex items-center gap-3">
                  <AnimeCover
                    src={entry.anime.coverImage}
                    alt={entry.anime.title}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-slate-500">#{index + 1}</div>
                    <div className="truncate text-sm font-medium">{entry.anime.title}</div>
                    <div className="text-xs text-slate-500">
                      {entry.anime.year ?? 'Unknown year'}
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    {entry.score?.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No rated anime yet.</p>
          )}
        </div>

        <div className="bg-slate-800/40 rounded-lg p-6">
          <h2 className="text-sm font-medium mb-4">🍿 Last watched</h2>
          {recentWatchStats.length > 0 ? (
            <div className="space-y-3">
              {recentWatchStats.map((entry) => (
                <div key={`${entry.anime.id}-${entry.watchedAt}`} className="flex items-center gap-3">
                  <AnimeCover
                    src={entry.anime.coverImage}
                    alt={entry.anime.title}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{entry.anime.title}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Episode {entry.episode}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-600" />
                      <span>{formatWatchedAt(entry.watchedAt)}</span>
                    </div>
                  </div>
                  <Clock className="h-4 w-4 text-sky-400" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No watch history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function calculateStats(animeList: UserAnimeEntry[]) {
  const totalAnime = animeList.length;
  const episodesWatched = animeList.reduce((sum, entry) => sum + entry.progress, 0);
  const daysWatched = Math.round((episodesWatched * 24 / 60 / 24) * 10) / 10;

  const ratedAnime = animeList.filter(entry => entry.score !== null);
  const avgScore = ratedAnime.length > 0
    ? Math.round((ratedAnime.reduce((sum, entry) => sum + (entry.score || 0), 0) / ratedAnime.length) * 10) / 10
    : 0;

  const genreMap = new Map<string, number>();
  animeList.forEach(entry => {
    entry.anime.genres.forEach(genre => {
      genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
    });
  });

  const genreDistribution = Array.from(genreMap.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const scoreMap = new Map<number, number>();
  for (let i = 1; i <= 10; i++) {
    scoreMap.set(i, 0);
  }

  ratedAnime.forEach(entry => {
    if (entry.score !== null) {
      scoreMap.set(entry.score, (scoreMap.get(entry.score) || 0) + 1);
    }
  });

  const scoreDistribution = Array.from(scoreMap.entries())
    .map(([score, count]) => ({ score, count }));

  return {
    totalAnime,
    episodesWatched,
    daysWatched,
    avgScore,
    genreDistribution,
    scoreDistribution,
  };
}

function formatMonth(value: string) {
  const [year, month] = value.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
}

function formatWeek(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatWatchedAt(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function AnimeCover({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-slate-900">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="44px"
        className="object-cover"
      />
    </div>
  );
}

function StatCard({ icon, label, value, suffix }: { icon: string; label: string; value: number; suffix?: string }) {
  return (
    <div className="bg-slate-800/40 rounded-lg p-6">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <span className="text-base leading-none">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-4xl font-bold">{value}</div>
      {suffix && <div className="text-sm text-slate-500">{suffix}</div>}
    </div>
  );
}
