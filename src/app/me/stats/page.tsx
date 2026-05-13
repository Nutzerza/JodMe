// app/u/[username]/stats/page.tsx

import StatsClient from '@/components/statPage/StatsClient';

export default async function StatsPage() {
    // ⚠️ ยังใช้ localStorage → server ทำอะไรไม่ได้จริง
    return <StatsClient />;
}