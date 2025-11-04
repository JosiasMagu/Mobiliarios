// tools/optimize-assets.mjs
import fs from "fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = "public/assets";
const MAX_W = 1600;           // largura máxima
const QUALITY = 70;           // qualidade WebP
const exts = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function* walk(dir) {
  for (const d of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(p);
    else yield p;
  }
}

async function optimizeFile(src) {
  const ext = path.extname(src).toLowerCase();
  if (!exts.has(ext)) return null;
  const dir = path.dirname(src);
  const base = path.basename(src, ext);
  const out = path.join(dir, `${base}.webp`);
  await sharp(src)
    .resize({ width: MAX_W, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out);
  return out;
}

const index = {};
for await (const f of walk(ROOT)) {
  const rel = path.relative(ROOT, f).replace(/\\/g, "/");
  const [folder, file] = rel.split("/");
  if (!file) continue;
  if (!index[folder]) index[folder] = [];
  // só indexa .webp no final
}

for await (const f of walk(ROOT)) await optimizeFile(f);

// reconstruir _index.json apenas com .webp
for await (const f of walk(ROOT)) {
  if (!f.toLowerCase().endsWith(".webp")) continue;
  const rel = path.relative(ROOT, f).replace(/\\/g, "/");
  const [folder, file] = rel.split("/");
  if (!index[folder]) index[folder] = [];
  index[folder].push(file);
}

await fs.writeFile(path.join(ROOT, "_index.json"), JSON.stringify(index, null, 2));
console.log("OK: imagens otimizadas e _index.json atualizado.");
