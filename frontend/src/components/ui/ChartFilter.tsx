interface ChartFilterProps {
  opcoes: { valor: string; label: string }[]
  valorAtivo: string
  onChange: (valor: string) => void
}

export function ChartFilter({ opcoes, valorAtivo, onChange }: ChartFilterProps) {
  return (
    <div className="flex rounded-md border border-border bg-background-secondary p-0.5 text-xs">
      {opcoes.map((op) => (
        <button
          key={op.valor}
          onClick={() => onChange(op.valor)}
          className={`rounded px-2.5 py-1 font-medium transition-colors duration-150 ${
            valorAtivo === op.valor ? 'bg-surface text-ink shadow-sm' : 'text-ink-secondary hover:text-ink'
          }`}
        >
          {op.label}
        </button>
      ))}
    </div>
  )
}
