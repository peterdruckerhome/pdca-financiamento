import { prisma } from "@/lib/prisma";

export async function criarNotificacao(
  usuarioId: string,
  mensagem: string,
  solicitacaoId?: string
) {
  await prisma.notificacao.create({
    data: {
      usuarioId,
      mensagem,
      solicitacaoId: solicitacaoId ?? null,
    },
  });
}