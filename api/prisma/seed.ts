// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// URL determinística de imagem
const lf = (tags: string, seed: number, w = 1200, h = 800) =>
  `https://loremflickr.com/${w}/${h}/${encodeURIComponent(tags)}?lock=${seed}`;

const makeImages = (tags: string, base: number) =>
  Array.from({ length: 10 }, (_, i) => ({ url: lf(tags, base + i, 1200, 800) }));

type Cat = "sofas" | "cadeiras" | "mesas" | "armarios";
type P = {
  name: string;
  slug: string;
  price: number;
  category: Cat;
  seed: number;
  tags: string;
  stock?: number;
  active?: boolean;
};

const PRODS: P[] = [
  { name: "Sofá Nórdico 3L", slug: "sofa-nordico", price: 12000, category: "sofas", seed: 100, tags: "sofa,furniture,living room,interior,showroom" },
  { name: "Sofá Modular", slug: "sofa-modular", price: 14500, category: "sofas", seed: 110, tags: "modular sofa,furniture,living room,interior" },
  { name: "Poltrona Confort", slug: "poltrona-confort", price: 6500, category: "sofas", seed: 120, tags: "armchair,furniture,living room,interior" },

  { name: "Cadeira Ergonómica Pro", slug: "cadeira-ergonomica-pro", price: 5200, category: "cadeiras", seed: 200, tags: "office chair,ergonomic,workspace,office" },
  { name: "Cadeira Diretor", slug: "cadeira-diretor", price: 4800, category: "cadeiras", seed: 210, tags: "executive chair,office,workspace" },
  { name: "Cadeira Sala Jantar", slug: "cadeira-jantar", price: 2100, category: "cadeiras", seed: 220, tags: "dining chair,dining room,furniture,interior" },

  { name: "Mesa Executiva 180cm", slug: "mesa-executiva-180", price: 9800, category: "mesas", seed: 300, tags: "office desk,executive desk,workspace,office" },
  { name: "Mesa de Reunião 240cm", slug: "mesa-reuniao-240", price: 15200, category: "mesas", seed: 310, tags: "conference table,meeting room,office" },
  { name: "Mesa Lateral Wood", slug: "mesa-lateral-wood", price: 1900, category: "mesas", seed: 320, tags: "side table,coffee table,living room" },

  { name: "Armário 2 Portas", slug: "armario-2p", price: 7300, category: "armarios", seed: 400, tags: "wardrobe,cabinet,closet,furniture" },
  { name: "Armário Alto Escritório", slug: "armario-alto", price: 10200, category: "armarios", seed: 410, tags: "office cabinet,storage cabinet,office" },
  { name: "Armário Porta Deslizante", slug: "armario-deslizante", price: 11400, category: "armarios", seed: 420, tags: "sliding wardrobe,closet,bedroom furniture" },
];

async function main() {
  // 1) Admin idempotente
  await db.user.upsert({
    where: { email: "admin@demo.tld" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@demo.tld",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });

  // 2) Categorias idempotentes
  const sofas = await db.category.upsert({
    where: { slug: "sofas" },
    update: { name: "Sofás", position: 1 },
    create: { name: "Sofás", slug: "sofas", position: 1 },
  });
  const cadeiras = await db.category.upsert({
    where: { slug: "cadeiras" },
    update: { name: "Cadeiras", position: 2 },
    create: { name: "Cadeiras", slug: "cadeiras", position: 2 },
  });
  const mesas = await db.category.upsert({
    where: { slug: "mesas" },
    update: { name: "Mesas", position: 3 },
    create: { name: "Mesas", slug: "mesas", position: 3 },
  });
  const armarios = await db.category.upsert({
    where: { slug: "armarios" },
    update: { name: "Armários", position: 4 },
    create: { name: "Armários", slug: "armarios", position: 4 },
  });

  const catMap: Record<Cat, number> = {
    sofas: sofas.id,
    cadeiras: cadeiras.id,
    mesas: mesas.id,
    armarios: armarios.id,
  };

  // 3) Produtos com upsert. Nunca apagamos Product para não violar FKs de OrderItem.
  for (const p of PRODS) {
    const prod = await db.product.upsert({
      where: { slug: p.slug },
      create: {
        name: p.name,
        slug: p.slug,
        price: p.price,
        stock: p.stock ?? 10,
        active: p.active ?? true,
        categoryId: catMap[p.category],
      },
      update: {
        name: p.name,
        price: p.price,
        stock: p.stock ?? 10,
        active: p.active ?? true,
        categoryId: catMap[p.category],
      },
    });

    // 3.1) Substitui somente as imagens do produto
    await db.productImage.deleteMany({ where: { productId: prod.id } });
    const images = makeImages(p.tags, p.seed);
    if (images.length) {
      await db.productImage.createMany({
        data: images.map((img) => ({ productId: prod.id, url: img.url })),
        skipDuplicates: true,
      });
    }
  }

  // 4) (Opcional) Desativar produtos fora da lista, preservando histórico de pedidos
  // const keep = new Set(PRODS.map(p => p.slug));
  // await db.product.updateMany({
  //   where: { NOT: { slug: { in: Array.from(keep) } } },
  //   data: { active: false },
  // });

  console.log("Seed concluído com upserts. Seguro para reexecutar.");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
