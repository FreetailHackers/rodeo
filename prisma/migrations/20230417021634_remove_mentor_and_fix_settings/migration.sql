/*
  Warnings:

  - The values [CHECKBOXES] on the enum `QuestionType` will be removed. If these variants are still used in the database, this will fail.
  - The values [MENTOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `RSVPTemplate` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `acceptanceTemplate` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `withdrawTemplate` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
/* Prisma-generated migration doesn't support renaming enums, so we have to do it manually
UPDATE "Question" SET "type" = 'CHECKBOX' WHERE "type" = 'CHECKBOXES';
CREATE TYPE "QuestionType_new" AS ENUM ('SENTENCE', 'PARAGRAPH', 'NUMBER', 'DROPDOWN', 'MULTISELECT', 'CHECKBOX', 'RADIO', 'FILE');
ALTER TABLE "Question" ALTER COLUMN "type" TYPE "QuestionType_new" USING ("type"::text::"QuestionType_new");
ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "QuestionType_old";
*/
ALTER TYPE "QuestionType" RENAME VALUE 'CHECKBOXES' TO 'CHECKBOX';
COMMIT;

-- AlterEnum
BEGIN;
UPDATE "User" SET "role" = 'ORGANIZER' WHERE "role" = 'MENTOR';
CREATE TYPE "Role_new" AS ENUM ('HACKER', 'ADMIN', 'ORGANIZER', 'JUDGE', 'VOLUNTEER', 'SPONSOR');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'HACKER';
COMMIT;

-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "RSVPTemplate",
DROP COLUMN "acceptanceTemplate",
DROP COLUMN "withdrawTemplate",
ADD COLUMN     "acceptTemplate" TEXT NOT NULL DEFAULT 'You have been accepted to our hackathon!',
ADD COLUMN     "confirmTemplate" TEXT NOT NULL DEFAULT 'Thank you for confirming your attendance to our hackathon! We look forward to seeing you there!',
ADD COLUMN     "declineTemplate" TEXT NOT NULL DEFAULT 'Thank you for letting us know that you will not be able to attend. We hope to see you next year!',
ADD COLUMN     "rejectTemplate" TEXT NOT NULL DEFAULT 'We regret to inform you that we cannot offer you a spot at our hackathon this year.',
ADD COLUMN     "waitlistTemplate" TEXT NOT NULL DEFAULT 'We regret to inform you that we cannot offer you a spot at our hackathon at this time.',
ALTER COLUMN "submitTemplate" SET DEFAULT 'We have received your application to our hackathon!';
