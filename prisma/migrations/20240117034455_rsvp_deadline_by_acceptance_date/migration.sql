/*
  Warnings:

  - You are about to drop the column `confirmBy` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "confirmBy",
ADD COLUMN     "daysToRSVP" INTEGER;
