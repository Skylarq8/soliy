'use client'
import { useEffect, useRef } from 'react'
import { Droplets } from 'lucide-react'

interface Props {
  value: number  // 0-100
  onChange: (v: number) => void
  label?: string
}

function getColor(pct: number) {
  if (pct >= 70) return { stroke: '#10B981', fill: '#10B981', text: '#34D399', label: 'Mostly Full' }
  if (pct >= 40) return { stroke: '#F59E0B', fill: '#F59E0B', text: '#FBBF24', label: 'Half Used' }
  if (pct >= 20) return { stroke: '#F97316', fill: '#F97316', text: '#FB923C', label: 'Getting Low' }
  return { stroke: '#EF4444', fill: '#EF4444', text: '#F87171', label: 'Almost Empty' }
}

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function UsagePercentage({ value, onChange, label = 'Usage Remaining' }: Props) {
  const clampedValue = Math.max(0, Math.min(100, value))
  const dashOffset    = CIRCUMFERENCE * (1 - clampedValue / 100)
  const color         = getColor(clampedValue)

  const presets = [100, 90, 75, 60, 50, 40, 25, 10]

  return (
    <div className="space-y-4">
      <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
        {label}
      </label>

      <div className="flex items-center gap-6">
        {/* SVG Circle Progress */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {/* Background ring */}
            <circle
              cx="70" cy="70" r={RADIUS}
              fill="none"
              stroke="hsl(228 12% 14%)"
              strokeWidth="10"
            />
            {/* Progress ring */}
            <circle
              cx="70" cy="70" r={RADIUS}
              fill="none"
              stroke={color.stroke}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 70 70)"
              style={{
                transition: 'stroke-dashoffset 0.5s cubic-bezier(0.34,1.56,0.64,1), stroke 0.3s',
                filter: `drop-shadow(0 0 6px ${color.stroke}60)`,
              }}
            />
            {/* Droplets icon background */}
            <circle
              cx="70" cy="70" r="36"
              fill={`${color.fill}15`}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Droplets
              className="w-5 h-5 mb-1"
              style={{ color: color.text, transition: 'color 0.3s' }}
            />
            <span
              className="text-2xl font-bold leading-none tabular-nums"
              style={{ color: color.text, transition: 'color 0.3s' }}
            >
              {clampedValue}%
            </span>
            <span className="text-[10px] font-medium mt-0.5" style={{ color: color.text, opacity: 0.7, transition: 'color 0.3s' }}>
              {color.label}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-3">
          {/* Slider */}
          <div className="space-y-1.5">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={clampedValue}
              onChange={e => onChange(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${color.fill} 0%, ${color.fill} ${clampedValue}%, hsl(228 12% 18%) ${clampedValue}%, hsl(228 12% 18%) 100%)`,
                accentColor: color.fill,
              }}
            />
            <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))]">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Preset buttons */}
          <div>
            <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1.5">
              Quick select
            </p>
            <div className="flex flex-wrap gap-1.5">
              {presets.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChange(p)}
                  className={[
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                    clampedValue === p
                      ? 'text-white border-transparent'
                      : 'text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:border-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
                  ].join(' ')}
                  style={clampedValue === p
                    ? { background: color.fill, boxShadow: `0 0 8px ${color.fill}50` }
                    : {}
                  }
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          {/* Manual input */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              value={clampedValue}
              onChange={e => onChange(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="input-base w-20 text-center font-mono font-bold text-base py-2"
              style={{ color: color.text }}
            />
            <span className="text-sm text-[hsl(var(--muted-foreground))]">%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
