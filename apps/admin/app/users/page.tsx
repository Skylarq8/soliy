import Link from 'next/link'
import Image from 'next/image'
import { Users, Search, Star, ArrowRight } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

async function getUsers(q?: string, page = 1) {
  const supabase = createAdminClient()
  let query = supabase
    .from('users')
    .select('id, nickname, name, avatar_url, safe_score, swap_count, is_admin, created_at')
    .order('created_at', { ascending: false })

  if (q) query = query.ilike('nickname', `%${q}%`)

  const { data } = await query.range((page - 1) * 20, page * 20 - 1)
  return data ?? []
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q, page = '1' } = await searchParams
  const users = await getUsers(q, Number(page))

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        title="Users"
        description="Manage all registered marketplace users"
      />

      <div className="flex items-center gap-3 mb-5">
        <form className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by nickname…"
              className="input-base pl-8"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            Search
          </button>
        </form>
        <span className="text-xs text-[hsl(var(--muted-foreground))] ml-auto">
          {users.length} result{users.length !== 1 ? 's' : ''}
        </span>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description={q ? `No users matching "${q}".` : 'No users registered yet.'}
        />
      ) : (
        <div className="rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Swaps</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {users.map((u: any) => (
                <tr key={u.id} className="group hover:bg-[hsl(var(--surface))] transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/users/${u.id}`} className="flex items-center gap-3 group/link">
                      {u.avatar_url ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <Image src={u.avatar_url} alt={u.nickname} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                          {u.nickname?.[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium group-hover/link:text-violet-400 transition-colors">@{u.nickname}</p>
                        {u.name && <p className="text-xs text-[hsl(var(--muted-foreground))]">{u.name}</p>}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      <Star className="w-3.5 h-3.5" strokeWidth={2} />
                      {u.safe_score?.toFixed(1) ?? '0.0'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{u.swap_count ?? 0}</td>
                  <td className="px-4 py-3">
                    {u.is_admin
                      ? <Badge variant="purple">Admin</Badge>
                      : <Badge variant="muted">User</Badge>
                    }
                  </td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))] text-xs">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/users/${u.id}`}
                      className="inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-violet-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
