'use client';

import { useEffect, useState, useMemo } from 'react';
import { Star } from 'lucide-react';
import { getAnimeList, calculateStats } from '@/utils/storage';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell
} from 'recharts';

export default function StatsClient() {
    const [animeList, setAnimeList] = useState<any[]>([]);

    useEffect(() => {
        setAnimeList(getAnimeList());
    }, []);

    const stats = useMemo(() => calculateStats(animeList), [animeList]);

    const topRated = useMemo(() => {
        return animeList
            .filter(entry => entry.score !== null)
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 3);
    }, [animeList]);

    const genreColors = ['#3b82f6', '#10b981', '#ec4899', '#f59e0b', '#8b5cf6'];

    const scoreColors = stats.scoreDistribution.map(({ score }: any) => {
        if (score >= 9) return '#10b981';
        if (score >= 7) return '#3b82f6';
        if (score >= 5) return '#f59e0b';
        return '#64748b';
    });

    return (
        <div className="max-w-5xl mx-auto">
            {/* Main Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <StatCard label="Total Anime" value={stats.totalAnime} />
                <StatCard label="Days Watched" value={stats.daysWatched} />
                <StatCard label="Avg Score" value={stats.avgScore} suffix="/10" />
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Genres */}
                <div className="bg-slate-800/40 rounded-lg p-6">
                    <h2 className="text-sm font-medium mb-4">Top genres</h2>
                    <div className="space-y-3">
                        {stats.genreDistribution.map((item: any, index: number) => (
                            <div key={item.genre} className="flex items-center gap-3">
                                <span className="text-sm w-24">{item.genre}</span>
                                <div className="flex-1 h-2 bg-slate-700 rounded">
                                    <div
                                        className="h-full"
                                        style={{
                                            width: `${(item.count / stats.totalAnime) * 100}%`,
                                            backgroundColor: genreColors[index % genreColors.length]
                                        }}
                                    />
                                </div>
                                <span className="text-sm w-8 text-right">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-slate-800/40 rounded-lg p-6">
                    <h2 className="text-sm font-medium mb-4">Score distribution</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={stats.scoreDistribution}>
                            <XAxis dataKey="score" />
                            <YAxis />
                            <Bar dataKey="count">
                                {stats.scoreDistribution.map((_: any, index: number) => (
                                    <Cell key={index} fill={scoreColors[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Rated */}
            {topRated.length > 0 && (
                <div className="bg-slate-800/40 rounded-lg p-6">
                    <h2 className="text-sm font-medium mb-4">Top rated</h2>
                    {topRated.map((entry, index) => (
                        <div key={entry.anime.id} className="flex justify-between py-2">
                            <span>{index + 1}. {entry.anime.title}</span>
                            <span className="flex items-center gap-1 text-amber-400">
                                <Star className="w-4 h-4 fill-amber-400" />
                                {entry.score?.toFixed(1)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// reusable
function StatCard({ label, value, suffix }: any) {
    return (
        <div className="bg-slate-800/40 rounded-lg p-6">
            <div className="text-xs text-slate-400 mb-2">{label}</div>
            <div className="text-4xl font-bold">{value}</div>
            {suffix && <div className="text-sm text-slate-500">{suffix}</div>}
        </div>
    );
}