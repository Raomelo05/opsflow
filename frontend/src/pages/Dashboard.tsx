import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { listarTickets } from '../services/tickets'
import { buscarInsightsSemanais } from '../services/insights'
import type { Ticket } from '../types'

interface Indicadores {
  abertos: number
  fechados: number
  criticos: number
  slaVencidos: number
}

const STATUS_ATIVO = new Set(['aberto', 'em_andamento', 'aguardando_confirmacao', 'reaberto'])

function calcularIndicadores(tickets: Ticket[]): Indicadores {
  const agora = Date.now()
  return {
    abertos: tickets.filter((t) => t.status === 'aberto').length,
    fechados: tickets.filter((t) => t.status === 'fechado' || t.status === 'resolvido').length,
    criticos: tickets.filter((t) => t.prioridade === 'critica' && STATUS_ATIVO.has(t.status)).length,
    slaVencidos: tickets.filter(
      (t) => t.prazo_sla && STATUS_ATIVO.has(t.status) && new Date(t.prazo_sla).getTime() < agora,
    ).length,
  }
}

function StatCard({ label, valor, destaque }: { label: string; valor: string | number; destaque?: 'critico' | 'normal' }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="text-sm text-slate">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${destaque === 'critico' ? 'text-priority-critica' : 'text-ink'}`}>
        {valor}
      </p>
    </div>
  )
}

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [tempoMedio, setTempoMedio] = useState<number | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([listarTickets(), buscarInsightsSemanais()])
      .then(([listaTickets, insights]) => {
        setTickets(listaTickets)
        setTempoMedio(insights.tempo_medio_resolucao_horas)
      })
      .catch(() => setErro('Não foi possível carregar os dados do dashboard.'))
      .finally(() => setCarregando(false))
  }, [])

  if (carregando) return <p className="text-sm text-slate">Carregando indicadores...</p>
  if (erro) return <p className="text-sm text-priority-critica">{erro}</p>

  const indicadores = calcularIndicadores(tickets)

  const porStatus = ['aberto', 'em_andamento', 'aguardando_confirmacao', 'resolvido', 'fechado', 'reaberto'].map(
    (status) => ({
      status,
      total: tickets.filter((t) => t.status === status).length,
    }),
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="text-sm text-slate">Visão geral dos chamados e indicadores operacionais.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Tickets abertos" valor={indicadores.abertos} />
        <StatCard label="Tickets fechados" valor={indicadores.fechados} />
        <StatCard label="Chamados críticos" valor={indicadores.criticos} destaque={indicadores.criticos > 0 ? 'critico' : 'normal'} />
        <StatCard label="SLA vencidos" valor={indicadores.slaVencidos} destaque={indicadores.slaVencidos > 0 ? 'critico' : 'normal'} />
        <StatCard
          label="Tempo médio de resolução"
          valor={tempoMedio != null ? `${tempoMedio}h` : '—'}
        />
      </div>

      <div className="rounded-lg border border-border bg-white p-5">
        <h2 className="mb-4 text-sm font-medium text-ink">Tickets por status</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={porStatus}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EA" />
            <XAxis dataKey="status" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="total" fill="#3457D5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
