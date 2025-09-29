/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NONBINARY', 'OTHER', 'REFUSE');

-- CreateEnum
CREATE TYPE "Race" AS ENUM ('AMERICAN_INDIAN', 'ASIAN', 'BLACK', 'HISPANIC', 'NATIVE_HAWAIIAN', 'WHITE', 'MULTIPLE', 'OTHER', 'REFUSE');

-- CreateEnum
CREATE TYPE "Classification" AS ENUM ('FRESHMAN', 'SOPHOMORE', 'JUNIOR', 'SENIOR', 'MASTERS', 'DOCTORATE');

-- CreateEnum
CREATE TYPE "Graduation" AS ENUM ('S2023', 'F2023', 'S2024', 'F2024', 'S2025', 'F2025', 'S2026', 'OTHER');

-- CreateEnum
CREATE TYPE "DietaryRestriction" AS ENUM ('NONE', 'NO_PORK', 'VEGETARIAN', 'VEGAN');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "accommodations" TEXT,
ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "classification" "Classification",
ADD COLUMN     "codeOfConductAgreed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dietaryRestrictions" "DietaryRestriction",
ADD COLUMN     "excitedAbout" TEXT,
ADD COLUMN     "firstGeneration" BOOLEAN,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "github" TEXT,
ADD COLUMN     "graduation" "Graduation",
ADD COLUMN     "hackathonsAttended" INTEGER,
ADD COLUMN     "international" BOOLEAN,
ADD COLUMN     "liabilityWaiverAgreed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "lunch" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "other" TEXT,
ADD COLUMN     "photoReleaseAgreed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preferredName" TEXT,
ADD COLUMN     "pronouns" TEXT,
ADD COLUMN     "race" "Race"[],
ADD COLUMN     "referrer" TEXT,
ADD COLUMN     "resume" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "workshops" TEXT[];
