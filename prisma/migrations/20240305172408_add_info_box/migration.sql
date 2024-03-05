/*
  Warnings:

  - You are about to drop the `OtherCategories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "OtherCategories";

-- CreateTable
CREATE TABLE "InfoBox" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "category" "CategoryType" NOT NULL,

    CONSTRAINT "InfoBox_pkey" PRIMARY KEY ("id")
);
