-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'MISSED';

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "hackathonStartDate" TIMESTAMP(3);
