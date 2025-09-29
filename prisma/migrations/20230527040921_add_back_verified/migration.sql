/*
  Warnings:

  - Made the column `email` on table `auth_user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `auth_user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `auth_user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'VERIFIED';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "authUserId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "auth_user" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'HACKER',
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'CREATED';
