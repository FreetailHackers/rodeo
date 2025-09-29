/*
  Warnings:

  - The `classification` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `dietaryRestrictions` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `gender` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `graduation` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `race` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "classification",
ADD COLUMN     "classification" TEXT,
DROP COLUMN "dietaryRestrictions",
ADD COLUMN     "dietaryRestrictions" TEXT,
DROP COLUMN "gender",
ADD COLUMN     "gender" TEXT,
DROP COLUMN "graduation",
ADD COLUMN     "graduation" TEXT,
DROP COLUMN "race",
ADD COLUMN     "race" TEXT[];

-- DropEnum
DROP TYPE "Classification";

-- DropEnum
DROP TYPE "DietaryRestriction";

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "Graduation";

-- DropEnum
DROP TYPE "Race";
