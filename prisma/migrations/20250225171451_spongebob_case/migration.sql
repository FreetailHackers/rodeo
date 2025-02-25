/*
  Warnings:

  - You are about to drop the `InfoBox` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "start" DROP NOT NULL,
ALTER COLUMN "end" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "spongebobCase" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "InfoBox";

-- CreateTable
CREATE TABLE "FAQ" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "prize" TEXT,
    "description" TEXT NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);
