import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertTriangle, CheckCircle2, Inbox, ShieldCheck, Timer } from 'lucide-react'
import { listarTickets } from '../services/tickets'
import { listarCategorias } from '../services/categories'
import { buscarInsightsSemanais } from '../services/insights'
import { PageHeader } from '../components/ui/PageHeader'
import { KpiCard } from '../components/ui/KpiCard'
import { ChartCard } from '../components/ui/ChartCard'
import { ChartFilter } from '../components/ui/ChartFilter'
import { ChartTooltip } from '../components/ui/ChartTooltip'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
import { CORES_PRIORIDADE, CORES_STATUS, COR_BORDA, COR_PRIMARIA, EIXO_TICK } from '../lib/chartTheme'
import {
  conformidadeSla,
  distribuicaoStatus,
  filtrarPorPeriodo,
  prioridadePorCategoria,
  tempoMedioPorDia,
  ticketsPorCategoria,
  ticketsPorDia,
} from '../lib/dashboardData'
import type { Categoria, Ticket } from '../types'

const PERIODO_OPCOES = [
  { valor: '7', label: '7 dias' },
  { valor: '30', label: '30 dias' },
  { valor: '90', label: '90 dias' },
]

const STATUS_ATIVO = new Set(['aberto', 'em_andamento', 'aguardando_confirmacao', 'reaberto'])
const LABEL_STATUS: Record<string, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  aguardando_confirmacao: 'Aguardando usuário',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
  reaberto: 'Reaberto',
}

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [tempoMedio, setTempoMedio] = useState<number | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [periodo, setPeriodo] = useState('30')

  useEffect(() => {
    Promise.all([listarTickets(), listarCategorias(), buscarInsightsSemanais()])
      .then(([listaTickets, listaCategorias, insights]) => {
        setTickets(listaTickets)
        setCategorias(listaCategorias)
        setTempoMedio(insights.tempo_medio_resolucao_horas)
      })
      .catch(() => setErro('Não foi possível carregar os dados do dashboard.'))
      .finally(() => setCarregando(false))
  }, [])

  const dias = Number(periodo)
  const ticketsPeriodo = useMemo(() => filtrarPorPeriodo(tickets, dias), [tickets, dias])

  const indicadores = useMemo(() => {
    const agora = Date.now()
    return {
      abertos: tickets.filter((t) => t.status === 'aberto').length,
      fechados: tickets.filter((t) => t.status === 'fechado' || t.status === 'resolvido').length,
      criticos: tickets.filter((t) => t.prioridade === 'critica' && STATUS_ATIVO.has(t.status)).length,
      slaVencidos: tickets.filter(
        (t) => t.prazo_sla && STATUS_ATIVO.has(t.status) && new Date(t.prazo_sla).getTime() < agora,
      ).length,
    }
  }, [tickets])

  const serieTemporal = useMemo(() => ticketsPorDia(ticketsPeriodo, dias), [ticketsPeriodo, dias])
  const serieTempoMedio = useMemo(() => tempoMedioPorDia(ticketsPeriodo, dias), [ticketsPeriodo, dias])
  const categoriaData = useMemo(() => ticketsPorCategoria(ticketsPeriodo, categorias), [ticketsPeriodo, categorias])
  const statusData = useMemo(() => distribuicaoStatus(ticketsPeriodo), [ticketsPeriodo])
  const prioridadeData = useMemo(() => prioridadePorCategoria(ticketsPeriodo, categorias), [ticketsPeriodo, categorias])
  const slaPercentual = useMemo(() => conformidadeSla(ticketsPeriodo), [ticketsPeriodo])

  if (carregando) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" subtitle="Visão geral dos chamados e indicadores operacionais." />
        <LoadingSkeleton rows={4} height={90} />
      </div>
    )
  }
  if (erro) return <p className="text-sm text-danger">{erro}</p>

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral dos chamados e indicadores operacionais."
        actions={<ChartFilter opcoes={PERIODO_OPCOES} valorAtivo={periodo} onChange={setPeriodo} />}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <KpiCard label="Tickets abertos" value={indicadores.abertos} icon={Inbox} />
        <KpiCard label="Tickets fechados" value={indicadores.fechados} icon={CheckCircle2} tone="success" />
        <KpiCard
          label="Chamados críticos"
          value={indicadores.criticos}
          icon={AlertTriangle}
          tone={indicadores.criticos > 0 ? 'danger' : 'default'}
        />
        <KpiCard
          label="SLA vencidos"
          value={indicadores.slaVencidos}
          icon={ShieldCheck}
          tone={indicadores.slaVencidos > 0 ? 'danger' : 'default'}
        />
        <KpiCard label="Tempo médio de resolução" value={tempoMedio != null ? `${tempoMedio}h` : '—'} icon={Timer} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Tickets por período" subtitle={`Últimos ${dias} dias`}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={serieTemporal}>
                <defs>
                  <linearGradient id="gradienteTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COR_PRIMARIA} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={COR_PRIMARIA} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COR_BORDA} vertical={false} />
                <XAxis dataKey="data" tick={EIXO_TICK} axisLine={{ stroke: COR_BORDA }} tickLine={false} />
                <YAxis allowDecimals={false} tick={EIXO_TICK} axisLine={false} tickLine={false} width={28} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="tickets"
                  name="Tickets criados"
                  stroke={COR_PRIMARIA}
                  strokeWidth={2}
                  fill="url(#gradienteTickets)"
                  animationDuration={400}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="SLA" subtitle="% de tickets dentro do prazo">
          <div className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <RadialBarChart
                innerRadius="72%"
                outerRadius="100%"
                data={[{ name: 'SLA', value: slaPercentual }]}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={12}
                  fill={slaPercentual >= 80 ? 'var(--color-success)' : slaPercentual >= 50 ? 'var(--color-warning)' : 'var(--color-danger)'}
                  background={{ fill: 'var(--color-background-secondary)' }}
                  animationDuration={500}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-ink">{slaPercentual}%</span>
              <span className="text-xs text-ink-secondary">dentro do prazo</span>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Tickets por categoria" subtitle="Volume total no período">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoriaData} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COR_BORDA} horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={EIXO_TICK} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="categoria" tick={EIXO_TICK} axisLine={false} tickLine={false} width={110} />
              <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-background-secondary)' }} />
              <Bar dataKey="total" name="Tickets" fill={COR_PRIMARIA} radius={[0, 4, 4, 0]} animationDuration={400} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribuição dos status" subtitle="Composição atual no período">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="total"
                nameKey="status"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
                animationDuration={400}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.status} fill={CORES_STATUS[entry.status]} stroke="var(--color-surface)" strokeWidth={2} />
                ))}
              </Pie>
              <RechartsTooltip
                content={
                  <ChartTooltip
                    formatter={(value) => `${value} ticket${Number(value) === 1 ? '' : 's'}`}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
            {statusData.map((d) => (
              <span key={d.status} className="flex items-center gap-1.5 text-xs text-ink-secondary">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CORES_STATUS[d.status] }} />
                {LABEL_STATUS[d.status]} ({d.total})
              </span>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Tempo médio de resolução" subtitle="Horas, por dia de resolução">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={serieTempoMedio}>
              <defs>
                <linearGradient id="gradienteTempo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-info)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-info)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COR_BORDA} vertical={false} />
              <XAxis dataKey="data" tick={EIXO_TICK} axisLine={{ stroke: COR_BORDA }} tickLine={false} />
              <YAxis tick={EIXO_TICK} axisLine={false} tickLine={false} width={28} unit="h" />
              <RechartsTooltip content={<ChartTooltip formatter={(v) => `${v}h`} />} />
              <Area
                type="monotone"
                dataKey="horas"
                name="Tempo médio"
                stroke="var(--color-info)"
                strokeWidth={2}
                fill="url(#gradienteTempo)"
                connectNulls
                animationDuration={400}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Chamados por prioridade" subtitle="Distribuição por categoria">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={prioridadeData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COR_BORDA} vertical={false} />
              <XAxis dataKey="categoria" tick={EIXO_TICK} axisLine={{ stroke: COR_BORDA }} tickLine={false} />
              <YAxis allowDecimals={false} tick={EIXO_TICK} axisLine={false} tickLine={false} width={28} />
              <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-background-secondary)' }} />
              <Bar dataKey="baixa" name="Baixa" stackId="p" fill={CORES_PRIORIDADE.baixa} animationDuration={400} />
              <Bar dataKey="media" name="Média" stackId="p" fill={CORES_PRIORIDADE.media} animationDuration={400} />
              <Bar dataKey="alta" name="Alta" stackId="p" fill={CORES_PRIORIDADE.alta} animationDuration={400} />
              <Bar dataKey="critica" name="Crítica" stackId="p" radius={[4, 4, 0, 0]} fill={CORES_PRIORIDADE.critica} animationDuration={400} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
