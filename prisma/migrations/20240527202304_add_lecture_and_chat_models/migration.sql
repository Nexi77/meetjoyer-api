/*
  Warnings:

  - You are about to drop the `_ParticipantEvents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SpeakerEvents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ParticipantEvents" DROP CONSTRAINT "_ParticipantEvents_A_fkey";

-- DropForeignKey
ALTER TABLE "_ParticipantEvents" DROP CONSTRAINT "_ParticipantEvents_B_fkey";

-- DropForeignKey
ALTER TABLE "_SpeakerEvents" DROP CONSTRAINT "_SpeakerEvents_A_fkey";

-- DropForeignKey
ALTER TABLE "_SpeakerEvents" DROP CONSTRAINT "_SpeakerEvents_B_fkey";

-- DropTable
DROP TABLE "_ParticipantEvents";

-- DropTable
DROP TABLE "_SpeakerEvents";

-- CreateTable
CREATE TABLE "chats" (
    "id" SERIAL NOT NULL,
    "lectureId" INTEGER NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lectures" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "eventId" INTEGER NOT NULL,
    "speakerId" INTEGER NOT NULL,

    CONSTRAINT "lectures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ParticipantLectures" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "chats_lectureId_key" ON "chats"("lectureId");

-- CreateIndex
CREATE UNIQUE INDEX "_ParticipantLectures_AB_unique" ON "_ParticipantLectures"("A", "B");

-- CreateIndex
CREATE INDEX "_ParticipantLectures_B_index" ON "_ParticipantLectures"("B");

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "lectures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParticipantLectures" ADD CONSTRAINT "_ParticipantLectures_A_fkey" FOREIGN KEY ("A") REFERENCES "lectures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParticipantLectures" ADD CONSTRAINT "_ParticipantLectures_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
