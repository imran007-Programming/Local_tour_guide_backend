/*
  Warnings:

  - You are about to drop the column `location` on the `tours` table. All the data in the column will be lost.
  - Added the required column `category` to the `tours` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `tours` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itinerary` to the `tours` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TourCategory" AS ENUM ('FOOD', 'ART', 'ADVENTURE', 'CULTURE', 'NATURE');

-- AlterTable
ALTER TABLE "tours" DROP COLUMN "location",
ADD COLUMN     "category" "TourCategory" NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "itinerary" TEXT NOT NULL,
ADD COLUMN     "languages" TEXT[];
