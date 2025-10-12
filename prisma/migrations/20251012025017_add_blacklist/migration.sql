/*
  Warnings:

  - You are about to drop the column `blacklistEmails` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `blacklistNames` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "blacklistEmails",
DROP COLUMN "blacklistNames";
