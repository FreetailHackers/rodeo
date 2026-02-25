-- AlterTable
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "emailFromName" TEXT NOT NULL DEFAULT 'Rodeo';
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "emailFromAddress" TEXT NOT NULL DEFAULT 'hello@freetailhackers.com';
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "submitSubject" TEXT NOT NULL DEFAULT 'Application Received';
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "acceptSubject" TEXT NOT NULL DEFAULT 'You''ve been accepted!';
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "confirmSubject" TEXT NOT NULL DEFAULT 'Attendance Confirmed';
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "declineSubject" TEXT NOT NULL DEFAULT 'Sorry you can''t make it';
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "rejectSubject" TEXT NOT NULL DEFAULT 'Update on your application';
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "waitlistSubject" TEXT NOT NULL DEFAULT 'Update on your application';
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "spongebobCase" BOOLEAN NOT NULL DEFAULT false;
