import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PriorityBadge } from '../components/PriorityBadge'
import { StatusBadge } from '../components/StatusBadge'
import { SlaIndicator } from '../components/SlaIndicator'
import { listarCategorias } from '../services/categories'
import { criarTicket, listarTickets, type FiltrosTickets } from '../services/tickets'
import { buscarArtigos } from '../services/kb'
import type { Categoria, Prioridade, ResultadoBuscaKB, Ticket } from '../types'

const PRIORIDADES: Prioridade[] = ['baixa', 'media', 'alta', 'critica']

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtros, setFiltros] = useState<FiltrosTickets>({})
  const [mostrarForm, setMostrarForm] = useState(false)

  const categoriaPorId = useMemo(
    () => Object.fromEntries(categorias.map((c) => [c.id, c.nome])),
    [categorias],
  )

  function carregarTickets(f: FiltrosTickets) {
    setCarregando(true)
    listarTickets(f)
      .then(setTickets)
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    listarCategorias().then(setCategorias)
    carregarTickets({})
  }, [])

  function atualizarFiltro<K extends keyof FiltrosTickets>(campo: K, valor: FiltrosTickets[K]) {
    const novosFiltros = { ...filtros, [campo]: valor || undefined }
    setFiltros(novosFiltros)
    carregarTickets(novosFiltros)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Tickets</h1>
          <p className="text-sm text-slate">Todos os chamados abertos pelos colaboradores.</p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          {mostrarForm ? 'Cancelar' : '+ Novo ticket'}
        </button>
      </div>

      {mostrarForm && (
        <NovoTicketForm
          categorias={categorias}
          onCriado={() => {
            setMostrarForm(false)
            carregarTickets(filtros)
          }}
        />
      )}

      <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-white p-4">
        <input
          placeholder="Buscar por título ou descrição..."
          className="min-w-[220px] flex-1 rounded-md border border-border px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
          onChange={(e) => atualizarFiltro('texto', e.target.value)}
        />
        <select
          className="rounded-md border border-border px-3 py-1.5 text-sm"
          onChange={(e) => atualizarFiltro('status_filtro', e.target.value as FiltrosTickets['status_filtro'])}
        >
          <option value="">Status: todos</option>
          <option value="aberto">Aberto</option>
          <option value="em_andamento">Em andamento</option>
          <option value="aguardando_confirmacao">Aguardando confirmação</option>
          <option value="resolvido">Resolvido</option>
          <option value="fechado">Fechado</option>
          <option value="reaberto">Reaberto</option>
        </select>
        <select
          className="rounded-md border border-border px-3 py-1.5 text-sm"
          onChange={(e) => atualizarFiltro('prioridade_filtro', e.target.value as FiltrosTickets['prioridade_filtro'])}
        >
          <option value="">Prioridade: todas</option>
          {PRIORIDADES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          className="rounded-md border border-border px-3 py-1.5 text-sm"
          onChange={(e) => atualizarFiltro('categoria_id', e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">Categoria: todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs uppercase text-slate">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">País / Plataforma</th>
              <th className="px-4 py-3">Prioridade</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">SLA</th>
              <th className="px-4 py-3">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-slate">Carregando tickets...</td></tr>
            )}
            {!carregando && tickets.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-slate">Nenhum ticket encontrado.</td></tr>
            )}
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0 hover:bg-surface">
                <td className="px-4 py-3">
                  <Link to={`/tickets/${t.id}`} className="font-medium text-ink hover:text-primary">
                    {t.titulo}
                  </Link>
                  <p className="font-mono text-xs text-slate">OP-{t.id.toString().padStart(4, '0')}</p>
                </td>
                <td className="px-4 py-3 text-slate">{categoriaPorId[t.categoria_id] ?? '—'}</td>
                <td className="px-4 py-3 text-slate">{t.pais} · {t.plataforma}</td>
                <td className="px-4 py-3"><PriorityBadge prioridade={t.prioridade} /></td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3">
                  <SlaIndicator
                    prioridade={t.prioridade}
                    criadoEm={t.criado_em}
                    prazoSla={t.prazo_sla}
                    resolvido={t.status === 'resolvido' || t.status === 'fechado'}
                  />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate">
                  {new Date(t.criado_em).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NovoTicketForm({ categorias, onCriado }: { categorias: Categoria[]; onCriado: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | ''>('')
  const [pais, setPais] = useState('')
  const [plataforma, setPlataforma] = useState('')
  const [prioridade, setPrioridade] = useState<Prioridade>('media')
  const [sugestoes, setSugestoes] = useState<ResultadoBuscaKB[]>([])
  const [enviando, setEnviando] = useState(false)

  // Tela 5 — sugestão automática: busca artigos da KB enquanto o usuário digita.
  useEffect(() => {
    const termo = `${titulo} ${descricao}`.trim()
    if (termo.length < 3) {
      setSugestoes([])
      return
    }
    const timeout = setTimeout(() => {
      buscarArtigos(termo).then(setSugestoes).catch(() => setSugestoes([]))
    }, 400)
    return () => clearTimeout(timeout)
  }, [titulo, descricao])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!categoriaId) return
    setEnviando(true)
    try {
      await criarTicket({
        titulo,
        descricao,
        categoria_id: categoriaId,
        pais,
        plataforma,
        prioridade,
      })
      onCriado()
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-white p-5">
      <h2 className="text-sm font-medium text-ink">Abrir novo chamado</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate">Título</label>
          <input
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex.: VPN não conecta"
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate">Categoria</label>
          <select
            required
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          >
            <option value="">Selecione...</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate">Descrição</label>
        <textarea
          required
          rows={3}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descreva o problema com o máximo de detalhes possível."
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {sugestoes.length > 0 && (
        <div className="rounded-md border border-accent/40 bg-accent/10 p-3 text-sm">
          <p className="font-medium text-ink">Encontramos {sugestoes.length === 1 ? 'um artigo semelhante' : 'artigos semelhantes'}.</p>
          <ul className="mt-1 list-inside list-disc text-slate">
            {sugestoes.map((s) => (
              <li key={s.id}>
                <Link to="/kb" className="text-primary hover:underline">{s.problema}</Link>
                <span className="ml-1 text-xs text-slate">({Math.round(s.relevancia * 100)}% de aderência)</span>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-slate">Deseja consultar o artigo antes de abrir o chamado?</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate">País</label>
          <input
            required
            value={pais}
            onChange={(e) => setPais(e.target.value)}
            placeholder="Brasil"
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate">Plataforma</label>
          <input
            required
            value={plataforma}
            onChange={(e) => setPlataforma(e.target.value)}
            placeholder="Rede Corporativa"
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate">Prioridade</label>
          <select
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value as Prioridade)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          >
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {enviando ? 'Enviando...' : 'Abrir chamado'}
      </button>
    </form>
  )
}
