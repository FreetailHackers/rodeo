/*
  Warnings:

  - You are about to drop the column `hashed_password` on the `AuthKey` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `AuthKey` table. All the data in the column will be lost.
  - You are about to drop the column `active_expires` on the `AuthSession` table. All the data in the column will be lost.
  - You are about to drop the column `idle_expires` on the `AuthSession` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `AuthSession` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `SingleUseKey` table. All the data in the column will be lost.
  - Added the required column `userId` to the `AuthKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `AuthSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `AuthSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `SingleUseKey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'MENTOR';
ALTER TYPE "Role" ADD VALUE 'UNDECLARED';

-- DropForeignKey
ALTER TABLE "AuthKey" DROP CONSTRAINT "AuthKey_user_id_fkey";

-- DropForeignKey
ALTER TABLE "AuthSession" DROP CONSTRAINT "AuthSession_user_id_fkey";

-- DropForeignKey
ALTER TABLE "SingleUseKey" DROP CONSTRAINT "SingleUseKey_user_id_fkey";

-- DropIndex
DROP INDEX "AuthKey_user_id_idx";

-- DropIndex
DROP INDEX "AuthSession_user_id_idx";

-- DropIndex
DROP INDEX "SingleUseKey_user_id_idx";

-- AlterTable
ALTER TABLE "AuthKey" DROP COLUMN "hashed_password",
DROP COLUMN "user_id",
ADD COLUMN     "hashedPassword" TEXT,
ADD COLUMN     "providerId" TEXT,
ADD COLUMN     "providerUserId" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AuthSession" DROP COLUMN "active_expires",
DROP COLUMN "idle_expires",
DROP COLUMN "user_id",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AuthUser" ADD COLUMN     "githubId" INTEGER,
ADD COLUMN     "githubUsername" TEXT,
ADD COLUMN     "goodleUsername" TEXT,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "hashedPassword" TEXT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "targetGroup" TEXT[];

-- AlterTable
ALTER TABLE "SingleUseKey" DROP COLUMN "user_id",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "AuthKey_userId_idx" ON "AuthKey"("userId");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");

-- CreateIndex
CREATE INDEX "SingleUseKey_userId_idx" ON "SingleUseKey"("userId");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthKey" ADD CONSTRAINT "AuthKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SingleUseKey" ADD CONSTRAINT "SingleUseKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
