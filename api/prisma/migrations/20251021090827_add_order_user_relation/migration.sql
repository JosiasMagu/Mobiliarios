-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL NOT NULL,
    "shippingCost" DECIMAL NOT NULL,
    "total" DECIMAL NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "shippingMethod" TEXT NOT NULL,
    "guestName" TEXT,
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "guestName", "id", "paymentMethod", "shippingCost", "shippingMethod", "status", "subtotal", "total") SELECT "createdAt", "guestName", "id", "paymentMethod", "shippingCost", "shippingMethod", "status", "subtotal", "total" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
