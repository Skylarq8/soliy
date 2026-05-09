import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Package } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

export type Column<T, K extends keyof T = keyof T> = {
  [P in K]: {
    key: P
    label: string
    render?: (value: T[P], row: T) => React.ReactNode
    className?: string
  }
}[K]

interface Props<T extends { id: string }> {
  data: T[]
  columns: readonly Column<T>[]
  rowHref?: (id: string) => string
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  rowHref,
  emptyTitle = 'No data',
  emptyDescription,
  className,
}: Props<T>) {
  if (data.length === 0) {
    return <EmptyState icon={Package} title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className={cn('rounded-2xl border border-[hsl(var(--border))] overflow-hidden', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            {columns.map(col => (
              <th
                key={String(col.key)}
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]',
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(var(--border))]">
          {data.map(row => {
            const href = rowHref?.(row.id)
            return (
              <tr
                key={row.id}
                className="group hover:bg-[hsl(var(--surface))] transition-colors duration-100"
              >
                {columns.map((col, i) => {
                  const value = row[col.key]
                  const content = col.render ? col.render(value, row) : String(value ?? '—')
                  return (
                    <td key={String(col.key)} className={cn('px-4 py-3 text-sm', col.className)}>
                      {href && i === 0 ? (
                        <Link
                          href={href}
                          className="hover:text-violet-400 transition-colors font-medium"
                        >
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
