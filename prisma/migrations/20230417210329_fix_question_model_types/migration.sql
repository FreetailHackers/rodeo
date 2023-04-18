/*
  Warnings:

  - Made the column `placeholder` on table `Question` required. This step will fail if there are existing NULL values in that column.
  - Made the column `regex` on table `Question` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "placeholder" SET NOT NULL,
ALTER COLUMN "placeholder" SET DEFAULT '',
ALTER COLUMN "min" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "max" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "step" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "regex" SET NOT NULL,
ALTER COLUMN "regex" SET DEFAULT '';
