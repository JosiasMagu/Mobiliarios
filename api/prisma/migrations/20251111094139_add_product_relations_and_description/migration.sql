/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Product_categoryId_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "createdAt",
ADD COLUMN     "attributes" JSONB,
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);
