/*
  Warnings:

  - You are about to drop the column `role` on the `auth_user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "auth_user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "auth_user" RENAME COLUMN "role" TO "roles";
ALTER TABLE "auth_user" ALTER COLUMN "roles" SET DATA TYPE "Role"[] USING ARRAY["roles"]::"Role"[];
ALTER TABLE "auth_user" ALTER COLUMN "roles" SET DEFAULT ARRAY['HACKER']::"Role"[];