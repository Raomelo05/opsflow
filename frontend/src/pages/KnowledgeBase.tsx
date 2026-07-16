import { type FormEvent, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { BookOpen } from 'lucide-react'
import { listarCategorias } from '../services/categories'
import { criarArtigo, listarArtigos } from '../services/kb'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { Drawer } from '../components/ui/Drawer'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
import type { ArtigoKB, Categoria } from '../types'

export default function KnowledgeBase() {
  const [artigos, setArtigos] = useState<ArtigoKB[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [drawerAberto, setDrawerAberto] = useState(false)
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
      <PageHeader
        title="Base de Conhecimento"
        subtitle="Artigos de problema → solução usados na sugestão automática."
        actions={
          <Button onClick={() => setDrawerAberto(true)}>
            <Plus className="h-4 w-4" />
            Novo artigo
          </Button>
        }
      />

      <Drawer open={drawerAberto} onClose={() => setDrawerAberto(false)} title="Novo artigo da Knowledge Base">
        <NovoArtigoForm
          categorias={categorias}
          onCriado={() => {
            setDrawerAberto(false)
            carregar()
          }}
        />
      </Drawer>

      {carregando ? (
        <LoadingSkeleton rows={4} height={100} />
      ) : artigos.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhum artigo cadastrado ainda"
          description="Artigos da Knowledge Base são sugeridos automaticamente ao abrir um ticket parecido."
          action={<Button size="sm" onClick={() => setDrawerAberto(true)}>+ Novo artigo</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {artigos.map((a) => (
            <Card key={a.id} hoverable>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">
                {a.categoria_id ? categoriaPorId[a.categoria_id] ?? 'Sem categoria' : 'Sem categoria'}
              </p>
              <h2 className="mt-1 font-semibold text-ink">{a.problema}</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink-secondary">{a.solucao}</p>
              {a.palavras_chave && (
                <p className="mt-3 font-mono text-xs text-ink-disabled">
                  #{a.palavras_chave.split(',').map((k) => k.trim()).join(' #')}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Problema" required value={problema} onChange={(e) => setProblema(e.target.value)} placeholder="Ex.: VPN não conecta" />

      <Select label="Categoria" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : '')}>
        <option value="">Sem categoria</option>
        {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </Select>

      <Textarea
        label="Solução (passo a passo)"
        required
        rows={5}
        value={solucao}
        onChange={(e) => setSolucao(e.target.value)}
        className="font-mono"
      />

      <Input
        label="Palavras-chave (separadas por vírgula)"
        value={palavrasChave}
        onChange={(e) => setPalavrasChave(e.target.value)}
        placeholder="vpn, conexão, acesso remoto"
      />

      <Button type="submit" loading={enviando} className="w-full">
        Salvar artigo
      </Button>
    </form>
  )
}
