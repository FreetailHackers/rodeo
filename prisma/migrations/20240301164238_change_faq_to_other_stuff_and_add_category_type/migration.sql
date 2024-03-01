/*
  Warnings:

  - You are about to drop the `FAQ` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('FAQ', 'PRIZE');

-- DropTable
DROP TABLE "FAQ";

-- CreateTable
CREATE TABLE "OtherStuff" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,

    CONSTRAINT "OtherStuff_pkey" PRIMARY KEY ("id")
);
