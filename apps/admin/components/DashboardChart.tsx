'use client'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

interface DataPoint {
  date: string
  listings: number
  users: number
}

interface Props {
  data: DataPoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-raised))] p-3 shadow-elevated text-xs">
      <p className="font-medium text-[hsl(var(--foreground))] mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[hsl(var(--muted-foreground))] capitalize">{p.name}:</span>
          <span className="font-medium text-[hsl(var(--foreground))]">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function DashboardChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradListings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#22D3EE" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(228 12% 14%)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'hsl(220 12% 45%)' }}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(220 12% 45%)' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="listings"
          stroke="#8B5CF6"
          strokeWidth={2}
          fill="url(#gradListings)"
          dot={false}
          activeDot={{ r: 4, fill: '#8B5CF6', strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="users"
          stroke="#22D3EE"
          strokeWidth={2}
          fill="url(#gradUsers)"
          dot={false}
          activeDot={{ r: 4, fill: '#22D3EE', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
