import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

export function ChartCard({ title, subtitle, actions, children }: ChartCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-ink-secondary">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  )
}
