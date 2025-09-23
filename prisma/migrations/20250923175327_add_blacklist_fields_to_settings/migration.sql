-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "blacklistEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "blacklistNames" TEXT[] DEFAULT ARRAY[]::TEXT[];
