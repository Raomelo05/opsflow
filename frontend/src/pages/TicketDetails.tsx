import { type FormEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Send } from 'lucide-react'
import { PriorityBadge } from '../components/PriorityBadge'
import { StatusBadge } from '../components/StatusBadge'
import { SlaIndicator } from '../components/SlaIndicator'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Timeline, type TimelineItem } from '../components/ui/Timeline'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
import {
  alterarPrioridade,
  alterarStatus,
  comentarTicket,
  detalharTicket,
} from '../services/tickets'
import type { Prioridade, StatusTicket, TicketDetalhe } from '../types'

const STATUS_OPCOES: StatusTicket[] = [
  'aberto', 'em_andamento', 'aguardando_confirmacao', 'resolvido', 'fechado', 'reaberto',
]
const PRIORIDADE_OPCOES: Prioridade[] = ['baixa', 'media', 'alta', 'critica']
const LABEL_CAMPO: Record<string, string> = {
  status: 'Status alterado',
  prioridade: 'Prioridade alterada',
  equipe_atribuida: 'Equipe atribuída',
  artigo_kb_enviado: 'Artigo da KB enviado',
  workflow: 'Regra de workflow aplicada',
}

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>()
  const ticketId = Number(id)
  const [ticket, setTicket] = useState<TicketDetalhe | null>(null)
  const [comentario, setComentario] = useState('')
  const [enviandoComentario, setEnviandoComentario] = useState(false)
  const [erroStatus, setErroStatus] = useState<string | null>(null)

  function recarregar() {
    detalharTicket(ticketId).then(setTicket)
  }

  useEffect(() => {
    recarregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId])

  if (!ticket) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton rows={1} height={32} />
        <LoadingSkeleton rows={4} height={80} />
      </div>
    )
  }

  async function handleStatus(status: StatusTicket) {
    setErroStatus(null)
    try {
      await alterarStatus(ticketId, status)
      recarregar()
    } catch {
      setErroStatus('Essa transição de status não é permitida a partir do status atual.')
    }
  }

  async function handlePrioridade(prioridade: Prioridade) {
    await alterarPrioridade(ticketId, prioridade)
    recarregar()
  }

  async function handleComentario(e: FormEvent) {
    e.preventDefault()
    if (!comentario.trim()) return
    setEnviandoComentario(true)
    try {
      await comentarTicket(ticketId, comentario)
      setComentario('')
      recarregar()
    } finally {
      setEnviandoComentario(false)
    }
  }

  const historicoItems: TimelineItem[] = ticket!.historico.map((h, idx) => ({
    id: idx,
    timestamp: new Date(h.alterado_em).toLocaleString('pt-BR'),
    title: (
      <>
        <span className="font-medium text-ink">{LABEL_CAMPO[h.campo_alterado] ?? h.campo_alterado}</span>
        {h.valor_anterior && <span className="text-ink-secondary"> {h.valor_anterior} →</span>}
        <span className="text-primary"> {h.valor_novo}</span>
      </>
    ),
  }))

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-ink-secondary">OP-{ticketId.toString().padStart(4, '0')}</p>
        <h1 className="text-2xl font-bold text-ink">{ticket.titulo}</h1>
        <p className="mt-1 text-sm text-ink-secondary">{ticket.pais} · {ticket.plataforma}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <h2 className="mb-2 text-sm font-semibold text-ink">Descrição</h2>
            <p className="whitespace-pre-wrap text-sm text-ink-secondary">{ticket.descricao}</p>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-ink">Comentários</h2>
            <ul className="space-y-3">
              {ticket.comentarios.length === 0 && (
                <li className="text-sm text-ink-secondary">Nenhum comentário ainda.</li>
              )}
              {ticket.comentarios.map((c) => (
                <li key={c.id} className="rounded-md bg-background-secondary p-3 text-sm">
                  <p className="text-ink">{c.texto}</p>
                  <p className="mt-1 font-mono text-xs text-ink-secondary">
                    usuário #{c.autor_id} · {new Date(c.criado_em).toLocaleString('pt-BR')}
                  </p>
                </li>
              ))}
            </ul>
            <form onSubmit={handleComentario} className="mt-4 flex gap-2">
              <Input
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Adicionar um comentário..."
                className="flex-1"
              />
              <Button type="submit" loading={enviandoComentario}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-ink">Histórico</h2>
            <Timeline items={historicoItems} emptyLabel="Sem alterações registradas." />
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-ink">Status</h2>
            <div className="mb-3"><StatusBadge status={ticket.status} /></div>
            <Select value={ticket.status} onChange={(e) => handleStatus(e.target.value as StatusTicket)}>
              {STATUS_OPCOES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            {erroStatus && <p className="mt-2 text-xs text-danger">{erroStatus}</p>}
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-ink">Prioridade</h2>
            <div className="mb-3"><PriorityBadge prioridade={ticket.prioridade} /></div>
            <Select value={ticket.prioridade} onChange={(e) => handlePrioridade(e.target.value as Prioridade)}>
              {PRIORIDADE_OPCOES.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-ink">SLA</h2>
            <SlaIndicator
              prioridade={ticket.prioridade}
              criadoEm={ticket.criado_em}
              prazoSla={ticket.prazo_sla}
              resolvido={ticket.status === 'resolvido' || ticket.status === 'fechado'}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
