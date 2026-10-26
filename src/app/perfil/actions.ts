"use server";

import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function alterarSenha(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Usuário não autenticado.");
  }

  const senhaAtual = formData.get("senhaAtual") as string;
  const novaSenha = formData.get("novaSenha") as string;
  const confirmarSenha = formData.get("confirmarSenha") as string;

  if (!senhaAtual || !novaSenha || !confirmarSenha) {
    throw new Error("Todos os campos são obrigatórios.");
  }

  if (novaSenha.length < 6) {
    throw new Error("A nova senha deve ter no mínimo 6 caracteres.");
  }

  if (novaSenha !== confirmarSenha) {
    throw new Error("A confirmação de senha não coincide.");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
  });

  if (!usuario) {
    throw new Error("Usuário não encontrado.");
  }

  const senhaValida = await bcrypt.compare(senhaAtual, usuario.senhaHash);

  if (!senhaValida) {
    throw new Error("Senha atual incorreta.");
  }

  const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

  await prisma.usuario.update({
    where: { id: session.user.id },
    data: { senhaHash: novaSenhaHash },
  });

  return { sucesso: true };
}