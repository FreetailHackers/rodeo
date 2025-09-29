-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "rollingAdmissions" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Decision" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "Status" NOT NULL,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Decision_userId_key" ON "Decision"("userId");

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
