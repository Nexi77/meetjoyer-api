/*
  Warnings:

  - Made the column `eventId` on table `lectures` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "lectures" DROP CONSTRAINT "lectures_eventId_fkey";

-- AlterTable
ALTER TABLE "lectures" ALTER COLUMN "eventId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
