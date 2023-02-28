-- CreateTable
CREATE TABLE "HelpTicket" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "detail" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "location" TEXT,
    "priority" TEXT[],
    "status" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpTicket_pkey" PRIMARY KEY ("id")
);
