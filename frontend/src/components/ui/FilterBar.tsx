import type { ReactNode } from 'react'
import { SlidersHorizontal } from 'lucide-react'

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-card">
      <SlidersHorizontal className="hidden h-4 w-4 shrink-0 text-ink-disabled sm:block" />
      {children}
    </div>
  )
}
