interface LoadingSkeletonProps {
  rows?: number
  height?: number
  className?: string
}

export function LoadingSkeleton({ rows = 3, height = 16, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-2.5 ${className}`} role="status" aria-label="Carregando">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-md bg-background-secondary"
          style={{ height, width: i === rows - 1 && rows > 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  )
}
