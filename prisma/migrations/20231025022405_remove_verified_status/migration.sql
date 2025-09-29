/*
  Warnings:

  - The values [VERIFIED] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
DROP TRIGGER user_insert_status_change_trigger ON "AuthUser";
DROP TRIGGER user_update_status_change_trigger ON "AuthUser";
DROP FUNCTION user_status_change_trigger_function();
ALTER TABLE "AuthUser" ADD COLUMN     "verifiedEmail" BOOLEAN NOT NULL DEFAULT false;
UPDATE "AuthUser" SET "verifiedEmail" = true WHERE "status" != 'CREATED';
UPDATE "AuthUser" SET "status" = 'CREATED' WHERE "status" = 'VERIFIED';
DELETE FROM "StatusChange" WHERE "newStatus" = 'VERIFIED';

-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('CREATED', 'APPLIED', 'ACCEPTED', 'REJECTED', 'WAITLISTED', 'CONFIRMED', 'DECLINED');
ALTER TABLE "AuthUser" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "AuthUser" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TABLE "Decision" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TABLE "StatusChange" ALTER COLUMN "newStatus" TYPE "Status_new" USING ("newStatus"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "Status_old";
ALTER TABLE "AuthUser" ALTER COLUMN "status" SET DEFAULT 'CREATED';
COMMIT;

CREATE OR REPLACE FUNCTION user_status_change_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO "StatusChange" ("userId", "newStatus")
    VALUES (NEW.id, NEW.status);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_insert_status_change_trigger
AFTER INSERT ON "AuthUser"
FOR EACH ROW
EXECUTE FUNCTION user_status_change_trigger_function();

CREATE TRIGGER user_update_status_change_trigger
AFTER UPDATE OF "status" ON "AuthUser"
FOR EACH ROW
EXECUTE FUNCTION user_status_change_trigger_function();
