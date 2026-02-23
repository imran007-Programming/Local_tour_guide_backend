/*
  Warnings:

  - A unique constraint covering the columns `[touristId,tourId]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "bookings_touristId_tourId_key" ON "bookings"("touristId", "tourId");
