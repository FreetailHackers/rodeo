-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "start" DROP NOT NULL,
ALTER COLUMN "end" DROP NOT NULL;

-- CreateTable
CREATE TABLE "FAQ" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);
