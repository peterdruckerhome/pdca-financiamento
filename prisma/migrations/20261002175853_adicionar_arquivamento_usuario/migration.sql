-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "arquivado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "arquivadoEm" TIMESTAMP(3),
ADD COLUMN     "arquivadoPorId" TEXT;
