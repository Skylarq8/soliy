import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@swaply/db'
import type { User } from '@swaply/types'
import { SafeScoreBadge } from '@/components/profile/SafeScoreBadge'
import { FollowButton } from '@/components/profile/FollowButton'

async function getUser(username: string): Promise<User | null> {
  const sb = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await sb
    .from('users')
    .select('id, name, nickname, avatar_url, bio, safe_score, swap_count, created_at')
    .eq('nickname', username)
    .single()
  return data as User | null
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const user = await getUser(username)
  if (!user) notFound()
  const displayName = user.name?.trim() || user.nickname

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-3xl font-bold text-violet-700 dark:text-violet-300 flex-shrink-0">
          {displayName[0].toUpperCase()}
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <SafeScoreBadge score={user.safe_score} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">@{user.nickname}</p>
          {user.bio && <p className="text-muted-foreground mt-1 text-sm">{user.bio}</p>}
          <p className="text-xs text-muted-foreground mt-1">{user.swap_count} swap хийсэн</p>
        </div>
        <FollowButton userId={user.id} />
      </div>

      {/* Listings tab — placeholder */}
      <div className="border-b border-border mb-4">
        <button className="pb-3 text-sm font-medium border-b-2 border-violet-600 text-violet-600">
          Зарууд
        </button>
      </div>
      <p className="text-muted-foreground text-sm text-center py-8">
        Зараа харахын тулд нэвтэрнэ үү
      </p>
    </div>
  )
}
