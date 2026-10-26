import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@pdca.org" },
    update: {},
    create: {
      nome: "Administrador do Sistema",
      email: "admin@pdca.org",
      senhaHash: senhaHash,
      perfil: "ADMINISTRADOR_SISTEMA",
    },
  });

  console.log("Usuário administrador criado/verificado:", admin.email);

  const senhaSolicitanteHash = await bcrypt.hash("solicitante123", 10);

  const solicitante = await prisma.usuario.upsert({
    where: { email: "solicitante@pdca.org" },
    update: {},
    create: {
      nome: "Membro Solicitante Teste",
      email: "solicitante@pdca.org",
      senhaHash: senhaSolicitanteHash,
      perfil: "SOLICITANTE",
    },
  });

  console.log("Usuário solicitante criado/verificado:", solicitante.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });