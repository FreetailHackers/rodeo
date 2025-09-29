/*
  Warnings:

  - The values [MULTISELECT] on the enum `QuestionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "custom" BOOLEAN,
ADD COLUMN     "multiple" BOOLEAN;

UPDATE "Question" SET "custom" = FALSE, "multiple" = FALSE WHERE "type" = 'DROPDOWN';
UPDATE "Question" SET "custom" = FALSE, "multiple" = TRUE, "type" = 'DROPDOWN' WHERE "type" = 'MULTISELECT';

-- AlterEnum
BEGIN;
CREATE TYPE "QuestionType_new" AS ENUM ('SENTENCE', 'PARAGRAPH', 'NUMBER', 'DROPDOWN', 'CHECKBOX', 'RADIO', 'FILE');
ALTER TABLE "Question" ALTER COLUMN "type" TYPE "QuestionType_new" USING ("type"::text::"QuestionType_new");
ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "QuestionType_old";
COMMIT;
