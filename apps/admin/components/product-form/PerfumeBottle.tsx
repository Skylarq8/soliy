'use client'
import { Sparkles } from 'lucide-react'

interface Props {
  value: number  // 0-100
  onChange: (v: number) => void
}

const PRESETS = [100, 90, 75, 50, 25, 10]

export function PerfumeBottle({ value, onChange }: Props) {
  const clamped = Math.max(0, Math.min(100, value))
  const fillHeight = (clamped / 100) * 80  // max 80px fill inside 100px bottle body

  // Gradient color based on fill level
  const liquidGradient =
    clamped >= 60
      ? ['#C084FC', '#A855F7', '#7C3AED']
      : clamped >= 30
      ? ['#E879F9', '#C026D3', '#A21CAF']
      : ['#F472B6', '#EC4899', '#DB2777']

  return (
    <div className="space-y-4">
      <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
        Volume Remaining
      </label>

      <div className="flex items-center gap-8">
        {/* Perfume bottle SVG */}
        <div className="relative flex-shrink-0 flex flex-col items-center gap-2">
          <svg width="80" height="140" viewBox="0 0 80 140">
            <defs>
              <linearGradient id="liquidGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor={liquidGradient[0]} />
                <stop offset="50%"  stopColor={liquidGradient[1]} />
                <stop offset="100%" stopColor={liquidGradient[2]} />
              </linearGradient>
              <linearGradient id="bottleGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.08)" />
                <stop offset="50%"  stopColor="rgba(255,255,255,0.03)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
              </linearGradient>
              <clipPath id="bottleClip">
                <path d="M18 38 Q15 42 14 50 L14 122 Q14 130 20 132 L60 132 Q66 130 66 122 L66 50 Q65 42 62 38 L52 30 L50 20 L30 20 L28 30 Z" />
              </clipPath>
            </defs>

            {/* Bottle cap */}
            <rect x="26" y="10" width="28" height="14" rx="4" fill="hsl(228 12% 18%)" stroke="hsl(228 10% 22%)" strokeWidth="1" />
            <rect x="22" y="22" width="36" height="8" rx="3" fill="hsl(228 14% 20%)" />

            {/* Bottle neck */}
            <path d="M28 30 L52 30 L62 38 L18 38 Z" fill="hsl(228 12% 15%)" stroke="hsl(228 10% 22%)" strokeWidth="1" />

            {/* Bottle body outline */}
            <path
              d="M18 38 Q15 42 14 50 L14 122 Q14 130 20 132 L60 132 Q66 130 66 122 L66 50 Q65 42 62 38 Z"
              fill="hsl(228 14% 12%)"
              stroke="hsl(228 10% 22%)"
              strokeWidth="1.5"
            />

            {/* Liquid fill (animated height) */}
            <rect
              x="14"
              y={132 - fillHeight}
              width="52"
              height={fillHeight}
              fill="url(#liquidGrad)"
              clipPath="url(#bottleClip)"
              style={{
                transition: 'y 0.6s cubic-bezier(0.34,1.56,0.64,1), height 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                opacity: 0.85,
              }}
            />

            {/* Liquid surface shimmer */}
            {fillHeight > 5 && (
              <ellipse
                cx="40"
                cy={132 - fillHeight}
                rx="22"
                ry="3"
                fill={liquidGradient[0]}
                opacity={0.5}
                clipPath="url(#bottleClip)"
                style={{ transition: 'cy 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}
              />
            )}

            {/* Glass highlight */}
            <path
              d="M18 38 Q15 42 14 50 L14 122 Q14 130 20 132 L60 132 Q66 130 66 122 L66 50 Q65 42 62 38 Z"
              fill="url(#bottleGrad)"
              stroke="none"
            />

            {/* Sparkle accents */}
            {clamped > 20 && (
              <>
                <circle cx="24" cy={132 - fillHeight + 12} r="2" fill={liquidGradient[0]} opacity={0.6} style={{ transition: 'cy 0.6s' }} />
                <circle cx="56" cy={132 - fillHeight + 20} r="1.5" fill={liquidGradient[0]} opacity={0.4} style={{ transition: 'cy 0.6s' }} />
              </>
            )}
          </svg>

          {/* Percentage label */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold tabular-nums"
            style={{
              borderColor: `${liquidGradient[1]}40`,
              background: `${liquidGradient[2]}15`,
              color: liquidGradient[0],
            }}
          >
            <Sparkles className="w-3 h-3" />
            {clamped}%
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-4">
          <div className="space-y-1.5">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={clamped}
              onChange={e => onChange(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${liquidGradient[1]} 0%, ${liquidGradient[1]} ${clamped}%, hsl(228 12% 18%) ${clamped}%, hsl(228 12% 18%) 100%)`,
              }}
            />
            <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))]">
              <span>Empty</span>
              <span>Half</span>
              <span>Full</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => onChange(p)}
                className={[
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                  clamped === p
                    ? 'text-white border-transparent'
                    : 'text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))]',
                ].join(' ')}
                style={clamped === p
                  ? { background: liquidGradient[1], boxShadow: `0 0 8px ${liquidGradient[1]}50` }
                  : {}
                }
              >
                {p}%
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              value={clamped}
              onChange={e => onChange(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="input-base w-20 text-center font-mono font-bold text-base py-2"
              style={{ color: liquidGradient[0] }}
            />
            <span className="text-sm text-[hsl(var(--muted-foreground))]">% full</span>
          </div>
        </div>
      </div>
    </div>
  )
}
