/*
  Warnings:

  - You are about to drop the column `blackList` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "blackList",
ADD COLUMN     "blackLists" TEXT[];
