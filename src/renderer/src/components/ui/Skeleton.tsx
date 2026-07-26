interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps): JSX.Element {
  return <div className={`animate-pulse rounded-lg bg-[var(--surface-2)] ${className ?? 'h-4 w-full'}`} />
}

interface SkeletonRowsProps {
  rows?: number
  height?: string
}

export function SkeletonRows({ rows = 3, height = 'h-8' }: SkeletonRowsProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`${height} w-full`} />
      ))}
    </div>
  )
}
