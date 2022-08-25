-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_serviceId_fkey";

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
