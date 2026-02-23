/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `tours` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tours" ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "tours_slug_key" ON "tours"("slug");
