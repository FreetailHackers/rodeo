-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "applicationDeadline" TIMESTAMP(3),
ADD COLUMN     "applicationLimit" INTEGER NOT NULL DEFAULT 0;
