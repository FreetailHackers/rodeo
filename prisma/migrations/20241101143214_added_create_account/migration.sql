-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'INVITED';

-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "teamId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "inviteUsersIsHTML" BOOLEAN NOT NULL DEFAULT false;
