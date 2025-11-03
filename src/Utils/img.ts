/**
 * Resolver de imagens locais em /public/assets/** com fallback.
 */
const PLACEHOLDER = "/assets/placeholder.jpg";

const CAT_MAP: Record<string, string> = {
  sofas: "Sofas",
  cadeiras: "Cadeiras",
  mesas: "Mesas",
  luminarias: "Luminarias",
  iluminacao: "Luminarias",
  cama: "Cama",
  armarios: "Armarios",
  armários: "Armarios",
};

const exts = ["webp", "jpg", "jpeg", "png"];

function slugify(s: string) {
  return String(s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function candidatesFor(folder: string, slug: string, id: number) {
  const base = `/assets/${folder}`;
  const s = slugify(slug);
  const names = [s, `${s}-1`, `${s}-2`, `${s}-3`, `${s}-4`, String(id), `${id}-1`, `${id}-2`, `${id}-3`, `${id}-4`];
  const out: string[] = [];
  for (const n of names) for (const e of exts) out.push(`${base}/${n}.${e}`);
  return out;
}

export function buildLocalImagesFor(p: { id: number; slug?: string; categorySlug?: string }) {
  const folder = CAT_MAP[(p.categorySlug ?? "").toLowerCase()];
  if (!folder) return { primary: undefined as string | undefined, images: [] as string[] };
  const cands = candidatesFor(folder, p.slug || String(p.id), p.id);
  return { primary: cands[0] ?? PLACEHOLDER, images: cands.length ? cands : [PLACEHOLDER] };
}

export function imgSimpleSet(src: string) {
  return { src, srcSet: undefined as string | undefined, sizes: undefined as string | undefined };
}

export const IMG_PLACEHOLDER = PLACEHOLDER;
