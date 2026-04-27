import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const { record } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const [{ data: reviews }, { data: user }] = await Promise.all([
    supabase.from('reviews').select('rating').eq('reviewee_id', record.reviewee_id),
    supabase.from('users').select('swap_count').eq('id', record.reviewee_id).single(),
  ])

  if (!reviews || !user) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })

  const avgRating = reviews.length
    ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length
    : 0

  const safeScore = Math.min(100, user.swap_count * 0.5 + avgRating * 0.3 * 20)

  await supabase.from('users').update({ safe_score: safeScore }).eq('id', record.reviewee_id)

  return new Response(JSON.stringify({ ok: true, safe_score: safeScore }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
