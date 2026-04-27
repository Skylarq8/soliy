import { StatsCard } from '@/components/StatsCard'

interface Stats {
  total_users: number
  active_listings: number
  completed_swaps: number
  pending_verifications: number
}

const EMPTY_STATS: Stats = { total_users: 0, active_listings: 0, completed_swaps: 0, pending_verifications: 0 }

async function getStats(): Promise<Stats> {
  if (!process.env.API_URL) return EMPTY_STATS
  try {
    const res = await fetch(`${process.env.API_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${process.env.ADMIN_SERVICE_KEY}` },
      cache: 'no-store',
    })
    if (!res.ok) return EMPTY_STATS
    return res.json()
  } catch {
    return EMPTY_STATS
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Нийт хэрэглэгч" value={stats.total_users}            icon="👥" />
        <StatsCard label="Идэвхтэй зарууд" value={stats.active_listings}       icon="📦" />
        <StatsCard label="Дуусгасан swap"  value={stats.completed_swaps}       icon="✅" />
        <StatsCard label="Хүлээж байгаа"   value={stats.pending_verifications} icon="🔍" color="amber" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">Хурдан холбоос</h2>
          <div className="space-y-2 text-sm">
            <a href="/verifications" className="block text-violet-400 hover:underline">→ Баталгаажуулалтын жагсаалт</a>
            <a href="/users" className="block text-violet-400 hover:underline">→ Хэрэглэгчид</a>
            <a href="/listings" className="block text-violet-400 hover:underline">→ Зарууд</a>
            <a href="/reports" className="block text-violet-400 hover:underline">→ Мэдээлсэн агуулга</a>
          </div>
        </div>
      </div>
    </div>
  )
}
