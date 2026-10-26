-- AlterTable
ALTER TABLE "solicitacoes" ADD COLUMN     "responsavelAnaliseId" TEXT,
ADD COLUMN     "responsavelDecisaoId" TEXT,
ADD COLUMN     "responsavelExecucaoId" TEXT;

-- AddForeignKey
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_responsavelAnaliseId_fkey" FOREIGN KEY ("responsavelAnaliseId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_responsavelDecisaoId_fkey" FOREIGN KEY ("responsavelDecisaoId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_responsavelExecucaoId_fkey" FOREIGN KEY ("responsavelExecucaoId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
