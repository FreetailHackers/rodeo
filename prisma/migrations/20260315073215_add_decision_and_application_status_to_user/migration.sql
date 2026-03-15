-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('ACCEPTED', 'WAITLISTED', 'REJECTED', 'PENDING');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('CREATED', 'APPLIED', 'ACCEPTED', 'WAITLISTED', 'REJECTED', 'PENDING', 'CONFIRMED', 'DECLINED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "applicationStatus" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "decisionStatus" "DecisionStatus" NOT NULL DEFAULT 'PENDING';
