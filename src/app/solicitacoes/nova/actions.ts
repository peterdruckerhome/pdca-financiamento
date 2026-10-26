"use server";

import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function criarSolicitacaoRascunho(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Usuário não autenticado.");
  }

  const tipo = formData.get("tipo") as string;
  const titulo = formData.get("titulo") as string;
  const descricao = formData.get("descricao") as string;
  const valor = formData.get("valor") as string;

  if (!tipo || !titulo || !descricao || !valor) {
    throw new Error("Todos os campos são obrigatórios.");
  }

  const ano = new Date().getFullYear();
  const contagemAno = await prisma.solicitacao.count({
    where: {
      numero: { startsWith: `PDCA-FIN-${ano}-` },
    },
  });
  const proximoNumero = String(contagemAno + 1).padStart(4, "0");
  const numero = `PDCA-FIN-${ano}-${proximoNumero}`;

  const solicitacao = await prisma.solicitacao.create({
    data: {
      numero,
      tipo: tipo as "VERBA" | "CUSTEIO" | "REEMBOLSO",
      titulo,
      descricao,
      valorSolicitado: valor,
      status: "RASCUNHO",
      solicitanteId: session.user.id,
      historico: {
        create: {
          tipo: "CRIACAO",
          descricao: `Solicitação ${numero} criada como rascunho.`,
          statusNovo: "RASCUNHO",
          responsavelId: session.user.id,
        },
      },
    },
  });

  redirect(`/dashboard`);
}