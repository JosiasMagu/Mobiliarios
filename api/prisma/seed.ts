import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const db = new PrismaClient();

const lf = (tags: string, seed: number, w = 1200, h = 800) =>
  `https://loremflickr.com/${w}/${h}/${encodeURIComponent(tags)}?lock=${seed}`;

const makeImages = (tags: string, base: number) =>
  Array.from({ length: 10 }, (_, i) => ({ url: lf(tags, base + i, 1200, 800) }));

type Cat = 'sofas' | 'cadeiras' | 'mesas' | 'armarios';
type P = { name: string; slug: string; price: number; category: Cat; seed: number; tags: string; stock?: number; active?: boolean };

const PRODS: P[] = [
  { name:'Sofá Nórdico 3L', slug:'sofa-nordico', price:12000, category:'sofas', seed:100, tags:'sofa,furniture,living room,interior,showroom' },
  { name:'Sofá Modular', slug:'sofa-modular', price:14500, category:'sofas', seed:110, tags:'modular sofa,furniture,living room,interior' },
  { name:'Poltrona Confort', slug:'poltrona-confort', price:6500, category:'sofas', seed:120, tags:'armchair,furniture,living room,interior' },

  { name:'Cadeira Ergonómica Pro', slug:'cadeira-ergonomica-pro', price:5200, category:'cadeiras', seed:200, tags:'office chair,ergonomic,workspace,office' },
  { name:'Cadeira Diretor', slug:'cadeira-diretor', price:4800, category:'cadeiras', seed:210, tags:'executive chair,office,workspace' },
  { name:'Cadeira Sala Jantar', slug:'cadeira-jantar', price:2100, category:'cadeiras', seed:220, tags:'dining chair,dining room,furniture,interior' },

  { name:'Mesa Executiva 180cm', slug:'mesa-executiva-180', price:9800, category:'mesas', seed:300, tags:'office desk,executive desk,workspace,office' },
  { name:'Mesa de Reunião 240cm', slug:'mesa-reuniao-240', price:15200, category:'mesas', seed:310, tags:'conference table,meeting room,office' },
  { name:'Mesa Lateral Wood', slug:'mesa-lateral-wood', price:1900, category:'mesas', seed:320, tags:'side table,coffee table,living room' },

  { name:'Armário 2 Portas', slug:'armario-2p', price:7300, category:'armarios', seed:400, tags:'wardrobe,cabinet,closet,furniture' },
  { name:'Armário Alto Escritório', slug:'armario-alto', price:10200, category:'armarios', seed:410, tags:'office cabinet,storage cabinet,office' },
  { name:'Armário Porta Deslizante', slug:'armario-deslizante', price:11400, category:'armarios', seed:420, tags:'sliding wardrobe,closet,bedroom furniture' },
];

async function main() {
  await db.user.upsert({
    where: { email: 'admin@demo.tld' },
    update: {},
    create: { name: 'Admin', email: 'admin@demo.tld', password: await bcrypt.hash('admin123', 10), role: 'ADMIN' },
  });

  const cats = {
    sofas:    await db.category.upsert({ where: { slug: 'sofas' },    update: {}, create: { name: 'Sofás',    slug: 'sofas' } }),
    cadeiras: await db.category.upsert({ where: { slug: 'cadeiras' }, update: {}, create: { name: 'Cadeiras', slug: 'cadeiras' } }),
    mesas:    await db.category.upsert({ where: { slug: 'mesas' },    update: {}, create: { name: 'Mesas',    slug: 'mesas' } }),
    armarios: await db.category.upsert({ where: { slug: 'armarios' }, update: {}, create: { name: 'Armários', slug: 'armarios' } }),
  };

  for (const p of PRODS) {
    const images = makeImages(p.tags, p.seed);
    await db.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name, price: p.price, stock: p.stock ?? 10, active: p.active ?? true,
        categoryId: cats[p.category].id,
        images: { deleteMany: {}, create: images },
      },
      create: {
        name: p.name, slug: p.slug, price: p.price, stock: p.stock ?? 10, active: p.active ?? true,
        categoryId: cats[p.category].id,
        images: { create: images },
      },
    });
  }
}

main().finally(() => db.$disconnect());
