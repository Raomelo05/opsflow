import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts'
import { Lightbulb, TrendingUp } from 'lucide-react'
import { buscarInsightsSemanais } from '../services/insights'
import { PageHeader } from '../components/ui/PageHeader'
import { ChartCard } from '../components/ui/ChartCard'
import { ChartTooltip } from '../components/ui/ChartTooltip'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
import { COR_BORDA, COR_PRIMARIA, EIXO_TICK } from '../lib/chartTheme'
import type { InsightsResponse } from '../types'

export default function Improvements() {
  const [insights, setInsights] = useState<InsightsResponse | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    buscarInsightsSemanais().then(setInsights).finally(() => setCarregando(false))
  }, [])

  if (carregando) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard de melhorias" />
        <LoadingSkeleton rows={3} height={90} />
      </div>
    )
  }
  if (!insights) return <p className="text-sm text-danger">Não foi possível carregar os insights.</p>

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard de melhorias"
        subtitle={`Baseado nos últimos tickets (${insights.periodo}) — ${insights.total_tickets} chamados analisados.`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {insights.top_categorias.map((c, idx) => (
          <div key={c.categoria} className="rounded-lg border border-border bg-surface p-5 shadow-card">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-secondary">
              <TrendingUp className="h-3.5 w-3.5" />
              {idx === 0 ? 'Problema mais frequente' : `#${idx + 1} mais frequente`}
            </p>
            <h2 className="mt-1 text-lg font-bold text-ink">{c.categoria}</h2>
            <p className="mt-1 font-mono text-sm text-primary">
              {c.ocorrencias} ocorrências · {c.percentual}%
            </p>
          </div>
        ))}
        {insights.top_categorias.length === 0 && (
          <p className="text-sm text-ink-secondary">Sem volume suficiente de tickets no período.</p>
        )}
      </div>

      {insights.top_categorias.length > 0 && (
        <ChartCard title="Distribuição por categoria">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={insights.top_categorias}>
              <CartesianGrid strokeDasharray="3 3" stroke={COR_BORDA} vertical={false} />
              <XAxis dataKey="categoria" tick={EIXO_TICK} axisLine={{ stroke: COR_BORDA }} tickLine={false} />
              <YAxis allowDecimals={false} tick={EIXO_TICK} axisLine={false} tickLine={false} width={28} />
              <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-background-secondary)' }} />
              <Bar dataKey="ocorrencias" name="Ocorrências" fill={COR_PRIMARIA} radius={[4, 4, 0, 0]} animationDuration={400} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      <div className="rounded-lg border border-warning/30 bg-warning/10 p-5">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Lightbulb className="h-4 w-4 text-warning" />
          Sugestões de melhoria
        </h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-ink">
          {insights.recomendacoes.map((r, idx) => (
            <li key={idx}>{r}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-secondary">
          Estimativas baseadas em regras simples de concentração de volume (ver docs/regras-de-negocio.md, RN16) —
          não substituem uma análise financeira validada.
        </p>
      </div>
    </div>
  )
}
