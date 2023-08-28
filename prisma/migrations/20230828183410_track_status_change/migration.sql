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

-- Insert user data already in db
INSERT INTO "StatusChange" ("newStatus", "timestamp", "userId")
SELECT
    u."status" AS "newStatus",
    NOW() AS "timestamp",
    u."id" AS "userId"
FROM
    auth_user u;