import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { buscarInsightsSemanais } from '../services/insights'
import type { InsightsResponse } from '../types'

export default function Improvements() {
  const [insights, setInsights] = useState<InsightsResponse | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    buscarInsightsSemanais().then(setInsights).finally(() => setCarregando(false))
  }, [])

  if (carregando) return <p className="text-sm text-slate">Calculando insights...</p>
  if (!insights) return <p className="text-sm text-priority-critica">Não foi possível carregar os insights.</p>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Dashboard de melhorias</h1>
        <p className="text-sm text-slate">
          Baseado nos últimos tickets ({insights.periodo}) — {insights.total_tickets} chamados analisados.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {insights.top_categorias.map((c, idx) => (
          <div key={c.categoria} className="rounded-lg border border-border bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-slate">
              {idx === 0 ? 'Problema mais frequente' : `#${idx + 1} mais frequente`}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-ink">{c.categoria}</h2>
            <p className="mt-1 font-mono text-sm text-primary">
              {c.ocorrencias} ocorrências · {c.percentual}%
            </p>
          </div>
        ))}
        {insights.top_categorias.length === 0 && (
          <p className="text-sm text-slate">Sem volume suficiente de tickets no período.</p>
        )}
      </div>

      {insights.top_categorias.length > 0 && (
        <div className="rounded-lg border border-border bg-white p-5">
          <h2 className="mb-4 text-sm font-medium text-ink">Distribuição por categoria</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={insights.top_categorias}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EA" />
              <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="ocorrencias" fill="#3457D5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-lg border border-accent/40 bg-accent/10 p-5">
        <h2 className="mb-3 text-sm font-medium text-ink">Sugestões de melhoria</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-ink">
          {insights.recomendacoes.map((r, idx) => (
            <li key={idx}>{r}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate">
          Estimativas baseadas em regras simples de concentração de volume (ver docs/regras-de-negocio.md, RN16) —
          não substituem uma análise financeira validada.
        </p>
      </div>
    </div>
  )
}
