import Link from 'next/link'
import Image from 'next/image'

async function getListings(status = 'active') {
  if (!process.env.API_URL) return []
  try {
    const res = await fetch(`${process.env.API_URL}/api/admin/listings?status=${status}`, {
      headers: { Authorization: `Bearer ${process.env.ADMIN_SERVICE_KEY}` },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const { listings } = await res.json()
    return listings ?? []
  } catch {
    return []
  }
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'active' } = await searchParams
  const listings = await getListings(status)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Зарууд</h1>
        <div className="flex gap-2">
          {['active', 'swapped', 'sold', 'archived'].map(s => (
            <Link
              key={s}
              href={`?status=${s}`}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                status === s ? 'bg-violet-600 text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Зар</th>
              <th className="px-4 py-3 text-left font-medium">Хэрэглэгч</th>
              <th className="px-4 py-3 text-left font-medium">Категори</th>
              <th className="px-4 py-3 text-left font-medium">Үнэ</th>
              <th className="px-4 py-3 text-left font-medium">Огноо</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {listings.map((l: any) => (
              <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {l.photos?.[0] && (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <Image src={l.photos[0]} alt={l.title} fill className="object-cover" />
                      </div>
                    )}
                    <span className="font-medium truncate max-w-48">{l.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">@{l.users?.nickname}</td>
                <td className="px-4 py-3 capitalize">{l.category}</td>
                <td className="px-4 py-3">{l.price ? `${l.price.toLocaleString()}₮` : 'Swap only'}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(l.created_at).toLocaleDateString('mn-MN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
