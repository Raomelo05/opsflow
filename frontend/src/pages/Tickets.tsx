import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Sparkles } from 'lucide-react'
import { PriorityBadge } from '../components/PriorityBadge'
import { StatusBadge } from '../components/StatusBadge'
import { SlaIndicator } from '../components/SlaIndicator'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { SearchBar } from '../components/ui/SearchBar'
import { FilterBar } from '../components/ui/FilterBar'
import { Drawer } from '../components/ui/Drawer'
import { Table, TableHead, Th, TableBody, TableRow, Td } from '../components/ui/Table'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
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
  const [drawerAberto, setDrawerAberto] = useState(false)

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
      <PageHeader
        title="Tickets"
        subtitle="Todos os chamados abertos pelos colaboradores."
        actions={
          <Button onClick={() => setDrawerAberto(true)}>
            <Plus className="h-4 w-4" />
            Novo ticket
          </Button>
        }
      />

      <Drawer
        open={drawerAberto}
        onClose={() => setDrawerAberto(false)}
        title="Abrir novo chamado"
        description="Preencha os dados abaixo para registrar um novo ticket."
      >
        <NovoTicketForm
          categorias={categorias}
          onCriado={() => {
            setDrawerAberto(false)
            carregarTickets(filtros)
          }}
        />
      </Drawer>

      <FilterBar>
        <SearchBar
          placeholder="Buscar por título ou descrição..."
          className="min-w-[220px] flex-1"
          onChange={(e) => atualizarFiltro('texto', e.target.value)}
        />
        <Select className="w-auto" onChange={(e) => atualizarFiltro('status_filtro', e.target.value as FiltrosTickets['status_filtro'])}>
          <option value="">Status: todos</option>
          <option value="aberto">Aberto</option>
          <option value="em_andamento">Em andamento</option>
          <option value="aguardando_confirmacao">Aguardando usuário</option>
          <option value="resolvido">Resolvido</option>
          <option value="fechado">Fechado</option>
          <option value="reaberto">Reaberto</option>
        </Select>
        <Select className="w-auto" onChange={(e) => atualizarFiltro('prioridade_filtro', e.target.value as FiltrosTickets['prioridade_filtro'])}>
          <option value="">Prioridade: todas</option>
          {PRIORIDADES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>
        <Select
          className="w-auto"
          onChange={(e) => atualizarFiltro('categoria_id', e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">Categoria: todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </Select>
      </FilterBar>

      {carregando ? (
        <LoadingSkeleton rows={5} height={44} />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="Nenhum ticket encontrado"
          description="Ajuste os filtros ou abra um novo chamado."
          action={<Button size="sm" onClick={() => setDrawerAberto(true)}>+ Novo ticket</Button>}
        />
      ) : (
        <Table>
          <TableHead>
            <Th>Título</Th>
            <Th>Categoria</Th>
            <Th>País / Plataforma</Th>
            <Th>Prioridade</Th>
            <Th>Status</Th>
            <Th>SLA</Th>
            <Th>Criado em</Th>
          </TableHead>
          <TableBody>
            {tickets.map((t) => (
              <TableRow key={t.id}>
                <Td>
                  <Link to={`/tickets/${t.id}`} className="font-medium text-ink hover:text-primary">
                    {t.titulo}
                  </Link>
                  <p className="font-mono text-xs text-ink-secondary">OP-{t.id.toString().padStart(4, '0')}</p>
                </Td>
                <Td className="text-ink-secondary">{categoriaPorId[t.categoria_id] ?? '—'}</Td>
                <Td className="text-ink-secondary">{t.pais} · {t.plataforma}</Td>
                <Td><PriorityBadge prioridade={t.prioridade} /></Td>
                <Td><StatusBadge status={t.status} /></Td>
                <Td>
                  <SlaIndicator
                    prioridade={t.prioridade}
                    criadoEm={t.criado_em}
                    prazoSla={t.prazo_sla}
                    resolvido={t.status === 'resolvido' || t.status === 'fechado'}
                  />
                </Td>
                <Td className="font-mono text-xs text-ink-secondary">
                  {new Date(t.criado_em).toLocaleDateString('pt-BR')}
                </Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
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
      await criarTicket({ titulo, descricao, categoria_id: categoriaId, pais, plataforma, prioridade })
      onCriado()
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Título" required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: VPN não conecta" />

      <Select label="Categoria" required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : '')}>
        <option value="">Selecione...</option>
        {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </Select>

      <Textarea
        label="Descrição"
        required
        rows={4}
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Descreva o problema com o máximo de detalhes possível."
      />

      {sugestoes.length > 0 && (
        <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">
          <p className="flex items-center gap-1.5 font-medium text-ink">
            <Sparkles className="h-3.5 w-3.5 text-warning" />
            {sugestoes.length === 1 ? 'Encontramos um artigo semelhante.' : 'Encontramos artigos semelhantes.'}
          </p>
          <ul className="mt-1.5 space-y-1">
            {sugestoes.map((s) => (
              <li key={s.id}>
                <Link to="/kb" className="text-primary hover:underline">{s.problema}</Link>
                <span className="ml-1 text-xs text-ink-secondary">({Math.round(s.relevancia * 100)}% de aderência)</span>
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-xs text-ink-secondary">Deseja consultar o artigo antes de abrir o chamado?</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="País" required value={pais} onChange={(e) => setPais(e.target.value)} placeholder="Brasil" />
        <Input label="Plataforma" required value={plataforma} onChange={(e) => setPlataforma(e.target.value)} placeholder="Rede Corporativa" />
      </div>

      <Select label="Prioridade" value={prioridade} onChange={(e) => setPrioridade(e.target.value as Prioridade)}>
        {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
      </Select>

      <Button type="submit" loading={enviando} className="w-full">
        Abrir chamado
      </Button>
    </form>
  )
}
