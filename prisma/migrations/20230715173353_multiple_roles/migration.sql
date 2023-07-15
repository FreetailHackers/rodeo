/*
  Warnings:

  - Changed the column `role` on the `auth_user` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterTable
ALTER TABLE "auth_user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "auth_user" ALTER COLUMN "role" SET DATA TYPE "Role"[] USING ARRAY["role"]::"Role"[];
ALTER TABLE "auth_user" ALTER COLUMN "role" SET DEFAULT ARRAY['HACKER']::"Role"[];