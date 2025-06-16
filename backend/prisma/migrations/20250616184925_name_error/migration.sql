/*
  Warnings:

  - You are about to drop the column `metData` on the `Action` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Action" DROP COLUMN "metData",
ADD COLUMN     "metaData" JSONB;
