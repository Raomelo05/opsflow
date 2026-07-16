import { type FormEvent, useEffect, useState } from 'react'
import { Plus, Settings, ShieldOff } from 'lucide-react'
import { criarCategoria, listarCategorias } from '../services/categories'
import { criarUsuario, listarUsuarios } from '../services/users'
import { obterPerfil } from '../services/api'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Table, TableHead, Th, TableBody, TableRow, Td } from '../components/ui/Table'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
import { EmptyState } from '../components/ui/EmptyState'
import type { Categoria, Perfil, Usuario } from '../types'

const PERFIS: Perfil[] = ['colaborador', 'analista', 'gestor', 'administrador']

export default function Admin() {
  const perfilAtual = obterPerfil()

  if (perfilAtual !== 'administrador') {
    return (
      <EmptyState
        icon={ShieldOff}
        title="Acesso restrito"
        description="Esta área é exclusiva do perfil Administrador."
      />
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Administração" subtitle="Categorias e usuários do OpsFlow." />
      <CategoriasSection />
      <UsuariosSection />
    </div>
  )
}

function CategoriasSection() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [carregando, setCarregando] = useState(true)

  function carregar() {
    setCarregando(true)
    listarCategorias().then(setCategorias).finally(() => setCarregando(false))
  }

  useEffect(carregar, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    try {
      await criarCategoria({ nome, descricao: descricao || undefined })
      setNome('')
      setDescricao('')
      carregar()
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Card>
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
        <Settings className="h-4 w-4 text-ink-secondary" />
        Categorias
      </h2>

      <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-48">
          <Input label="Nome" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Impressoras" />
        </div>
        <div className="flex-1">
          <Input label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Opcional" />
        </div>
        <Button type="submit" size="sm" loading={enviando}>
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </Button>
      </form>

      {carregando ? (
        <LoadingSkeleton rows={3} height={32} />
      ) : (
        <Table>
          <TableHead>
            <Th>Nome</Th>
            <Th>Descrição</Th>
          </TableHead>
          <TableBody>
            {categorias.map((c) => (
              <TableRow key={c.id}>
                <Td className="font-medium">{c.nome}</Td>
                <Td className="text-ink-secondary">{c.descricao ?? '—'}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}

function UsuariosSection() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [perfil, setPerfil] = useState<Perfil>('colaborador')
  const [pais, setPais] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [carregando, setCarregando] = useState(true)

  function carregar() {
    setCarregando(true)
    listarUsuarios().then(setUsuarios).finally(() => setCarregando(false))
  }

  useEffect(carregar, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    try {
      await criarUsuario({ nome, email, senha, perfil, pais: pais || undefined })
      setNome(''); setEmail(''); setSenha(''); setPais('')
      carregar()
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Card>
      <h2 className="mb-4 text-sm font-semibold text-ink">Usuários</h2>

      <form onSubmit={handleSubmit} className="mb-4 grid gap-3 md:grid-cols-5">
        <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" />
        <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" />
        <Input required type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha provisória" />
        <Select value={perfil} onChange={(e) => setPerfil(e.target.value as Perfil)}>
          {PERFIS.map((p) => <option key={p} value={p}>{p}</option>)}
        </Select>
        <div className="flex gap-2">
          <Input value={pais} onChange={(e) => setPais(e.target.value)} placeholder="País" className="flex-1" />
          <Button type="submit" size="sm" loading={enviando} className="shrink-0">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>

      {carregando ? (
        <LoadingSkeleton rows={3} height={32} />
      ) : (
        <Table>
          <TableHead>
            <Th>Nome</Th>
            <Th>E-mail</Th>
            <Th>Perfil</Th>
            <Th>País</Th>
          </TableHead>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id}>
                <Td className="font-medium">{u.nome}</Td>
                <Td className="font-mono text-xs text-ink-secondary">{u.email}</Td>
                <Td className="text-ink-secondary">{u.perfil}</Td>
                <Td className="text-ink-secondary">{u.pais ?? '—'}</Td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}
