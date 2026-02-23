-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "acceptSubject" TEXT NOT NULL DEFAULT 'You''ve been accepted!',
ADD COLUMN     "confirmSubject" TEXT NOT NULL DEFAULT 'Attendance Confirmed',
ADD COLUMN     "declineSubject" TEXT NOT NULL DEFAULT 'Sorry you can''t make it',
ADD COLUMN     "emailFromAddress" TEXT NOT NULL DEFAULT 'hello@freetailhackers.com',
ADD COLUMN     "emailFromName" TEXT NOT NULL DEFAULT 'Rodeo',
ADD COLUMN     "rejectSubject" TEXT NOT NULL DEFAULT 'Update on your application',
ADD COLUMN     "submitSubject" TEXT NOT NULL DEFAULT 'Application Received',
ADD COLUMN     "waitlistSubject" TEXT NOT NULL DEFAULT 'Update on your application';
