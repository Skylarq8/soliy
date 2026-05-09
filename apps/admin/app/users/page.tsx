import { DataTable } from '@/components/DataTable'
import type { Column } from '@/components/DataTable'
import type { User } from '@swaply/types'

async function getUsers(q?: string): Promise<User[]> {
  if (!process.env.API_URL) return []
  try {
    const qs = q ? `?q=${encodeURIComponent(q)}` : ''
    const res = await fetch(`${process.env.API_URL}/api/admin/users${qs}`, {
      headers: { Authorization: `Bearer ${process.env.ADMIN_SERVICE_KEY}` },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const { users } = await res.json()
    return users ?? []
  } catch {
    return []
  }
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const users = await getUsers(q)

  const columns = [
    { key: 'nickname', label: 'Nickname' },
    { key: 'safe_score', label: 'Safe Score', render: (v: number) => `★ ${v?.toFixed(0)}` },
    { key: 'swap_count', label: 'Swaps' },
    { key: 'created_at', label: 'Бүртгэгдсэн', render: (v: string) => new Date(v).toLocaleDateString('mn-MN') },
    { key: 'is_admin', label: 'Admin', render: (v: boolean) => v ? '✓' : '—' },
  ] satisfies Column<User>[]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Хэрэглэгчид</h1>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Nickname хайх…"
            className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button type="submit" className="rounded-xl bg-violet-600 px-4 py-1.5 text-sm text-white hover:bg-violet-700">
            Хайх
          </button>
        </form>
      </div>

      <DataTable data={users} columns={columns} rowHref={id => `/users/${id}`} />
    </div>
  )
}
