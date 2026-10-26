"use server";

import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function marcarTodasComoLidas() {
  const session = await auth();
  if (!session?.user) throw new Error("Usuário não autenticado.");

  await prisma.notificacao.updateMany({
    where: { usuarioId: session.user.id, lida: false },
    data: { lida: true },
  });

  revalidatePath("/dashboard");
}

export async function excluirNotificacao(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Usuário não autenticado.");

  const notificacaoId = formData.get("notificacaoId") as string;

  const notificacao = await prisma.notificacao.findUnique({
    where: { id: notificacaoId },
  });

  if (!notificacao || notificacao.usuarioId !== session.user.id) {
    throw new Error("Notificação não encontrada.");
  }

  await prisma.notificacao.delete({
    where: { id: notificacaoId },
  });

  revalidatePath("/dashboard");
}