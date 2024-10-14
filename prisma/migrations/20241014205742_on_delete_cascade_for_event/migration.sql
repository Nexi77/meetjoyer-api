-- DropForeignKey
ALTER TABLE "lectures" DROP CONSTRAINT "lectures_eventId_fkey";

-- AddForeignKey
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
