/*
  Warnings:

  - You are about to drop the column `devpostUrl` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `tracks` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `lunchGroup` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Team" DROP COLUMN "devpostUrl",
DROP COLUMN "tracks";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "lunchGroup",
DROP COLUMN "name",
ADD COLUMN     "group" CHAR(1);
