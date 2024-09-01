/*
  Warnings:

  - You are about to drop the `InfoBox` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PrizeType" AS ENUM ('FIRST', 'SECOND', 'THIRD', 'SPONSOR', 'CHALLENGE');

-- DropTable
DROP TABLE "InfoBox";

-- CreateTable
CREATE TABLE "PrizeBox" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "prize" TEXT,
    "prizeType" "PrizeType" NOT NULL,

    CONSTRAINT "PrizeBox_pkey" PRIMARY KEY ("id")
);
