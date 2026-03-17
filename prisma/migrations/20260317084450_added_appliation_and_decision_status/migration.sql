-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('ACCEPTED', 'WAITLISTED', 'REJECTED', 'PENDING');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('CREATED', 'APPLIED', 'ACCEPTED', 'WAITLISTED', 'REJECTED', 'CONFIRMED', 'DECLINED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "applicationStatus" "ApplicationStatus" NOT NULL DEFAULT 'CREATED',
ADD COLUMN     "decisionStatus" "DecisionStatus";
