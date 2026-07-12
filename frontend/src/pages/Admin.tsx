import { type FormEvent, useEffect, useState } from 'react'
import { criarCategoria, listarCategorias } from '../services/categories'
import { criarUsuario, listarUsuarios } from '../services/users'
import { obterPerfil } from '../services/api'
import type { Categoria, Perfil, Usuario } from '../types'

const PERFIS: Perfil[] = ['colaborador', 'analista', 'gestor', 'administrador']

export default function Admin() {
  const perfilAtual = obterPerfil()

  if (perfilAtual !== 'administrador') {
    return (
      <div className="rounded-lg border border-border bg-white p-6 text-sm text-slate">
        Esta área é exclusiva do perfil Administrador.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Administração</h1>
        <p className="text-sm text-slate">Categorias e usuários do OpsFlow.</p>
      </div>

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
    <div className="rounded-lg border border-border bg-white p-5">
      <h2 className="mb-4 text-sm font-medium text-ink">Categorias</h2>

      <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate">Nome</label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Impressoras"
            className="rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-slate">Descrição</label>
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Opcional"
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={enviando}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {enviando ? 'Salvando...' : '+ Adicionar'}
        </button>
      </form>

      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-xs uppercase text-slate">
          <tr><th className="py-2">Nome</th><th className="py-2">Descrição</th></tr>
        </thead>
        <tbody>
          {carregando && <tr><td colSpan={2} className="py-3 text-slate">Carregando...</td></tr>}
          {!carregando && categorias.map((c) => (
            <tr key={c.id} className="border-b border-border last:border-0">
              <td className="py-2 text-ink">{c.nome}</td>
              <td className="py-2 text-slate">{c.descricao ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
    <div className="rounded-lg border border-border bg-white p-5">
      <h2 className="mb-4 text-sm font-medium text-ink">Usuários</h2>

      <form onSubmit={handleSubmit} className="mb-4 grid gap-3 md:grid-cols-5">
        <input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome"
          className="rounded-md border border-border px-3 py-2 text-sm md:col-span-1" />
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail"
          className="rounded-md border border-border px-3 py-2 text-sm md:col-span-1" />
        <input required type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Senha provisória"
          className="rounded-md border border-border px-3 py-2 text-sm md:col-span-1" />
        <select value={perfil} onChange={(e) => setPerfil(e.target.value as Perfil)}
          className="rounded-md border border-border px-3 py-2 text-sm md:col-span-1">
          {PERFIS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <div className="flex gap-2 md:col-span-1">
          <input value={pais} onChange={(e) => setPais(e.target.value)} placeholder="País"
            className="w-full rounded-md border border-border px-3 py-2 text-sm" />
          <button type="submit" disabled={enviando}
            className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60">
            {enviando ? '...' : '+'}
          </button>
        </div>
      </form>

      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-xs uppercase text-slate">
          <tr><th className="py-2">Nome</th><th className="py-2">E-mail</th><th className="py-2">Perfil</th><th className="py-2">País</th></tr>
        </thead>
        <tbody>
          {carregando && <tr><td colSpan={4} className="py-3 text-slate">Carregando...</td></tr>}
          {!carregando && usuarios.map((u) => (
            <tr key={u.id} className="border-b border-border last:border-0">
              <td className="py-2 text-ink">{u.nome}</td>
              <td className="py-2 font-mono text-xs text-slate">{u.email}</td>
              <td className="py-2 text-slate">{u.perfil}</td>
              <td className="py-2 text-slate">{u.pais ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
