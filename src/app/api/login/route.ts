import { NextResponse } from "next/server";
import axios from "axios";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const SECRET_KEY = "painel1pitchau-secret-key-jwt";

interface IUsuarioDB {
  id: number | string;
  nome: string;
  email: string;
  senha?: string;
  perfil?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, senha } = body;

    if (!email || !senha) {
      return NextResponse.json(
        { message: "Informe o e-mail e a senha." },
        { status: 400 }
      );
    }

    let usuarios: IUsuarioDB[] = [];

    try {
      const response = await axios.get<IUsuarioDB[]>(
        `http://localhost:3001/usuarios?email=${encodeURIComponent(email)}`
      );
      usuarios = response.data;
    } catch {
      // Fallback caso o json-server ainda não tenha sido iniciado
      const dbPath = path.join(process.cwd(), "jsonserver", "db.json");
      if (fs.existsSync(dbPath)) {
        const raw = fs.readFileSync(dbPath, "utf-8");
        const parsed = JSON.parse(raw);
        usuarios = (parsed.usuarios || []).filter(
          (u: IUsuarioDB) => u.email === email
        );
      }
    }

    const usuario = usuarios.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && String(u.senha) === String(senha)
    );

    if (!usuario) {
      return NextResponse.json(
        { message: "E-mail ou senha inválidos!" },
        { status: 401 }
      );
    }

    const accessToken = jwt.sign(
      {
        sub: String(usuario.id),
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil || "Admin",
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    return NextResponse.json({
      accessToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil || "Admin",
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { message: "Erro interno ao processar autenticação." },
      { status: 500 }
    );
  }
}
