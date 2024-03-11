-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "hideAdmission" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hideScan" BOOLEAN NOT NULL DEFAULT false;
