/*
  Warnings:

  - You are about to drop the column `blacklistEmails` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `blacklistNames` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `mealGroup` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "blacklistEmails",
DROP COLUMN "blacklistNames";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "mealGroup",
ADD COLUMN     "groupId" TEXT;

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "qrCodeStyle" JSONB DEFAULT '{}',

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Group_id_key" ON "Group"("id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
