-- CreateEnum
CREATE TYPE "TipoSolicitacao" AS ENUM ('VERBA', 'CUSTEIO', 'REEMBOLSO');

-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('RASCUNHO', 'ENVIADA', 'EM_ANALISE', 'CORRECAO_SOLICITADA', 'REENVIADA', 'APROVADA', 'EXECUTADA_PAGA', 'ENCERRADA', 'REJEITADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "solicitacoes" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" "TipoSolicitacao" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorSolicitado" DECIMAL(12,2) NOT NULL,
    "valorAprovado" DECIMAL(12,2),
    "valorExecutado" DECIMAL(12,2),
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'RASCUNHO',
    "solicitanteId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "solicitacoes_numero_key" ON "solicitacoes"("numero");

-- AddForeignKey
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
