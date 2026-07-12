import { type FormEvent, useEffect, useState } from 'react'
import { listarCategorias } from '../services/categories'
import { criarWorkflow, listarWorkflows, removerWorkflow } from '../services/workflows'
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
  const [mostrarForm, setMostrarForm] = useState(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Workflow Builder</h1>
          <p className="text-sm text-slate">Regras automáticas do tipo "se condição → então ações".</p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          {mostrarForm ? 'Cancelar' : '+ Nova regra'}
        </button>
      </div>

      {mostrarForm && (
        <NovaRegraForm
          categorias={categorias}
          onCriada={() => {
            setMostrarForm(false)
            carregar()
          }}
        />
      )}

      {carregando && <p className="text-sm text-slate">Carregando regras...</p>}

      <div className="space-y-4">
        {!carregando && workflows.length === 0 && (
          <p className="text-sm text-slate">Nenhuma regra cadastrada ainda.</p>
        )}
        {workflows.map((w) => (
          <div key={w.id} className="rounded-lg border border-border bg-white p-5">
            <div className="flex items-start justify-between">
              <h2 className="font-medium text-ink">{w.nome}</h2>
              <button
                onClick={() => excluir(w.id)}
                className="text-xs text-priority-critica underline decoration-dotted"
              >
                Remover
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-sm">
              <span className="rounded-md bg-surface px-2 py-1 text-ink">
                Se {w.condicao_campo} = {w.condicao_campo === 'categoria' ? categoriaPorId[w.condicao_valor] ?? w.condicao_valor : w.condicao_valor}
              </span>
              {w.acoes.map((a, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  <span className="text-slate">→</span>
                  <span className="rounded-md bg-primary-light px-2 py-1 text-primary-dark">
                    {ACOES.find((op) => op.valor === a.tipo_acao)?.label ?? a.tipo_acao}: {a.valor}
                  </span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
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
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-border bg-white p-5">
      <h2 className="text-sm font-medium text-ink">Nova regra</h2>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate">Nome da regra</label>
        <input
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Priorizar chamados de infraestrutura"
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div className="rounded-md bg-surface p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate">Se</p>
        <div className="grid gap-3 md:grid-cols-2">
          <select
            value={condicaoCampo}
            onChange={(e) => setCondicaoCampo(e.target.value as CondicaoCampo)}
            className="rounded-md border border-border px-3 py-2 text-sm"
          >
            {CAMPOS.map((c) => <option key={c.valor} value={c.valor}>{c.label}</option>)}
          </select>

          {condicaoCampo === 'categoria' ? (
            <select
              value={condicaoValor}
              onChange={(e) => setCondicaoValor(e.target.value)}
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              <option value="">Selecione a categoria...</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          ) : condicaoCampo === 'prioridade' ? (
            <select
              value={condicaoValor}
              onChange={(e) => setCondicaoValor(e.target.value)}
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              {['baixa', 'media', 'alta', 'critica'].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          ) : (
            <input
              required
              value={condicaoValor}
              onChange={(e) => setCondicaoValor(e.target.value)}
              placeholder={condicaoCampo === 'pais' ? 'Ex.: Brasil' : 'Ex.: Sistema Financeiro'}
              className="rounded-md border border-border px-3 py-2 text-sm"
            />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate">Então</p>
        {acoes.map((acao, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-slate">↓</span>
            <select
              value={acao.tipo_acao}
              onChange={(e) => atualizarAcao(idx, 'tipo_acao', e.target.value)}
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              {ACOES.map((op) => <option key={op.valor} value={op.valor}>{op.label}</option>)}
            </select>
            <input
              required
              value={acao.valor}
              onChange={(e) => atualizarAcao(idx, 'valor', e.target.value)}
              placeholder={ACOES.find((op) => op.valor === acao.tipo_acao)?.placeholder}
              className="flex-1 rounded-md border border-border px-3 py-2 text-sm"
            />
            {acoes.length > 1 && (
              <button type="button" onClick={() => removerAcao(idx)} className="text-xs text-priority-critica">
                remover
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={adicionarAcao} className="text-xs text-primary underline decoration-dotted">
          + adicionar ação
        </button>
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {enviando ? 'Salvando...' : 'Salvar regra'}
      </button>
    </form>
  )
}
