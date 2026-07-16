import type { Prioridade, StatusTicket } from '../types'

/**
 * Cores dos gráficos referenciando diretamente as variáveis CSS do tema
 * (ver src/index.css). Atributos SVG como `fill`/`stroke` resolvem `var(...)`
 * normalmente, então os gráficos se adaptam sozinhos ao dark mode — não
 * precisamos duplicar valores hex nem recalcular nada em JS.
 */
export const CORES_STATUS: Record<StatusTicket, string> = {
  aberto: 'var(--status-aberto)',
  em_andamento: 'var(--status-andamento)',
  aguardando_confirmacao: 'var(--status-aguardando)',
  resolvido: 'var(--status-resolvido)',
  fechado: 'var(--status-fechado)',
  reaberto: 'var(--status-reaberto)',
}

export const CORES_PRIORIDADE: Record<Prioridade, string> = {
  critica: 'var(--priority-critica)',
  alta: 'var(--priority-alta)',
  media: 'var(--priority-media)',
  baixa: 'var(--priority-baixa)',
}

export const COR_PRIMARIA = 'var(--color-primary)'
export const COR_BORDA = 'var(--color-border)'
export const COR_TEXTO_SECUNDARIO = 'var(--text-ink-secondary)'

export const EIXO_TICK = { fill: COR_TEXTO_SECUNDARIO, fontSize: 11 }
