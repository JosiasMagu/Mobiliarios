import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const changes = [
  { id: 1, name: 'Armário Porta Deslizante' },
  { id: 2, name: 'Armário Alto Escritório' },
  { id: 3, name: 'Armário 2 Portas ' },
];
for (const c of changes) {
  await db.product.update({ where: { id: c.id }, data: { name: c.name } });
  console.log('ok:', c);
}
await db.$disconnect();
