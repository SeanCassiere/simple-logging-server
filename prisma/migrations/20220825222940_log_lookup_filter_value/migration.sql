-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "lookupFilterValue" TEXT;

-- CreateIndex
CREATE INDEX "Log_createdAt_idx" ON "Log"("createdAt");

-- CreateIndex
CREATE INDEX "Service_createdAt_idx" ON "Service"("createdAt");
