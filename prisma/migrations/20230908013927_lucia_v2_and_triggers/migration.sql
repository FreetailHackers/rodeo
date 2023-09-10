/*
  Warnings:

  - You are about to drop the column `expires` on the `auth_key` table. All the data in the column will be lost.
  - You are about to drop the column `primary_key` on the `auth_key` table. All the data in the column will be lost.

*/
-- AlterTable
/* Part of migrating to Lucia v2 */
DELETE FROM auth_key
WHERE expires != null;


ALTER TABLE "auth_key" DROP COLUMN "expires",
DROP COLUMN "primary_key";

-- CreateTable
CREATE TABLE "SingleUseKey" (
    "id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "SingleUseKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SingleUseKey_id_key" ON "SingleUseKey"("id");

-- CreateIndex
CREATE INDEX "SingleUseKey_user_id_idx" ON "SingleUseKey"("user_id");

-- AddForeignKey
ALTER TABLE "SingleUseKey" ADD CONSTRAINT "SingleUseKey_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;


/* Rename Lucia tables to use PascalCase to be consistent with the rest of the schema */
ALTER TABLE "auth_user" RENAME TO "AuthUser";
ALTER TABLE "auth_session" RENAME TO "AuthSession";
ALTER TABLE "auth_key" RENAME TO "AuthKey";

-- AlterTable
ALTER TABLE "AuthKey" RENAME CONSTRAINT "auth_key_pkey" TO "AuthKey_pkey";

-- AlterTable
ALTER TABLE "AuthSession" RENAME CONSTRAINT "auth_session_pkey" TO "AuthSession_pkey";

-- AlterTable
ALTER TABLE "AuthUser" RENAME CONSTRAINT "auth_user_pkey" TO "AuthUser_pkey";

-- RenameForeignKey
ALTER TABLE "AuthKey" RENAME CONSTRAINT "auth_key_user_id_fkey" TO "AuthKey_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "AuthSession" RENAME CONSTRAINT "auth_session_user_id_fkey" TO "AuthSession_user_id_fkey";

-- RenameIndex
ALTER INDEX "auth_key_id_key" RENAME TO "AuthKey_id_key";

-- RenameIndex
ALTER INDEX "auth_key_user_id_idx" RENAME TO "AuthKey_user_id_idx";

-- RenameIndex
ALTER INDEX "auth_session_id_key" RENAME TO "AuthSession_id_key";

-- RenameIndex
ALTER INDEX "auth_session_user_id_idx" RENAME TO "AuthSession_user_id_idx";

-- RenameIndex
ALTER INDEX "auth_user_email_key" RENAME TO "AuthUser_email_key";

-- RenameIndex
ALTER INDEX "auth_user_id_key" RENAME TO "AuthUser_id_key";


/* Trigger to automatically insert into User when a new AuthUser is created
   This solves consistency issues when a status change or search is attempted on
   an AuthUser that doesn't have a corresponding User yet
*/
CREATE OR REPLACE FUNCTION auth_user_insert_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "User" WHERE "authUserId" = NEW.id) THEN
        INSERT INTO "User" ("authUserId")
        VALUES (NEW.id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- IMPORTANT: This trigger must come alphabetically before the others to ensure it runs first!
CREATE TRIGGER auth_user_insert_user_trigger
AFTER INSERT ON "AuthUser"
FOR EACH ROW
EXECUTE FUNCTION auth_user_insert_trigger_function();

/* Trigger to automatically generate a status change when a user is created or changes status */
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


/* Generate a User for each AuthUser that doesn't have one yet */
INSERT INTO "User" ("authUserId")
SELECT "AuthUser".id
FROM "AuthUser"
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE "authUserId" = "AuthUser".id);
