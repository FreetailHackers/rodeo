/*
  Warnings:

  - You are about to drop the `Timestamp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Timestamp";

-- CreateTable
CREATE TABLE "StatusChange" (
    "id" SERIAL NOT NULL,
    "newStatus" "Status" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StatusChange_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StatusChange" ADD CONSTRAINT "StatusChange_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("authUserId") ON DELETE CASCADE ON UPDATE CASCADE;
