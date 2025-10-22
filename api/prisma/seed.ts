import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const db = new PrismaClient();

async function main() {
  const cat = await db.category.upsert({
    where: { slug: "sofas" },
    update: {},
    create: { name: "Sofás", slug: "sofas" }
  });

  await db.user.upsert({
  where: { email: "admin@demo.tld" },
  update: {},
  create: {
    name: "Admin",
    email: "admin@demo.tld",
    password: await bcrypt.hash("admin123", 10),
    role: "ADMIN",
  },
});

  await db.product.upsert({
    where: { slug: "sofa-nordico" },
    update: {},
    create: {
      name: "Sofá Nórdico",
      slug: "sofa-nordico",
      price: 12000.00,
      stock: 10,
      categoryId: cat.id,
      images: { create: [{ url: "/imgs/sofa1.jpg" }] }
    }
  });

  for (const p of [
    { type: "emola", name: "eMola",  walletPhone: "86XXXXXXX" },
    { type: "mpesa", name: "M-Pesa", walletPhone: "84XXXXXXX" },
    { type: "bank",  name: "Transferência Bancária", bankName: "BCI", accountHolder: "Luzarte", accountNumber: "00123456789" },
  ]) {
    await db.paymentMethod.upsert({
      where: { name: p.name }, // agora 'name' é unique
      update: p,
      create: p,
    });
  }

  for (const s of [
    { service: "STANDARD", name: "Padrão",  baseCost: 200.00, zoneJson: null },
    { service: "PICKUP",   name: "Retirar",  baseCost: 0.00,   zoneJson: null },
    { service: "ZONE",     name: "Por Zona", baseCost: 0.00,   zoneJson: JSON.stringify({ Beira: { Pioneiros: 150, Macuti: 250 } }) },
  ]) {
    await db.shippingRule.upsert({
      where: { name: s.name },  // agora 'name' é unique
      update: s,
      create: s,
    });
  }
}

main()
  .then(() => db.$disconnect())
  .catch((e) => { console.error(e); return db.$disconnect(); })
  .then(() => { process.exit(0); });
