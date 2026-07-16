import type { Categoria, Prioridade, StatusTicket, Ticket } from '../types'

const STATUS_ATIVO = new Set<StatusTicket>(['aberto', 'em_andamento', 'aguardando_confirmacao', 'reaberto'])
const ORDEM_STATUS: StatusTicket[] = ['aberto', 'em_andamento', 'aguardando_confirmacao', 'resolvido', 'fechado', 'reaberto']
const ORDEM_PRIORIDADE: Prioridade[] = ['baixa', 'media', 'alta', 'critica']

function chaveDia(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

/** Filtra tickets criados dentro dos últimos `dias` dias. */
export function filtrarPorPeriodo(tickets: Ticket[], dias: number): Ticket[] {
  const limite = Date.now() - dias * 24 * 60 * 60 * 1000
  return tickets.filter((t) => new Date(t.criado_em).getTime() >= limite)
}

/** Série "tickets criados por dia", incluindo dias sem nenhum ticket. */
export function ticketsPorDia(tickets: Ticket[], dias: number) {
  const buckets: Record<string, number> = {}
  const chaves: string[] = []
  for (let i = dias - 1; i >= 0; i--) {
    const chave = chaveDia(new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString())
    chaves.push(chave)
    buckets[chave] = 0
  }
  tickets.forEach((t) => {
    const chave = chaveDia(t.criado_em)
    if (chave in buckets) buckets[chave] += 1
  })
  return chaves.map((data) => ({ data, tickets: buckets[data] }))
}

/** Série "tempo médio de resolução por dia" (em horas), baseada em resolvido_em. */
export function tempoMedioPorDia(tickets: Ticket[], dias: number) {
  const buckets: Record<string, number[]> = {}
  const chaves: string[] = []
  for (let i = dias - 1; i >= 0; i--) {
    const chave = chaveDia(new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString())
    chaves.push(chave)
    buckets[chave] = []
  }
  tickets.forEach((t) => {
    if (!t.resolvido_em) return
    const chave = chaveDia(t.resolvido_em)
    if (!(chave in buckets)) return
    const horas = (new Date(t.resolvido_em).getTime() - new Date(t.criado_em).getTime()) / (1000 * 60 * 60)
    buckets[chave].push(horas)
  })
  return chaves.map((data) => {
    const valores = buckets[data]
    const media = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : null
    return { data, horas: media !== null ? Math.round(media * 10) / 10 : null }
  })
}

/** Contagem de tickets por categoria (para o gráfico de barras horizontais). */
export function ticketsPorCategoria(tickets: Ticket[], categorias: Categoria[]) {
  const nomePorId = Object.fromEntries(categorias.map((c) => [c.id, c.nome]))
  const contagem: Record<string, number> = {}
  tickets.forEach((t) => {
    const nome = nomePorId[t.categoria_id] ?? 'Sem categoria'
    contagem[nome] = (contagem[nome] ?? 0) + 1
  })
  return Object.entries(contagem)
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
}

/** Distribuição de status (para o donut chart). */
export function distribuicaoStatus(tickets: Ticket[]) {
  return ORDEM_STATUS.map((status) => ({
    status,
    total: tickets.filter((t) => t.status === status).length,
  })).filter((d) => d.total > 0)
}

/** Contagem de tickets por categoria, quebrada por prioridade (stacked bar). */
export function prioridadePorCategoria(tickets: Ticket[], categorias: Categoria[]) {
  const nomePorId = Object.fromEntries(categorias.map((c) => [c.id, c.nome]))
  const mapa: Record<string, Record<Prioridade, number> & { categoria: string }> = {}

  tickets.forEach((t) => {
    const nome = nomePorId[t.categoria_id] ?? 'Sem categoria'
    if (!mapa[nome]) {
      mapa[nome] = { categoria: nome, baixa: 0, media: 0, alta: 0, critica: 0 }
    }
    mapa[nome][t.prioridade] += 1
  })

  return Object.values(mapa)
    .sort((a, b) => {
      const totalA = ORDEM_PRIORIDADE.reduce((s, p) => s + a[p], 0)
      const totalB = ORDEM_PRIORIDADE.reduce((s, p) => s + b[p], 0)
      return totalB - totalA
    })
    .slice(0, 8)
}

/** % de tickets dentro do prazo de SLA (para o gauge). */
export function conformidadeSla(tickets: Ticket[]): number {
  const comSla = tickets.filter((t) => t.prazo_sla)
  if (comSla.length === 0) return 100

  const dentroDoP = comSla.filter((t) => {
    const prazo = new Date(t.prazo_sla!).getTime()
    if (t.resolvido_em) return new Date(t.resolvido_em).getTime() <= prazo
    if (!STATUS_ATIVO.has(t.status)) return true // fechado sem resolvido_em: considera ok
    return Date.now() <= prazo
  })

  return Math.round((dentroDoP.length / comSla.length) * 100)
}
