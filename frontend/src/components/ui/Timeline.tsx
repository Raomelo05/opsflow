import type { ReactNode } from 'react'

export interface TimelineItem {
  id: string | number
  title: ReactNode
  timestamp: string
  icon?: ReactNode
}

export function Timeline({ items, emptyLabel }: { items: TimelineItem[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-secondary">{emptyLabel}</p>
  }

  return (
    <ol className="relative space-y-5 border-l border-border pl-5">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute -left-[26px] top-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-surface bg-primary" />
          <div className="text-sm text-ink">{item.title}</div>
          <p className="mt-0.5 font-mono text-xs text-ink-secondary">{item.timestamp}</p>
        </li>
      ))}
    </ol>
  )
}
