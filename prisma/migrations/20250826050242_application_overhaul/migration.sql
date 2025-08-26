/*
  Warnings:

  - You are about to drop the column `password` on the `AuthUser` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'MENTOR';
ALTER TYPE "Role" ADD VALUE 'UNDECLARED';

-- AlterTable
ALTER TABLE "AuthUser" DROP COLUMN "password",
ADD COLUMN     "hashedPassword" TEXT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "targetGroup" TEXT[];
