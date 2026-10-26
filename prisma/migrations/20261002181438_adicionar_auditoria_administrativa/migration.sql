-- CreateEnum
CREATE TYPE "TipoAuditoriaAdministrativa" AS ENUM ('USUARIO_CRIADO', 'USUARIO_STATUS_ALTERADO', 'USUARIO_ARQUIVADO', 'USUARIO_PERFIL_ALTERADO');

-- CreateTable
CREATE TABLE "auditorias_administrativas" (
    "id" TEXT NOT NULL,
    "tipo" "TipoAuditoriaAdministrativa" NOT NULL,
    "descricao" TEXT NOT NULL,
    "dadosAnteriores" JSONB,
    "dadosPosteriores" JSONB,
    "responsavelId" TEXT NOT NULL,
    "usuarioAlvoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditorias_administrativas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auditorias_administrativas_criadoEm_idx" ON "auditorias_administrativas"("criadoEm");

-- CreateIndex
CREATE INDEX "auditorias_administrativas_usuarioAlvoId_idx" ON "auditorias_administrativas"("usuarioAlvoId");

-- CreateIndex
CREATE INDEX "auditorias_administrativas_responsavelId_idx" ON "auditorias_administrativas"("responsavelId");

-- AddForeignKey
ALTER TABLE "auditorias_administrativas" ADD CONSTRAINT "auditorias_administrativas_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias_administrativas" ADD CONSTRAINT "auditorias_administrativas_usuarioAlvoId_fkey" FOREIGN KEY ("usuarioAlvoId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
