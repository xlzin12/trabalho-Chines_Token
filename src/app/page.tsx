"use client"

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { verificaTokenExpirado } from "@/src/services/token/token";

interface ITokenStorage {
  accessToken: string;
  usuario?: {
    id: number | string;
    nome: string;
    email: string;
  };
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("admin@pitchau.com");
  const [senha, setSenha] = useState("123");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const redirecionadoSemAuth =
    searchParams.get("teste") !== null || searchParams.get("erro") === "auth";

  useEffect(() => {
    const lsToken = localStorage.getItem("painel1pitchau.token");
    if (typeof lsToken === "string") {
      try {
        const token: ITokenStorage = JSON.parse(lsToken);
        if (token && !verificaTokenExpirado(token.accessToken)) {
          router.push("/usuarios");
        }
      } catch {
        localStorage.removeItem("painel1pitchau.token");
      }
    }
  }, [router]);

  const realizarLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const res = await axios.post("/api/login", { email, senha });
      const data: ITokenStorage = res.data;

      localStorage.setItem("painel1pitchau.token", JSON.stringify(data));
      router.push("/usuarios");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErro(err.response.data.message);
      } else {
        setErro("Falha ao realizar login. Verifique suas credenciais.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full mb-3">
            Painel Pitchau • JWT Auth
          </span>
          <h1 className="text-2xl font-bold text-white">Acesso ao Sistema</h1>
          <p className="text-sm text-slate-400 mt-1">
            Entre com suas credenciais para gerar seu token de acesso
          </p>
        </div>

        {redirecionadoSemAuth && (
          <div className="mb-5 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <strong>Rota Protegida:</strong> Você tentou acessar uma página interna sem estar autenticado ou seu token expirou. Faça login para continuar!
          </div>
        )}

        {erro && (
          <div className="mb-5 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={realizarLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pitchau.com"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold transition cursor-pointer"
          >
            {carregando ? "Autenticando..." : "Entrar com Token"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">Credenciais de teste (db.json):</p>
          <p>• E-mail: <code className="text-indigo-400">admin@pitchau.com</code> | Senha: <code className="text-indigo-400">123</code></p>
          <p>• E-mail: <code className="text-indigo-400">joao@pitchau.com</code> | Senha: <code className="text-indigo-400">123</code></p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Carregando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
