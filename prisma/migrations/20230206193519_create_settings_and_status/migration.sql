-- CreateEnum
CREATE TYPE "Status" AS ENUM ('CREATED', 'VERIFIED', 'APPLIED', 'ACCEPTED', 'REJECTED', 'WAITLISTED', 'CONFIRMED', 'DECLINED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'CREATED';

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "applicationOpen" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
