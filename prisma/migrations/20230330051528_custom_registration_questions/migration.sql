/*
  Warnings:

  - You are about to drop the column `accommodations` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `allergies` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `classification` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `codeOfConductAgreed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dietaryRestrictions` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `excitedAbout` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firstGeneration` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `github` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `graduation` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hackathonsAttended` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `international` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `liabilityWaiverAgreed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lunch` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `major` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `other` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `photoReleaseAgreed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferredName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `pronouns` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `race` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `referrer` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resume` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `workshops` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SENTENCE', 'PARAGRAPH', 'NUMBER', 'DROPDOWN', 'MULTISELECT', 'CHECKBOXES', 'RADIO', 'FILE');

-- AlterTable
ALTER TABLE "Settings" ALTER COLUMN "info" SET DEFAULT 'Put everything anybody may need to know about your hackathon here.';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "accommodations",
DROP COLUMN "allergies",
DROP COLUMN "classification",
DROP COLUMN "codeOfConductAgreed",
DROP COLUMN "dietaryRestrictions",
DROP COLUMN "excitedAbout",
DROP COLUMN "firstGeneration",
DROP COLUMN "fullName",
DROP COLUMN "gender",
DROP COLUMN "github",
DROP COLUMN "graduation",
DROP COLUMN "hackathonsAttended",
DROP COLUMN "international",
DROP COLUMN "liabilityWaiverAgreed",
DROP COLUMN "linkedin",
DROP COLUMN "lunch",
DROP COLUMN "major",
DROP COLUMN "other",
DROP COLUMN "photoReleaseAgreed",
DROP COLUMN "preferredName",
DROP COLUMN "pronouns",
DROP COLUMN "race",
DROP COLUMN "referrer",
DROP COLUMN "resume",
DROP COLUMN "website",
DROP COLUMN "workshops",
ADD COLUMN     "application" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "placeholder" TEXT,
    "options" TEXT[],
    "min" INTEGER,
    "max" INTEGER,
    "step" INTEGER,
    "regex" TEXT,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Question_order_key" ON "Question"("order");
