-- CreateTable
CREATE TABLE "Prizes" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "prize" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Prizes_pkey" PRIMARY KEY ("id")
);
