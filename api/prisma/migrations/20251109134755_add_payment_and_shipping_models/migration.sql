/*
  Warnings:

  - You are about to drop the column `createdAt` on the `payment_methods` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `payment_methods` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `shipping_rules` table. All the data in the column will be lost.
  - You are about to drop the column `maxWeight` on the `shipping_rules` table. All the data in the column will be lost.
  - You are about to drop the column `minWeight` on the `shipping_rules` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `shipping_rules` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `shipping_rules` table. All the data in the column will be lost.
  - Added the required column `type` to the `payment_methods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `payment_methods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `base_cost` to the `shipping_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `shipping_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service` to the `shipping_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `shipping_rules` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('EMOLA', 'MPESA', 'BANK');

-- CreateEnum
CREATE TYPE "ShippingService" AS ENUM ('STANDARD', 'EXPRESS', 'PICKUP', 'ZONE');

-- AlterTable
ALTER TABLE "payment_methods" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "account_holder" TEXT,
ADD COLUMN     "account_number" TEXT,
ADD COLUMN     "bank_name" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" "PaymentType" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "wallet_phone" TEXT;

-- AlterTable
ALTER TABLE "shipping_rules" DROP COLUMN "createdAt",
DROP COLUMN "maxWeight",
DROP COLUMN "minWeight",
DROP COLUMN "price",
DROP COLUMN "updatedAt",
ADD COLUMN     "base_cost" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "service" "ShippingService" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "zone_json" TEXT;
