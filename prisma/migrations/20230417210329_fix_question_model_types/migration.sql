/*
  Warnings:

  - Made the column `placeholder` on table `Question` required. This step will fail if there are existing NULL values in that column.
  - Made the column `regex` on table `Question` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
/* We must set the default value to '' before making the column required */
UPDATE "Question" SET "placeholder" = '' WHERE "placeholder" IS NULL;
UPDATE "Question" SET "regex" = '' WHERE "regex" IS NULL;
/* Prisma generated migration */
ALTER TABLE "Question" ALTER COLUMN "placeholder" SET NOT NULL,
ALTER COLUMN "placeholder" SET DEFAULT '',
ALTER COLUMN "min" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "max" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "step" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "regex" SET NOT NULL,
ALTER COLUMN "regex" SET DEFAULT '';
