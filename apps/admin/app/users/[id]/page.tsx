import { notFound } from 'next/navigation'
import type { User } from '@swaply/types'

async function getUser(id: string): Promise<User | null> {
  const res = await fetch(`${process.env.API_URL}/api/admin/users?q=${id}`, {
    headers: { Authorization: `Bearer ${process.env.ADMIN_SERVICE_KEY}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const { users } = await res.json()
  return users?.[0] ?? null
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUser(id)
  if (!user) notFound()

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">@{user.nickname}</h1>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-3 mb-6">
        <Row label="ID" value={user.id} />
        <Row label="Safe Score" value={`★ ${user.safe_score}`} />
        <Row label="Swap Count" value={String(user.swap_count)} />
        <Row label="Admin" value={user.is_admin ? 'Тийм' : 'Үгүй'} />
        <Row label="Бүртгэгдсэн" value={new Date(user.created_at).toLocaleString('mn-MN')} />
      </div>

      <form action={`/api/proxy/admin/users/${user.id}/ban`} method="POST">
        <button
          type="submit"
          className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          Хаах
        </button>
      </form>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
