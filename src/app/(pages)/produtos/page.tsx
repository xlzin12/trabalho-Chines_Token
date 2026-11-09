"use client"

import { verificaTokenExpirado } from "@/src/services/token/token";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IToken } from "@/src/app/(admin)/usuarios/page";

interface ICategoria {
  id: number | string;
  categoria: string;
}

interface IProduto {
  id: number | string;
  nome: string;
  preco: number;
  categoria: string;
}

export default function Produtos() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);
  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [produtos, setProdutos] = useState<IProduto[]>([]);
  const [carregando, setCarregando] = useState(true);

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

    setAutorizado(true);

    Promise.all([
      axios.get<ICategoria[]>("http://localhost:3001/categorias"),
      axios.get<IProduto[]>("http://localhost:3001/produtos"),
    ])
      .then(([resCat, resProd]) => {
        setCategorias(resCat.data);
        setProdutos(resProd.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setCarregando(false);
      });
  }, [router]);

  const realizarLogout = () => {
    localStorage.removeItem("painel1pitchau.token");
    router.push("/");
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
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg text-indigo-400">
              Painel Pitchau
            </span>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/usuarios"
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition"
              >
                Usuários
              </Link>
              <Link
                href="/produtos"
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 font-medium border border-indigo-500/30"
              >
                Produtos
              </Link>
            </nav>
          </div>

          <button
            onClick={realizarLogout}
            className="px-3.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-sm font-medium transition cursor-pointer"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">Produtos e Categorias</h1>
          <p className="text-xs text-slate-400">
            Rota interna protegida por Token JWT (/produtos)
          </p>
        </div>

        {carregando ? (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400 text-sm">
            Carregando produtos e categorias...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-base font-bold text-white mb-4">
                Produtos Cadastrados
              </h2>
              <ul className="space-y-3 text-sm">
                {produtos.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700/50"
                  >
                    <div>
                      <p className="font-medium text-white">{p.nome}</p>
                      <p className="text-xs text-slate-400">{p.categoria}</p>
                    </div>
                    <span className="font-semibold text-emerald-400">
                      R$ {Number(p.preco).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-base font-bold text-white mb-4">
                Categorias
              </h2>
              <ul className="space-y-2 text-sm">
                {categorias.map((c) => (
                  <li
                    key={c.id}
                    className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200"
                  >
                    #{c.id} - {c.categoria}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
