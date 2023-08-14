-- CreateTable
CREATE TABLE "Timestamp" (
    "id" SERIAL NOT NULL,
    "newStatus" "Status" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Timestamp_pkey" PRIMARY KEY ("id")
);
