/*
  Warnings:

  - You are about to drop the `Prizes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Prizes";

-- CreateTable
CREATE TABLE "PrizeBox" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "prize" TEXT NOT NULL,
    "description" TEXT,
    "value" INTEGER NOT NULL,

    CONSTRAINT "PrizeBox_pkey" PRIMARY KEY ("id")
);
