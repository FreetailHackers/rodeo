/*
  Warnings:

  - Made the column `description` on table `PrizeBox` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PrizeBox" ALTER COLUMN "description" SET NOT NULL;
