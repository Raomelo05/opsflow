interface ChartTooltipProps {
  active?: boolean
  label?: string | number
  payload?: { name: string; value: number | string; color?: string }[]
  formatter?: (value: number | string, name: string) => string
}

/** Tooltip customizado para os gráficos Recharts — usado via `content={<ChartTooltip />}`. */
export function ChartTooltip({ active, label, payload, formatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 shadow-lg">
      {label !== undefined && <p className="mb-1 text-xs font-medium text-ink-secondary">{label}</p>}
      <div className="space-y-0.5">
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-ink-secondary">{item.name}:</span>
            <span className="font-mono font-medium text-ink">
              {formatter ? formatter(item.value, item.name) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
