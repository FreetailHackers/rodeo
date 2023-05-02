-- CreateTable
CREATE TABLE "Discord" (
    "id" SERIAL NOT NULL,
    "verificationRole" BIGINT NOT NULL,
    "verificationId" BIGINT NOT NULL,
    "scheduleId" BIGINT NOT NULL,
    "announcementId" BIGINT NOT NULL,

    CONSTRAINT "Discord_pkey" PRIMARY KEY ("id")
);
