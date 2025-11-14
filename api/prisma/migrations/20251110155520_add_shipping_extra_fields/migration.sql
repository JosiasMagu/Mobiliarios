/*
  Warnings:

  - You are about to alter the column `base_cost` on the `shipping_rules` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "payment_methods" ADD COLUMN     "fee_pct" DECIMAL(12,2),
ADD COLUMN     "fixed_fee" DECIMAL(12,2),
ADD COLUMN     "iban" TEXT,
ADD COLUMN     "instructions" TEXT;

-- AlterTable
ALTER TABLE "shipping_rules" ADD COLUMN     "cost_per_kg" DECIMAL(12,2),
ADD COLUMN     "max_days" INTEGER,
ADD COLUMN     "min_days" INTEGER,
ALTER COLUMN "base_cost" SET DATA TYPE DECIMAL(12,2);
