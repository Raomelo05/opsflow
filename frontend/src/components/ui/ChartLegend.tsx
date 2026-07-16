export interface LegendItem {
  key: string
  label: string
  color: string
}

interface ChartLegendProps {
  items: LegendItem[]
  disabledKeys: Set<string>
  onToggle: (key: string) => void
}

/** Legenda clicável: clicar em um item ativa/desativa aquela série no gráfico. */
export function ChartLegend({ items, disabledKeys, onToggle }: ChartLegendProps) {
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
      {items.map((item) => {
        const desativado = disabledKeys.has(item.key)
        return (
          <button
            key={item.key}
            onClick={() => onToggle(item.key)}
            className={`flex items-center gap-1.5 text-xs transition-opacity duration-150 ${
              desativado ? 'opacity-40' : 'opacity-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-ink-secondary">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
