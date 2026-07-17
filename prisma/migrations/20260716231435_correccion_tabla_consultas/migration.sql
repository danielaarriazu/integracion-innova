/*
  Warnings:

  - You are about to drop the `consulta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `estado_consulta` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EstadoConsulta" AS ENUM ('NUEVA', 'EN_PROCESO', 'RESUELTA', 'CERRADA');

-- CreateEnum
CREATE TYPE "CerradaPor" AS ENUM ('BOT', 'ADMIN', 'EMPRENDEDOR', 'CLIENTE');

-- DropForeignKey
ALTER TABLE "consulta" DROP CONSTRAINT "consulta_estadoConsultaId_fkey";

-- DropForeignKey
ALTER TABLE "consulta" DROP CONSTRAINT "consulta_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "consulta_faq" DROP CONSTRAINT "consulta_faq_consultaId_fkey";

-- DropForeignKey
ALTER TABLE "consulta_producto" DROP CONSTRAINT "consulta_producto_consultaId_fkey";

-- DropForeignKey
ALTER TABLE "lead" DROP CONSTRAINT "lead_consultaId_fkey";

-- DropForeignKey
ALTER TABLE "mensaje" DROP CONSTRAINT "mensaje_consultaId_fkey";

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "consultaId" TEXT;

-- DropTable
DROP TABLE "consulta";

-- DropTable
DROP TABLE "estado_consulta";

-- CreateTable
CREATE TABLE "Consulta" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "sessionAnonimaId" TEXT,
    "clienteNombre" TEXT,
    "clienteTelefono" TEXT,
    "estado" "EstadoConsulta" NOT NULL DEFAULT 'NUEVA',
    "derivada" BOOLEAN NOT NULL DEFAULT false,
    "cerradaPor" "CerradaPor",
    "tipoConsulta" TEXT,
    "prioridad" TEXT,
    "canal" TEXT NOT NULL DEFAULT 'web',
    "asunto" TEXT,
    "descripcion" TEXT,
    "derivadaA" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "fechaCierre" TIMESTAMP(3),

    CONSTRAINT "Consulta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Consulta_botId_fechaActualizacion_idx" ON "Consulta"("botId", "fechaActualizacion");

-- CreateIndex
CREATE INDEX "Consulta_sessionAnonimaId_idx" ON "Consulta"("sessionAnonimaId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_botId_fkey" FOREIGN KEY ("botId") REFERENCES "ConfiguracionBot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensaje" ADD CONSTRAINT "mensaje_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulta_producto" ADD CONSTRAINT "consulta_producto_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulta_faq" ADD CONSTRAINT "consulta_faq_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
