/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `ConfiguracionBot` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ConfiguracionBot" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracionBot_slug_key" ON "ConfiguracionBot"("slug");
