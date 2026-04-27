import { supabaseAdmin } from '@swaply/db'

export async function recalcSafeScore(userId: string): Promise<void> {
  const [{ data: reviews }, { data: user }] = await Promise.all([
    supabaseAdmin.from('reviews').select('rating').eq('reviewee_id', userId),
    supabaseAdmin.from('users').select('swap_count').eq('id', userId).single(),
  ])

  if (!reviews || !user) return

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  const safeScore = Math.min(100,
    user.swap_count * 0.5 + avgRating * 0.3 * 20
  )

  await supabaseAdmin
    .from('users')
    .update({ safe_score: safeScore })
    .eq('id', userId)
}
