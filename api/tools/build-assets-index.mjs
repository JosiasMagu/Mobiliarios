// Gera /public/assets/_index.json e _index_map.json
import { readdirSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = new URL("../public/assets", import.meta.url).pathname;

// Pastas de categorias com inicial maiúscula (iguais às suas pastas)
const CATS = ["Armarios", "Cadeiras", "Cama", "Luminarias", "Mesas", "Sofas"];
const exts = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function listFiles(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter(d => d.isFile())
      .map(d => d.name)
      .filter(n => exts.has(("." + n.split(".").pop()).toLowerCase()))
      .sort();
  } catch {
    return [];
  }
}

const index = {};
for (const c of CATS) {
  index[c] = listFiles(join(ROOT, c));
}

// _index.json: { "Armarios": ["a.webp", ...], "Cadeiras": [...] }
writeFileSync(join(ROOT, "_index.json"), JSON.stringify(index, null, 2));

// _index_map.json: mapa opcional slug-do-produto -> caminho relativo em /assets
const mapPath = join(ROOT, "_index_map.json");
try { readdirSync(ROOT); } catch {}
try { readdirSync(ROOT); } catch {}
try {
  // mantém se já existir; se não, cria vazio
  readdirSync(ROOT);
} catch {}
try {
  // só cria se não existir
  readdirSync(ROOT);
} catch {}
if (!readdirSync(ROOT).includes("_index_map.json")) {
  writeFileSync(mapPath, "{}");
}

console.log("assets index written at", join(ROOT, "_index.json"));
