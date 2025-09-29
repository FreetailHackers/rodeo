-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('FAQ', 'PRIZE');

-- CreateTable
CREATE TABLE "InfoBox" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "category" "CategoryType" NOT NULL,

    CONSTRAINT "InfoBox_pkey" PRIMARY KEY ("id")
);
