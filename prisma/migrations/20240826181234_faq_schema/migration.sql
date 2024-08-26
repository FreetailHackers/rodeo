/*
  Warnings:

  - The values [FAQ] on the enum `CategoryType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CategoryType_new" AS ENUM ('CHALLENGE', 'SPONSOR');
ALTER TABLE "InfoBox" ALTER COLUMN "category" TYPE "CategoryType_new" USING ("category"::text::"CategoryType_new");
ALTER TYPE "CategoryType" RENAME TO "CategoryType_old";
ALTER TYPE "CategoryType_new" RENAME TO "CategoryType";
DROP TYPE "CategoryType_old";
COMMIT;

-- CreateTable
CREATE TABLE "FAQ" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);
