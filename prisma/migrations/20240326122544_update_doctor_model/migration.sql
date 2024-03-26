/*
  Warnings:

  - You are about to drop the column `exprience` on the `doctors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "exprience",
ADD COLUMN     "experience" INTEGER NOT NULL DEFAULT 0;
