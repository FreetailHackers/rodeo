-- CreateEnum
CREATE TYPE "Role" AS ENUM ('HACKER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'HACKER';
