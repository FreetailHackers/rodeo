-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "RSVPTemplate" TEXT NOT NULL DEFAULT 'Thank you for signing up to our hackathon!',
ADD COLUMN     "submitTemplate" TEXT NOT NULL DEFAULT 'Thank you for submitting your application!',
ADD COLUMN     "withdrawTemplate" TEXT NOT NULL DEFAULT 'We''re sorry to see you go!';
