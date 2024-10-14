/*
  Warnings:

  - You are about to drop the column `endTime` on the `lectures` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `lectures` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "lectures" DROP COLUMN "endTime",
DROP COLUMN "startTime";
