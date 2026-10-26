"use server";

import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";

export async function cadastrarModelo(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Usuário não autenticado.");
  }

  const perfisPermitidos = ["ANALISTA_FINANCEIRO", "GESTOR_FINANCEIRO", "ADMINISTRADOR_SISTEMA"];
  if (!perfisPermitidos.includes(session.user.perfil)) {
    throw new Error("Você não tem permissão para cadastrar modelos.");
  }

  const nome = formData.get("nome") as string;
  const descricao = formData.get("descricao") as string;
  const arquivo = formData.get("arquivo") as File;

  if (!nome || !arquivo || arquivo.size === 0) {
    throw new Error("Nome e arquivo são obrigatórios.");
  }

  const blob = await put(`modelos/${arquivo.name}`, arquivo, {
    access: "public",
    addRandomSuffix: true,
  });

  const caminhoRelativo = blob.url;

  await prisma.modeloDocumento.create({
    data: {
      nome,
      descricao: descricao || null,
      caminhoArquivo: caminhoRelativo,
      criadoPorId: session.user.id,
    },
  });

  revalidatePath("/modelos");
}