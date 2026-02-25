-- CreateTable
CREATE TABLE "wishlists" (
    "id" TEXT NOT NULL,
    "touristId" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_touristId_tourId_key" ON "wishlists"("touristId", "tourId");

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "tourists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;
