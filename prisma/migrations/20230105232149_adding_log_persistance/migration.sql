-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "isPersisted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "isPersisted" BOOLEAN NOT NULL DEFAULT false;
