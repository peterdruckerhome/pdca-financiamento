-- CreateEnum
CREATE TYPE "TipoEventoHistorico" AS ENUM ('CRIACAO', 'EDICAO', 'ENVIO', 'INICIO_ANALISE', 'SOLICITACAO_CORRECAO', 'REENVIO', 'MUDANCA_STATUS', 'PARECER_EMITIDO', 'APROVACAO', 'REJEICAO', 'CANCELAMENTO', 'REGISTRO_EXECUCAO_PAGAMENTO', 'ENCERRAMENTO', 'REABERTURA', 'UPLOAD_DOCUMENTO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('TERMO_SOLICITACAO', 'ORCAMENTO', 'COMPROVANTE', 'RECIBO', 'EXTRATO', 'DOCUMENTO_FISCAL', 'PARECER_ANEXO', 'OUTRO');

-- CreateTable
CREATE TABLE "historico_eventos" (
    "id" TEXT NOT NULL,
    "tipo" "TipoEventoHistorico" NOT NULL,
    "descricao" TEXT NOT NULL,
    "statusAnterior" "StatusSolicitacao",
    "statusNovo" "StatusSolicitacao",
    "solicitacaoId" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "caminhoArquivo" TEXT NOT NULL,
    "tipo" "TipoDocumento" NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "solicitacaoId" TEXT NOT NULL,
    "enviadoPorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "historico_eventos" ADD CONSTRAINT "historico_eventos_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "solicitacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_eventos" ADD CONSTRAINT "historico_eventos_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "solicitacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_enviadoPorId_fkey" FOREIGN KEY ("enviadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
