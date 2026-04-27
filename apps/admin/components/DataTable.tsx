import Link from 'next/link'

interface Column<T> {
  key: keyof T
  label: string
  render?: (value: T[keyof T]) => string
}

interface Props<T extends { id: string }> {
  data: T[]
  columns: Column<T>[]
  rowHref?: (id: string) => string
}

export function DataTable<T extends { id: string }>({ data, columns, rowHref }: Props<T>) {
  if (data.length === 0) {
    return <p className="text-muted-foreground text-center py-12">Өгөгдөл байхгүй</p>
  }

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map(col => (
              <th key={String(col.key)} className="px-4 py-3 text-left font-medium text-muted-foreground">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map(row => {
            const href = rowHref?.(row.id)
            const Wrapper = href ? Link : 'tr'
            return (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                {columns.map(col => (
                  <td key={String(col.key)} className="px-4 py-3">
                    {href && col === columns[0] ? (
                      <Link href={href} className="hover:text-violet-400 transition-colors">
                        {col.render ? col.render(row[col.key]) : String(row[col.key] ?? '—')}
                      </Link>
                    ) : (
                      col.render ? col.render(row[col.key]) : String(row[col.key] ?? '—')
                    )}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
