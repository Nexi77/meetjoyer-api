-- DropForeignKey
ALTER TABLE "lectures" DROP CONSTRAINT "lectures_eventId_fkey";

-- AlterTable
ALTER TABLE "lectures" ALTER COLUMN "eventId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
