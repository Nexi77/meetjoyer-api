/*
  Warnings:

  - The `roles` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SPEAKER');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('LECTURE', 'CONFERENCE', 'MONASTERY', 'WORKSHOP', 'MEETUP');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "roles",
ADD COLUMN     "roles" "Role"[] DEFAULT ARRAY['USER']::"Role"[];

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "organiserId" INTEGER NOT NULL,
    "eventType" "EventType" NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SpeakerEvents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ParticipantEvents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SpeakerEvents_AB_unique" ON "_SpeakerEvents"("A", "B");

-- CreateIndex
CREATE INDEX "_SpeakerEvents_B_index" ON "_SpeakerEvents"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ParticipantEvents_AB_unique" ON "_ParticipantEvents"("A", "B");

-- CreateIndex
CREATE INDEX "_ParticipantEvents_B_index" ON "_ParticipantEvents"("B");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organiserId_fkey" FOREIGN KEY ("organiserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpeakerEvents" ADD CONSTRAINT "_SpeakerEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpeakerEvents" ADD CONSTRAINT "_SpeakerEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParticipantEvents" ADD CONSTRAINT "_ParticipantEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParticipantEvents" ADD CONSTRAINT "_ParticipantEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
