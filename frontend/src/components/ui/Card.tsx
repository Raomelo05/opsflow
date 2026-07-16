import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md'
}

const PADDING_CLASSES = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
}

export function Card({ children, hoverable, padding = 'md', className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface shadow-card transition-shadow duration-200 ${
        hoverable ? 'hover:shadow-hover' : ''
      } ${PADDING_CLASSES[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
