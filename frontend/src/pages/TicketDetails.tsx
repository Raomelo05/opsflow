import { type FormEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PriorityBadge } from '../components/PriorityBadge'
import { StatusBadge } from '../components/StatusBadge'
import { SlaIndicator } from '../components/SlaIndicator'
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

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>()
  const ticketId = Number(id)
  const [ticket, setTicket] = useState<TicketDetalhe | null>(null)
  const [comentario, setComentario] = useState('')
  const [enviandoComentario, setEnviandoComentario] = useState(false)

  function recarregar() {
    detalharTicket(ticketId).then(setTicket)
  }

  useEffect(() => {
    recarregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId])

  if (!ticket) return <p className="text-sm text-slate">Carregando ticket...</p>

  async function handleStatus(status: StatusTicket) {
    await alterarStatus(ticketId, status)
    recarregar()
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

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-slate">OP-{ticketId.toString().padStart(4, '0')}</p>
        <h1 className="text-2xl font-semibold text-ink">{ticket.titulo}</h1>
        <p className="mt-1 text-sm text-slate">{ticket.pais} · {ticket.plataforma}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="rounded-lg border border-border bg-white p-5">
            <h2 className="mb-2 text-sm font-medium text-ink">Descrição</h2>
            <p className="whitespace-pre-wrap text-sm text-slate">{ticket.descricao}</p>
          </div>

          <div className="rounded-lg border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-medium text-ink">Comentários</h2>
            <ul className="space-y-3">
              {ticket.comentarios.length === 0 && (
                <li className="text-sm text-slate">Nenhum comentário ainda.</li>
              )}
              {ticket.comentarios.map((c) => (
                <li key={c.id} className="rounded-md bg-surface p-3 text-sm">
                  <p className="text-ink">{c.texto}</p>
                  <p className="mt-1 font-mono text-xs text-slate">
                    usuário #{c.autor_id} · {new Date(c.criado_em).toLocaleString('pt-BR')}
                  </p>
                </li>
              ))}
            </ul>
            <form onSubmit={handleComentario} className="mt-4 flex gap-2">
              <input
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Adicionar um comentário..."
                className="flex-1 rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={enviandoComentario}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
              >
                Enviar
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-medium text-ink">Histórico</h2>
            <ul className="space-y-2 border-l-2 border-border pl-4">
              {ticket.historico.length === 0 && (
                <li className="text-sm text-slate">Sem alterações registradas.</li>
              )}
              {ticket.historico.map((h, idx) => (
                <li key={idx} className="text-sm">
                  <span className="font-medium text-ink">{h.campo_alterado}</span>
                  {h.valor_anterior && <span className="text-slate"> {h.valor_anterior} →</span>}
                  <span className="text-primary"> {h.valor_novo}</span>
                  <p className="font-mono text-xs text-slate">
                    {new Date(h.alterado_em).toLocaleString('pt-BR')}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-medium text-ink">Status</h2>
            <div className="mb-3"><StatusBadge status={ticket.status} /></div>
            <select
              value={ticket.status}
              onChange={(e) => handleStatus(e.target.value as StatusTicket)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
            >
              {STATUS_OPCOES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="rounded-lg border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-medium text-ink">Prioridade</h2>
            <div className="mb-3"><PriorityBadge prioridade={ticket.prioridade} /></div>
            <select
              value={ticket.prioridade}
              onChange={(e) => handlePrioridade(e.target.value as Prioridade)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
            >
              {PRIORIDADE_OPCOES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="rounded-lg border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-medium text-ink">SLA</h2>
            <SlaIndicator
              prioridade={ticket.prioridade}
              criadoEm={ticket.criado_em}
              prazoSla={ticket.prazo_sla}
              resolvido={ticket.status === 'resolvido' || ticket.status === 'fechado'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
