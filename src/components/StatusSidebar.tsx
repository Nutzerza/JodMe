import { Play, Check, Pause, X, Clock } from 'lucide-react';
import { AnimeStatus } from '@/types/anime';

interface StatusCount {
    status: AnimeStatus | 'all';
    label: string;
    count: number;
    icon: React.ReactNode;
}

// 1. กำหนดประเภทของ Status และการเรียงลำดับให้แน่นอน

type SortOption = 'dateAdded' | 'score' | 'title';
type StatusFilter = AnimeStatus | 'all';

// 2. สร้าง Interface สำหรับ Props
interface StatusSidebarProps {
    statusCounts: {
        status: StatusFilter;
        label: string;
        count: number;
    }[];
    activeStatus: StatusFilter;
    onStatusChange: (status: StatusFilter) => void;
    sortBy: string;
    onSortChange: (value: any) => void;
}

export function StatusSidebar({
    statusCounts,
    activeStatus,
    onStatusChange,
    sortBy,
    onSortChange
}: StatusSidebarProps) {
    // เปลี่ยน status: string เป็น status: AnimeStatus เพื่อความปลอดภัย
    const getStatusIcon = (status: AnimeStatus) => {
        switch (status) {
            case 'all': return '⚡';
            case 'watching': return <Play className="w-4 h-4" />;
            case 'completed': return <Check className="w-4 h-4" />;
            case 'on_hold': return <Pause className="w-4 h-4" />;
            case 'dropped': return <X className="w-4 h-4" />;
            case 'plan_to_watch': return <Clock className="w-4 h-4" />;
            default: return null;
        }
    };

    return (
        <div className="w-64 flex flex-col gap-6">
            {/* Status Filter */}
            <div>
                <h3 className="text-xs uppercase text-slate-400 mb-3">Status</h3>
                <div className="flex flex-col gap-1">
                    {statusCounts.map(({ status, label, count }) => (
                        <button
                            key={status}
                            onClick={() => onStatusChange(status)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeStatus === status
                                ? 'bg-purple-600/20 text-purple-400'
                                : 'text-slate-300 hover:bg-slate-800/50'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400">{getStatusIcon(status)}</span>
                                <span>{label}</span>
                            </div>
                            <span className="text-slate-500">{count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sort Options */}
            <div>
                <h3 className="text-xs uppercase text-slate-400 mb-3">Sort by</h3>
                <div className="flex flex-col gap-1">
                    {[
                        { value: 'dateAdded', label: 'Date added' },
                        { value: 'score', label: 'My score' },
                        { value: 'title', label: 'Title A-Z' },
                    ].map(option => (
                        <button
                            key={option.value}
                            onClick={() => onSortChange(option.value)}
                            className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${sortBy === option.value
                                ? 'bg-slate-700/50 text-white'
                                : 'text-slate-400 hover:bg-slate-800/50'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
