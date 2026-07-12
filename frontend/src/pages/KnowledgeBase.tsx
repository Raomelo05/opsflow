import { type FormEvent, useEffect, useState } from 'react'
import { listarCategorias } from '../services/categories'
import { criarArtigo, listarArtigos } from '../services/kb'
import type { ArtigoKB, Categoria } from '../types'

export default function KnowledgeBase() {
  const [artigos, setArtigos] = useState<ArtigoKB[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [carregando, setCarregando] = useState(true)

  function carregar() {
    setCarregando(true)
    listarArtigos().then(setArtigos).finally(() => setCarregando(false))
  }

  useEffect(() => {
    carregar()
    listarCategorias().then(setCategorias)
  }, [])

  const categoriaPorId = Object.fromEntries(categorias.map((c) => [c.id, c.nome]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Base de Conhecimento</h1>
          <p className="text-sm text-slate">Artigos de problema → solução usados na sugestão automática.</p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          {mostrarForm ? 'Cancelar' : '+ Novo artigo'}
        </button>
      </div>

      {mostrarForm && (
        <NovoArtigoForm
          categorias={categorias}
          onCriado={() => {
            setMostrarForm(false)
            carregar()
          }}
        />
      )}

      {carregando && <p className="text-sm text-slate">Carregando artigos...</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {!carregando && artigos.length === 0 && (
          <p className="text-sm text-slate">Nenhum artigo cadastrado ainda.</p>
        )}
        {artigos.map((a) => (
          <div key={a.id} className="rounded-lg border border-border bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-slate">
              {a.categoria_id ? categoriaPorId[a.categoria_id] ?? 'Sem categoria' : 'Sem categoria'}
            </p>
            <h2 className="mt-1 font-medium text-ink">{a.problema}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate">{a.solucao}</p>
            {a.palavras_chave && (
              <p className="mt-3 font-mono text-xs text-slate">#{a.palavras_chave.split(',').map((k) => k.trim()).join(' #')}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function NovoArtigoForm({ categorias, onCriado }: { categorias: Categoria[]; onCriado: () => void }) {
  const [problema, setProblema] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | ''>('')
  const [solucao, setSolucao] = useState('1. \n2. \n3. ')
  const [palavrasChave, setPalavrasChave] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    try {
      await criarArtigo({
        problema,
        categoria_id: categoriaId || null,
        solucao,
        palavras_chave: palavrasChave || undefined,
      })
      onCriado()
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-white p-5">
      <h2 className="text-sm font-medium text-ink">Novo artigo</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate">Problema</label>
          <input
            required
            value={problema}
            onChange={(e) => setProblema(e.target.value)}
            placeholder="Ex.: VPN não conecta"
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate">Categoria</label>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          >
            <option value="">Sem categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate">Solução (passo a passo)</label>
        <textarea
          required
          rows={4}
          value={solucao}
          onChange={(e) => setSolucao(e.target.value)}
          className="w-full rounded-md border border-border px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate">Palavras-chave (separadas por vírgula)</label>
        <input
          value={palavrasChave}
          onChange={(e) => setPalavrasChave(e.target.value)}
          placeholder="vpn, conexão, acesso remoto"
          className="w-full rounded-md border border-border px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {enviando ? 'Salvando...' : 'Salvar artigo'}
      </button>
    </form>
  )
}
