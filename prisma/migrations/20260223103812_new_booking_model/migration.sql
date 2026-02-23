/*
  Warnings:

  - You are about to drop the column `requestDate` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `requestTime` on the `bookings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tourId,bookingDateTime]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[touristId,tourId,bookingDateTime]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookingDateTime` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "bookings_touristId_tourId_key";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "requestDate",
DROP COLUMN "requestTime",
ADD COLUMN     "bookingDateTime" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "bookings_touristId_idx" ON "bookings"("touristId");

-- CreateIndex
CREATE INDEX "bookings_tourId_idx" ON "bookings"("tourId");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_tourId_bookingDateTime_key" ON "bookings"("tourId", "bookingDateTime");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_touristId_tourId_bookingDateTime_key" ON "bookings"("touristId", "tourId", "bookingDateTime");
