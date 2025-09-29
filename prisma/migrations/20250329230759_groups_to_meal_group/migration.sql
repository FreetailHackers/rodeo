/*
  Warnings:

  - You are about to drop the column `group` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "group",
ADD COLUMN     "mealGroup" TEXT;
