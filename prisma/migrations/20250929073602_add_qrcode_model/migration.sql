-- CreateTable
CREATE TABLE "QrCodeStyle" (
    "id" TEXT NOT NULL,
    "qrCodeStyle" JSONB DEFAULT '{}',

    CONSTRAINT "QrCodeStyle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QrCodeStyle_id_key" ON "QrCodeStyle"("id");
