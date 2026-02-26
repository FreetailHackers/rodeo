/*
  Warnings:

  - You are about to drop the column `acceptSubject` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `confirmSubject` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `declineSubject` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `emailFromAddress` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `emailFromName` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `rejectSubject` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `spongebobCase` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `submitSubject` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `waitlistSubject` on the `Settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "acceptSubject",
DROP COLUMN "confirmSubject",
DROP COLUMN "declineSubject",
DROP COLUMN "emailFromAddress",
DROP COLUMN "emailFromName",
DROP COLUMN "rejectSubject",
DROP COLUMN "spongebobCase",
DROP COLUMN "submitSubject",
DROP COLUMN "waitlistSubject";

-- CreateTable
CREATE TABLE "HonkCounter" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HonkCounter_pkey" PRIMARY KEY ("id")
);
