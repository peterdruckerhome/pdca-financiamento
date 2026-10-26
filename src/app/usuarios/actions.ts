"use server";

import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

async function registrarAuditoriaAdministrativa({
  tipo,
  descricao,
  responsavelId,
  usuarioAlvoId,
  dadosAnteriores,
  dadosPosteriores,
}: {
  tipo:
  | "USUARIO_CRIADO"
  | "USUARIO_STATUS_ALTERADO"
  | "USUARIO_ARQUIVADO"
  | "USUARIO_PERFIL_ALTERADO";
  descricao: string;
  responsavelId: string;
  usuarioAlvoId: string;
  dadosAnteriores?: object;
  dadosPosteriores?: object;
}) {
  await prisma.auditoriaAdministrativa.create({
    data: {
      tipo,
      descricao,
      responsavelId,
      usuarioAlvoId,
      dadosAnteriores: dadosAnteriores ?? undefined,
      dadosPosteriores: dadosPosteriores ?? undefined,
    },
  });
}

export async function criarUsuario(formData: FormData) {
  const session = await auth();

  if (!session?.user || session.user.perfil !== "ADMINISTRADOR_SISTEMA") {
    throw new Error(
      "Apenas o Administrador do Sistema pode cadastrar usuários."
    );
  }

  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const senha = formData.get("senha") as string;
  const perfil = formData.get("perfil") as string;
  const diretoria = formData.get("diretoria") as string;

  if (!nome || !email || !senha || !perfil) {
    throw new Error("Nome, email, senha e perfil são obrigatórios.");
  }

  if (senha.length < 6) {
    throw new Error("A senha deve ter no mínimo 6 caracteres.");
  }

  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email },
  });

  if (usuarioExistente) {
    throw new Error("Já existe um usuário cadastrado com este email.");
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.$transaction(async (tx) => {
    const novoUsuario = await tx.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        perfil: perfil as
          | "SOLICITANTE"
          | "ANALISTA_FINANCEIRO"
          | "GESTOR_FINANCEIRO"
          | "ADMINISTRADOR_SISTEMA",
        diretoria: diretoria || null,
      },
    });

    await tx.auditoriaAdministrativa.create({
      data: {
        tipo: "USUARIO_CRIADO",
        descricao: `Usuário "${novoUsuario.nome}" foi cadastrado com o perfil ${novoUsuario.perfil}.`,
        responsavelId: session.user.id,
        usuarioAlvoId: novoUsuario.id,
        dadosPosteriores: {
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          perfil: novoUsuario.perfil,
          diretoria: novoUsuario.diretoria,
          ativo: novoUsuario.ativo,
          arquivado: novoUsuario.arquivado,
        },
      },
    });
  });

  revalidatePath("/usuarios");
  revalidatePath("/auditoria");
}

export async function alterarStatusUsuario(formData: FormData) {
  const session = await auth();

  if (!session?.user || session.user.perfil !== "ADMINISTRADOR_SISTEMA") {
    throw new Error(
      "Apenas o Administrador do Sistema pode alterar usuários."
    );
  }

  const usuarioId = formData.get("usuarioId") as string;
  const novoStatus = formData.get("novoStatus") as string;

  if (!usuarioId) {
    throw new Error("Usuário não informado.");
  }

  if (usuarioId === session.user.id) {
    throw new Error("Você não pode alterar o status do próprio usuário.");
  }

  if (novoStatus !== "true" && novoStatus !== "false") {
    throw new Error("Status de usuário inválido.");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
  });

  if (!usuario) {
    throw new Error("Usuário não encontrado.");
  }

  if (usuario.arquivado) {
    throw new Error("Usuários arquivados não podem ter o status alterado.");
  }

  const novoStatusBoolean = novoStatus === "true";

  if (usuario.ativo === novoStatusBoolean) {
    throw new Error("O usuário já possui este status.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.usuario.update({
      where: { id: usuarioId },
      data: {
        ativo: novoStatusBoolean,
      },
    });

    await tx.auditoriaAdministrativa.create({
      data: {
        tipo: "USUARIO_STATUS_ALTERADO",
        descricao: `Status do usuário "${usuario.nome}" alterado de ${usuario.ativo ? "Ativo" : "Inativo"
          } para ${novoStatusBoolean ? "Ativo" : "Inativo"}.`,
        responsavelId: session.user.id,
        usuarioAlvoId: usuario.id,
        dadosAnteriores: {
          ativo: usuario.ativo,
        },
        dadosPosteriores: {
          ativo: novoStatusBoolean,
        },
      },
    });
  });

  revalidatePath("/usuarios");
  revalidatePath("/auditoria");
}

export async function arquivarUsuario(formData: FormData) {
  const session = await auth();

  if (!session?.user || session.user.perfil !== "ADMINISTRADOR_SISTEMA") {
    throw new Error(
      "Apenas o Administrador do Sistema pode arquivar usuários."
    );
  }

  const usuarioId = formData.get("usuarioId") as string;

  if (!usuarioId) {
    throw new Error("Usuário não informado.");
  }

  if (usuarioId === session.user.id) {
    throw new Error("Você não pode arquivar seu próprio usuário.");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
  });

  if (!usuario) {
    throw new Error("Usuário não encontrado.");
  }

  if (usuario.ativo) {
    throw new Error("Somente usuários inativos podem ser arquivados.");
  }

  if (usuario.arquivado) {
    throw new Error("Este usuário já está arquivado.");
  }

  const agora = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.usuario.update({
      where: { id: usuarioId },
      data: {
        arquivado: true,
        arquivadoEm: agora,
        arquivadoPorId: session.user.id,
      },
    });

    await tx.auditoriaAdministrativa.create({
      data: {
        tipo: "USUARIO_ARQUIVADO",
        descricao: `Usuário "${usuario.nome}" foi arquivado.`,
        responsavelId: session.user.id,
        usuarioAlvoId: usuario.id,
        dadosAnteriores: {
          ativo: usuario.ativo,
          arquivado: usuario.arquivado,
          arquivadoEm: usuario.arquivadoEm,
          arquivadoPorId: usuario.arquivadoPorId,
        },
        dadosPosteriores: {
          ativo: false,
          arquivado: true,
          arquivadoEm: agora,
          arquivadoPorId: session.user.id,
        },
      },
    });
  });

  revalidatePath("/usuarios");
  revalidatePath("/auditoria");
}