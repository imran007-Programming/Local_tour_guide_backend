/*
  Warnings:

  - You are about to drop the column `category` on the `tours` table. All the data in the column will be lost.
  - Added the required column `CategoryId` to the `tours` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tours" DROP COLUMN "category",
ADD COLUMN     "CategoryId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "TourCategory";

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "tours" ADD CONSTRAINT "tours_CategoryId_fkey" FOREIGN KEY ("CategoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
