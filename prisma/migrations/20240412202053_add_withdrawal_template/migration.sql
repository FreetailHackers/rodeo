-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "withdrawalWarningTemplate" TEXT NOT NULL DEFAULT 'You started editing your application but did not resubmit it so it is currently withdrawn.';
