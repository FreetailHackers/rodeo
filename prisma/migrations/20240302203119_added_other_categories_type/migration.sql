/*
  Warnings:

  - Added the required column `type` to the `OtherCategories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OtherCategories" ADD COLUMN     "type" TEXT NOT NULL;
