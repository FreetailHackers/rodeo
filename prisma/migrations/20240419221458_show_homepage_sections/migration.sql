-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "showAnnouncements" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showChallenges" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showFAQ" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showSchedule" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showSponsors" BOOLEAN NOT NULL DEFAULT true;
