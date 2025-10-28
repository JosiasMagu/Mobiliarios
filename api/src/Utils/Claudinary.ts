// api/src/utils/cloudinary.ts
/**
 * Monta uma URL Cloudinary "fetch" com transformações.
 * @param cloud Cloud name do Cloudinary. Ex.: 'minha-loja'
 * @param originalUrl URL pública da imagem (Unsplash, Pexels, etc.)
 * @param w Largura em pixels. Default 900.
 * @param extra Transformações extras do Cloudinary. Ex.: "h_600,c_fill"
 */
export function cx(
  cloud: string,
  originalUrl: string,
  w: number = 900,
  extra?: string
): string {
  // Base de transformações obrigatórias
  const base = `f_auto,q_auto,w_${w}`;
  // Se houver extras, concatena. Ex.: "f_auto,q_auto,w_900,h_600,c_fill"
  const tf = extra ? `${base},${extra}` : base;
  // encodeURIComponent evita quebra por caracteres especiais
  const src = encodeURIComponent(originalUrl);
  return `https://res.cloudinary.com/${cloud}/image/fetch/${tf}/${src}`;
}
