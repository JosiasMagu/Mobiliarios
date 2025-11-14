/*
  Warnings:

  - You are about to drop the `CustomerPref` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CustomerPref" DROP CONSTRAINT "CustomerPref_userId_fkey";

-- DropTable
DROP TABLE "CustomerPref";

-- CreateTable
CREATE TABLE "customer_prefs" (
    "user_id" INTEGER NOT NULL,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_prefs_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "customer_prefs" ADD CONSTRAINT "customer_prefs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
