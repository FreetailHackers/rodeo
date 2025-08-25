/*
  Warnings:

  - You are about to drop the column `password` on the `AuthUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuthUser" DROP COLUMN "password",
ADD COLUMN     "hashedPassword" TEXT;
