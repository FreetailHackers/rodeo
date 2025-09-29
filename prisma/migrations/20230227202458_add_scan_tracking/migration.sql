-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "scanActions" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "scanCount" JSONB NOT NULL DEFAULT '{}';
