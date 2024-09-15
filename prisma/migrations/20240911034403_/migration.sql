/*
  Warnings:

  - Added the required column `dietaryRestrictions` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dietaryRestrictions" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;
