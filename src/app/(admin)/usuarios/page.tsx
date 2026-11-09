"use client"

import { verificaTokenExpirado } from "@/src/services/token/token";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export interface IToken {
  accessToken: string;
  usuario?: {
    id: number | string;
    nome: string;
    email: string;
    perfil?: string;
  };
}

export interface IUsuario {
  id: number | string;
  nome: string;
  email: string;
  senha?: string;
  perfil: string;
}

const API_URL = "http://localhost:3001/usuarios";

export default function Usuarios() {
  const router = useRouter();

  const [autorizado, setAutorizado] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<IToken["usuario"] | null>(null);

  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  // Campos do formulário de cadastro/edição
  const [editandoId, setEditandoId] = useState<number | string | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("Colaborador");

  const carregarUsuarios = () => {
    setCarregandoLista(true);
    axios
      .get<IUsuario[]>(API_URL)
      .then((res) => {
        setUsuarios(res.data);
        setErro("");
      })
      .catch(() => {
        setErro(
          "Não foi possível conectar ao json-server na porta 3001. Verifique se 'npm run server' está em execução."
        );
      })
      .finally(() => {
        setCarregandoLista(false);
      });
  };

  useEffect(() => {
    let lsToken = localStorage.getItem("painel1pitchau.token");
    let token: IToken | null = null;

    if (typeof lsToken === "string") {
      try {
        token = JSON.parse(lsToken);
      } catch {
        token = null;
      }
    }

    if (!token || verificaTokenExpirado(token.accessToken)) {
      router.push("/?teste=123");
      return;
    }

    setUsuarioLogado(token.usuario || null);
    setAutorizado(true);
    carregarUsuarios();
  }, [router]);

  const realizarLogout = () => {
    localStorage.removeItem("painel1pitchau.token");
    router.push("/");
  };

  const limparFormulario = () => {
    setEditandoId(null);
    setNome("");
    setEmail("");
    setSenha("");
    setPerfil("Colaborador");
  };

  const salvarUsuario = async (e: FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem("");
    setErro("");

    try {
      if (editandoId !== null) {
        await axios.put(`${API_URL}/${editandoId}`, {
          id: editandoId,
          nome,
          email,
          senha,
          perfil,
        });
        setMensagem("Usuário atualizado com sucesso!");
      } else {
        await axios.post(API_URL, {
          nome,
          email,
          senha,
          perfil,
        });
        setMensagem("Usuário cadastrado com sucesso!");
      }
      limparFormulario();
      carregarUsuarios();
    } catch {
      setErro("Erro ao salvar usuário no json-server.");
    } finally {
      setSalvando(false);
    }
  };

  const iniciarEdicao = (u: IUsuario) => {
    setEditandoId(u.id);
    setNome(u.nome);
    setEmail(u.email);
    setSenha(u.senha || "");
    setPerfil(u.perfil || "Colaborador");
    setMensagem("");
  };

  const excluirUsuario = async (id: number | string) => {
    setMensagem("");
    setErro("");
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMensagem("Usuário removido com sucesso!");
      carregarUsuarios();
    } catch {
      setErro("Erro ao excluir usuário.");
    }
  };

  if (!autorizado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
        Verificando token de autenticação...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Barra de Navegação Superior */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg text-indigo-400">
              Painel Pitchau
            </span>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/usuarios"
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30"
              >
                Usuários
              </Link>
              <Link
                href="/produtos"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition"
              >
                Produtos
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-xs">
              <p className="font-medium text-slate-200">
                {usuarioLogado?.nome || "Usuário Autenticado"}
              </p>
              <p className="text-emerald-400">● Token JWT Ativo</p>
            </div>
            <button
              onClick={realizarLogout}
              className="px-3.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-sm font-medium transition cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Cadastro / Edição */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit">
          <h2 className="text-lg font-bold text-white mb-1">
            {editandoId !== null ? "Editar Usuário" : "Novo Usuário"}
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            Os usuários cadastrados já podem autenticar no login
          </p>

          <form onSubmit={salvarUsuario} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Maria Souza"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@pitchau.com"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Senha de Acesso
              </label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Perfil
              </label>
              <select
                value={perfil}
                onChange={(e) => setPerfil(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Admin">Admin</option>
                <option value="Colaborador">Colaborador</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition cursor-pointer"
              >
                {salvando
                  ? "Salvando..."
                  : editandoId !== null
                  ? "Atualizar"
                  : "Cadastrar"}
              </button>
              {editandoId !== null && (
                <button
                  type="button"
                  onClick={limparFormulario}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Lista de Usuários */}
        <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white">
                Gerenciamento de Usuários
              </h1>
              <p className="text-xs text-slate-400">
                Rota protegida por Token JWT (/usuarios)
              </p>
            </div>
            <button
              onClick={carregarUsuarios}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition cursor-pointer"
            >
              Atualizar Lista
            </button>
          </div>

          {mensagem && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
              {mensagem}
            </div>
          )}

          {erro && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {erro}
            </div>
          )}

          {carregandoLista ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Carregando usuários do servidor...
            </div>
          ) : usuarios.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Nenhum usuário cadastrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Nome</th>
                    <th className="py-3 px-3">E-mail</th>
                    <th className="py-3 px-3">Perfil</th>
                    <th className="py-3 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 text-slate-400">#{u.id}</td>
                      <td className="py-3 px-3 font-medium text-white">
                        {u.nome}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{u.email}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {u.perfil || "Colaborador"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => iniciarEdicao(u)}
                          className="px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs transition cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluirUsuario(u.id)}
                          className="px-2.5 py-1 rounded bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs transition cursor-pointer"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
