import type { InputHTMLAttributes } from 'react'
import { Search } from 'lucide-react'

export function SearchBar({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-disabled" />
      <input
        type="text"
        className="w-full rounded-sm border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-disabled transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        {...props}
      />
    </div>
  )
}
