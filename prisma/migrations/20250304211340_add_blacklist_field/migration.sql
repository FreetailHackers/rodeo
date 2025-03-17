-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "blacklist" TEXT[] DEFAULT ARRAY[]::TEXT[];
