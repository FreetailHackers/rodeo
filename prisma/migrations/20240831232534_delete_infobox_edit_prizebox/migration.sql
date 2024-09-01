/*
  Warnings:

  - You are about to drop the column `category` on the `PrizeBox` table. All the data in the column will be lost.
  - You are about to drop the `InfoBox` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `title` to the `PrizeBox` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PrizeBox" DROP COLUMN "category",
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "prize" DROP NOT NULL;

-- DropTable
DROP TABLE "InfoBox";
