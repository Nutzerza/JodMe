// app/(landing)/Landing.tsx  ← Server Component

import { Sparkles, Star, TrendingUp, BarChart3, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedCards } from '@/components/AnimatedCards'; // ✅ client แยก

interface LandingProps {
    onGetStarted?: () => void; // optional (เพราะ server ใช้ onClick ไม่ได้)
}

export default function Landing({ onGetStarted }: LandingProps) {
    const features = [
        {
            icon: <Search className="w-6 h-6" />,
            title: 'Search & Track',
            description: 'ค้นหาอนิเมะและเพิ่มเข้ารายการของคุณได้ง่ายๆ',
        },
        {
            icon: <Star className="w-6 h-6" />,
            title: 'Rate & Review',
            description: 'ให้คะแนนและติดตามตอนที่ดูแล้ว',
        },
        {
            icon: <Calendar className="w-6 h-6" />,
            title: 'Seasonal Anime',
            description: 'ดูอนิเมะที่กำลังฉายในแต่ละซีซัน',
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: 'Statistics',
            description: 'วิเคราะห์สถิติการดูและแนวที่ชอบ',
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: 'Track Progress',
            description: 'ติดตามความคืบหน้าของแต่ละเรื่อง',
        },
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: 'Personal Library',
            description: 'สร้างห้องสมุดอนิเมะส่วนตัวของคุณ',
        },
    ];

    const mockAnimeCovers = [
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0c1a2e]/80 to-[#020617] text-white overflow-hidden">

            {/* Header */}
            <header className="container mx-auto px-6 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-8 h-8 text-teal-400" />
                        <span className="text-2xl font-bold">ANITRACK</span>
                    </div>

                    {/* ❗ server → ใช้ link แทน onClick */}
                    <a href="/u/gemini">
                        <Button variant="ghost" className="text-sky-400">
                            เข้าสู่แอป →
                        </Button>
                    </a>
                </div>
            </header>

            {/* Hero (LCP สำคัญสุด) */}
            <section className="container mx-auto px-6 py-20 relative">
                <div className="max-w-4xl mx-auto text-center relative z-10">

                    {/* ✅ ใช้ h1 จริง */}
                    <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-sky-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                        จัดการรายการอนิเมะของคุณในที่เดียว
                    </h1>

                    <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
                        เก็บบันทึก ติดตาม และวิเคราะห์อนิเมะที่คุณดู พร้อมสถิติครบ
                    </p>

                    <div className="flex justify-center gap-4">
                        <a href="/u/gemini">
                            <Button size="lg" className="bg-gradient-to-r from-sky-600 to-teal-500">
                                <Sparkles className="w-5 h-5 mr-2" />
                                เริ่มต้นใช้งานฟรี
                            </Button>
                        </a>
                    </div>
                </div>

                {/* ✅ animation แยกไป client */}
                <AnimatedCards covers={mockAnimeCovers} />
            </section>

            {/* Features */}
            <section className="container mx-auto px-6 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">ฟีเจอร์ครบครัน</h2>
                    <p className="text-slate-400">ทุกสิ่งที่คุณต้องการ</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {features.map((feature, i) => (
                        <div
                            key={i}
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

            {/* Footer */}
            <footer className="text-center py-8 text-slate-400 text-sm">
                © 2026 ANITRACK
            </footer>
        </div>
    );
}