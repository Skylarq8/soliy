import React from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: string[]
  error?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', ...props }, ref) => (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <select
        ref={ref}
        {...props}
        className={`w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${error ? 'border-red-500' : ''} ${className}`}
      >
        <option value="">Select…</option>
        {options.map(o => <option key={o} value={o} className="capitalize">{o}</option>)}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'
