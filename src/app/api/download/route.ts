import { auth } from "@/../auth";
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Caminho não informado" }, { status: 400 });
  }

  const caminhoBase = path.join(process.cwd(), "uploads");
  const caminhoCompleto = path.join(process.cwd(), filePath);

  if (!caminhoCompleto.startsWith(caminhoBase)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const arquivo = await readFile(caminhoCompleto);
    const nomeArquivo = path.basename(caminhoCompleto);

    return new NextResponse(arquivo, {
      headers: {
        "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }
}