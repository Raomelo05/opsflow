import { type FormEvent, useEffect, useState } from 'react'
import { ArrowDown, ArrowRight, Plus, Workflow as WorkflowIcon } from 'lucide-react'
import { listarCategorias } from '../services/categories'
import { criarWorkflow, listarWorkflows, removerWorkflow } from '../services/workflows'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Drawer } from '../components/ui/Drawer'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
import type { Categoria, CondicaoCampo, TipoAcao, Workflow } from '../types'

const CAMPOS: { valor: CondicaoCampo; label: string }[] = [
  { valor: 'categoria', label: 'Categoria' },
  { valor: 'prioridade', label: 'Prioridade' },
  { valor: 'pais', label: 'País' },
  { valor: 'plataforma', label: 'Plataforma' },
]

const ACOES: { valor: TipoAcao; label: string; placeholder: string }[] = [
  { valor: 'atribuir_equipe', label: 'Atribuir à equipe', placeholder: 'Ex.: Infraestrutura' },
  { valor: 'definir_prazo_horas', label: 'Definir prazo (horas)', placeholder: 'Ex.: 4' },
  { valor: 'enviar_artigo_kb', label: 'Enviar artigo da KB', placeholder: 'Nome/ID do artigo' },
  { valor: 'alterar_status', label: 'Alterar status', placeholder: 'Ex.: aguardando_confirmacao' },
]

interface AcaoForm {
  tipo_acao: TipoAcao
  valor: string
}

export default function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [drawerAberto, setDrawerAberto] = useState(false)
  const [carregando, setCarregando] = useState(true)

  function carregar() {
    setCarregando(true)
    listarWorkflows().then(setWorkflows).finally(() => setCarregando(false))
  }

  useEffect(() => {
    carregar()
    listarCategorias().then(setCategorias)
  }, [])

  const categoriaPorId = Object.fromEntries(categorias.map((c) => [String(c.id), c.nome]))

  async function excluir(id: number) {
    await removerWorkflow(id)
    carregar()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflow Builder"
        subtitle='Regras automáticas do tipo "se condição → então ações".'
        actions={
          <Button onClick={() => setDrawerAberto(true)}>
            <Plus className="h-4 w-4" />
            Nova regra
          </Button>
        }
      />

      <Drawer open={drawerAberto} onClose={() => setDrawerAberto(false)} title="Nova regra de automação">
        <NovaRegraForm
          categorias={categorias}
          onCriada={() => {
            setDrawerAberto(false)
            carregar()
          }}
        />
      </Drawer>

      {carregando ? (
        <LoadingSkeleton rows={3} height={90} />
      ) : workflows.length === 0 ? (
        <EmptyState
          icon={WorkflowIcon}
          title="Nenhuma regra cadastrada ainda"
          description="Crie regras para automatizar atribuições, prazos e respostas a chamados repetitivos."
          action={<Button size="sm" onClick={() => setDrawerAberto(true)}>+ Nova regra</Button>}
        />
      ) : (
        <div className="space-y-4">
          {workflows.map((w) => (
            <Card key={w.id}>
              <div className="flex items-start justify-between">
                <h2 className="font-semibold text-ink">{w.nome}</h2>
                <button
                  onClick={() => excluir(w.id)}
                  className="text-xs text-danger underline decoration-dotted transition-colors hover:text-danger/80"
                >
                  Remover
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-sm">
                <span className="rounded-md bg-background-secondary px-2 py-1 text-ink">
                  Se {w.condicao_campo} = {w.condicao_campo === 'categoria' ? categoriaPorId[w.condicao_valor] ?? w.condicao_valor : w.condicao_valor}
                </span>
                {w.acoes.map((a, idx) => (
                  <span key={idx} className="flex items-center gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-ink-disabled" />
                    <span className="rounded-md bg-primary-soft px-2 py-1 text-primary-hover">
                      {ACOES.find((op) => op.valor === a.tipo_acao)?.label ?? a.tipo_acao}: {a.valor}
                    </span>
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function NovaRegraForm({ categorias, onCriada }: { categorias: Categoria[]; onCriada: () => void }) {
  const [nome, setNome] = useState('')
  const [condicaoCampo, setCondicaoCampo] = useState<CondicaoCampo>('prioridade')
  const [condicaoValor, setCondicaoValor] = useState('alta')
  const [acoes, setAcoes] = useState<AcaoForm[]>([{ tipo_acao: 'atribuir_equipe', valor: '' }])
  const [enviando, setEnviando] = useState(false)

  function atualizarAcao(idx: number, campo: keyof AcaoForm, valor: string) {
    setAcoes((prev) => prev.map((a, i) => (i === idx ? { ...a, [campo]: valor } : a)))
  }

  function adicionarAcao() {
    setAcoes((prev) => [...prev, { tipo_acao: 'definir_prazo_horas', valor: '' }])
  }

  function removerAcao(idx: number) {
    setAcoes((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    try {
      await criarWorkflow({
        nome,
        condicao_campo: condicaoCampo,
        condicao_valor: condicaoValor,
        acoes: acoes.map((a, idx) => ({ ...a, ordem: idx })),
      })
      onCriada()
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input label="Nome da regra" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Priorizar chamados de infraestrutura" />

      <div className="rounded-md bg-background-secondary p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-secondary">Se</p>
        <div className="grid gap-3">
          <Select value={condicaoCampo} onChange={(e) => setCondicaoCampo(e.target.value as CondicaoCampo)}>
            {CAMPOS.map((c) => <option key={c.valor} value={c.valor}>{c.label}</option>)}
          </Select>

          {condicaoCampo === 'categoria' ? (
            <Select value={condicaoValor} onChange={(e) => setCondicaoValor(e.target.value)}>
              <option value="">Selecione a categoria...</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          ) : condicaoCampo === 'prioridade' ? (
            <Select value={condicaoValor} onChange={(e) => setCondicaoValor(e.target.value)}>
              {['baixa', 'media', 'alta', 'critica'].map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          ) : (
            <Input
              required
              value={condicaoValor}
              onChange={(e) => setCondicaoValor(e.target.value)}
              placeholder={condicaoCampo === 'pais' ? 'Ex.: Brasil' : 'Ex.: Sistema Financeiro'}
            />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">Então</p>
        {acoes.map((acao, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <ArrowDown className="mt-2.5 h-3.5 w-3.5 shrink-0 text-ink-disabled" />
            <Select className="w-auto shrink-0" value={acao.tipo_acao} onChange={(e) => atualizarAcao(idx, 'tipo_acao', e.target.value)}>
              {ACOES.map((op) => <option key={op.valor} value={op.valor}>{op.label}</option>)}
            </Select>
            <Input
              required
              value={acao.valor}
              onChange={(e) => atualizarAcao(idx, 'valor', e.target.value)}
              placeholder={ACOES.find((op) => op.valor === acao.tipo_acao)?.placeholder}
              className="flex-1"
            />
            {acoes.length > 1 && (
              <button type="button" onClick={() => removerAcao(idx)} className="mt-2.5 shrink-0 text-xs text-danger">
                remover
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={adicionarAcao} className="text-xs text-primary underline decoration-dotted">
          + adicionar ação
        </button>
      </div>

      <Button type="submit" loading={enviando} className="w-full">
        Salvar regra
      </Button>
    </form>
  )
}
