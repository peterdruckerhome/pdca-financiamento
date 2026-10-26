-- CreateTable
CREATE TABLE "pareceres" (
    "id" TEXT NOT NULL,
    "conclusao" TEXT NOT NULL,
    "observacoes" TEXT,
    "arquivoAnexo" TEXT,
    "versaoAnterior" TEXT,
    "solicitacaoId" TEXT NOT NULL,
    "emitidoPorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pareceres_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pareceres" ADD CONSTRAINT "pareceres_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "solicitacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pareceres" ADD CONSTRAINT "pareceres_emitidoPorId_fkey" FOREIGN KEY ("emitidoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
