/*
  Warnings:

  - You are about to drop the column `value` on the `PrizeBox` table. All the data in the column will be lost.
  - Added the required column `prizeType` to the `PrizeBox` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PrizeType" AS ENUM ('FIRST', 'SECOND', 'THIRD', 'SPONSOR', 'CHALLENGE');

-- AlterTable
ALTER TABLE "PrizeBox" DROP COLUMN "value",
ADD COLUMN     "prizeType" "PrizeType" NOT NULL;
