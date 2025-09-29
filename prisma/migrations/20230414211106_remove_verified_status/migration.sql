/*
  Warnings:

  - The values [VERIFIED] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
UPDATE "User" SET "status" = 'CREATED' WHERE "status" = 'VERIFIED';
CREATE TYPE "Status_new" AS ENUM ('CREATED', 'APPLIED', 'ACCEPTED', 'REJECTED', 'WAITLISTED', 'CONFIRMED', 'DECLINED');
ALTER TABLE "User" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TABLE "Decision" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "Status_old";
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'CREATED';
COMMIT;
