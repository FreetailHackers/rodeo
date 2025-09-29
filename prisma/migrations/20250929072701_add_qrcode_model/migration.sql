-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('HACKER', 'ADMIN', 'ORGANIZER', 'JUDGE', 'VOLUNTEER', 'SPONSOR', 'MENTOR', 'UNDECLARED');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('CREATED', 'APPLIED', 'ACCEPTED', 'REJECTED', 'WAITLISTED', 'CONFIRMED', 'DECLINED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SENTENCE', 'PARAGRAPH', 'NUMBER', 'DROPDOWN', 'CHECKBOX', 'RADIO', 'FILE');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('FAQ', 'CHALLENGE', 'SPONSOR');

-- CreateTable
CREATE TABLE "AuthUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT,
    "githubId" INTEGER,
    "githubUsername" TEXT,
    "googleId" TEXT,
    "goodleUsername" TEXT,
    "provider" TEXT,
    "roles" "Role"[] DEFAULT ARRAY['HACKER']::"Role"[],
    "status" "Status" NOT NULL DEFAULT 'CREATED',
    "verifiedEmail" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AuthUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthKey" (
    "id" TEXT NOT NULL,
    "hashedPassword" TEXT,
    "userId" TEXT NOT NULL,
    "providerId" TEXT,
    "providerUserId" TEXT,

    CONSTRAINT "AuthKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SingleUseKey" (
    "id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SingleUseKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "authUserId" TEXT NOT NULL,
    "scanCount" JSONB NOT NULL DEFAULT '{}',
    "application" JSONB NOT NULL DEFAULT '{}',
    "teamId" INTEGER,
    "mealGroup" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("authUserId")
);

-- CreateTable
CREATE TABLE "QrCodeStyle" (
    "id" TEXT NOT NULL,
    "qrCodeStyle" JSONB DEFAULT '{}',

    CONSTRAINT "QrCodeStyle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" SERIAL NOT NULL,
    "body" TEXT NOT NULL,
    "published" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "userId" TEXT NOT NULL,
    "status" "Status" NOT NULL,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 0,
    "applicationOpen" BOOLEAN NOT NULL DEFAULT true,
    "rollingAdmissions" BOOLEAN NOT NULL DEFAULT false,
    "scanActions" TEXT[],
    "homepageText" TEXT NOT NULL DEFAULT 'This text can be edited from the admin panel. You can put deadlines, logistics, or other important information here.',
    "submitTemplate" TEXT NOT NULL DEFAULT 'We have received your application to our hackathon!',
    "acceptTemplate" TEXT NOT NULL DEFAULT 'You have been accepted to our hackathon!',
    "confirmTemplate" TEXT NOT NULL DEFAULT 'Thank you for confirming your attendance to our hackathon! We look forward to seeing you there!',
    "declineTemplate" TEXT NOT NULL DEFAULT 'Thank you for letting us know that you will not be able to attend. We hope to see you next year!',
    "rejectTemplate" TEXT NOT NULL DEFAULT 'We regret to inform you that we cannot offer you a spot at our hackathon this year.',
    "waitlistTemplate" TEXT NOT NULL DEFAULT 'We regret to inform you that we cannot offer you a spot at our hackathon at this time.',
    "timezone" TEXT NOT NULL DEFAULT 'America/Chicago',
    "applicationDeadline" TIMESTAMP(3),
    "applicationLimit" INTEGER,
    "daysToRSVP" INTEGER,
    "showAnnouncements" BOOLEAN NOT NULL DEFAULT true,
    "showChallenges" BOOLEAN NOT NULL DEFAULT true,
    "showFAQ" BOOLEAN NOT NULL DEFAULT true,
    "showSchedule" BOOLEAN NOT NULL DEFAULT true,
    "showSponsors" BOOLEAN NOT NULL DEFAULT true,
    "withdrawalWarningTemplate" TEXT NOT NULL DEFAULT 'We''ve noticed that your application has been withdrawn from our hackathon. If you''re still intending to submit, please ensure that you complete your edits and click ''submit''.',
    "acceptIsHTML" BOOLEAN NOT NULL DEFAULT false,
    "byStatusIsHTML" BOOLEAN NOT NULL DEFAULT false,
    "confirmIsHTML" BOOLEAN NOT NULL DEFAULT false,
    "declineIsHTML" BOOLEAN NOT NULL DEFAULT false,
    "rejectIsHTML" BOOLEAN NOT NULL DEFAULT false,
    "submitIsHTML" BOOLEAN NOT NULL DEFAULT false,
    "waitlistIsHTML" BOOLEAN NOT NULL DEFAULT false,
    "withdrawIsHTML" BOOLEAN NOT NULL DEFAULT false,
    "hackathonStartDate" TIMESTAMP(3),

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "targetGroup" TEXT[],
    "order" INTEGER NOT NULL,
    "placeholder" TEXT NOT NULL DEFAULT '',
    "options" TEXT[],
    "min" DOUBLE PRECISION,
    "max" DOUBLE PRECISION,
    "step" DOUBLE PRECISION,
    "regex" TEXT NOT NULL DEFAULT '',
    "custom" BOOLEAN,
    "multiple" BOOLEAN,
    "accept" TEXT NOT NULL DEFAULT '',
    "maxSizeMB" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "sponsorView" BOOLEAN NOT NULL DEFAULT false,
    "hideAdmission" BOOLEAN NOT NULL DEFAULT false,
    "hideScan" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start" TIMESTAMP(3),
    "end" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "prize" TEXT,
    "description" TEXT NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusChange" (
    "id" SERIAL NOT NULL,
    "newStatus" "Status" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StatusChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthUser_id_key" ON "AuthUser"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AuthUser_email_key" ON "AuthUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_id_key" ON "AuthSession"("id");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthKey_id_key" ON "AuthKey"("id");

-- CreateIndex
CREATE INDEX "AuthKey_userId_idx" ON "AuthKey"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SingleUseKey_id_key" ON "SingleUseKey"("id");

-- CreateIndex
CREATE INDEX "SingleUseKey_userId_idx" ON "SingleUseKey"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_authUserId_key" ON "User"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "QrCodeStyle_id_key" ON "QrCodeStyle"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Decision_userId_key" ON "Decision"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_order_key" ON "Question"("order");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthKey" ADD CONSTRAINT "AuthKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SingleUseKey" ADD CONSTRAINT "SingleUseKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_authUserId_fkey" FOREIGN KEY ("authUserId") REFERENCES "AuthUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("authUserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusChange" ADD CONSTRAINT "StatusChange_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("authUserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("authUserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
