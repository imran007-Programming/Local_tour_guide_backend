/*
  Warnings:

  - Added the required column `maxGroupSize` to the `tours` table without a default value. This is not possible if the table is not empty.
  - Added the required column `meetingPoint` to the `tours` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tours" ADD COLUMN     "images" TEXT[],
ADD COLUMN     "maxGroupSize" INTEGER NOT NULL,
ADD COLUMN     "meetingPoint" TEXT NOT NULL;
