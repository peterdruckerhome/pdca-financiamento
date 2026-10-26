-- CreateTable
CREATE TABLE "modelos_documento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "arquivado" BOOLEAN NOT NULL DEFAULT false,
    "caminhoArquivo" TEXT NOT NULL,
    "criadoPorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modelos_documento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "modelos_documento" ADD CONSTRAINT "modelos_documento_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
