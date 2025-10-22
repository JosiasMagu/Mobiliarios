/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `PaymentMethod` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `ShippingRule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_name_key" ON "PaymentMethod"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingRule_name_key" ON "ShippingRule"("name");
