-- AlterTable
ALTER TABLE "guides" ALTER COLUMN "expertise" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "dailyRate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tourists" ALTER COLUMN "preferences" SET DEFAULT ARRAY[]::TEXT[];
