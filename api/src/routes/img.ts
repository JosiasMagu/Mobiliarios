import { Router, Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";

const router = Router();

// Pixel PNG 1×1 como último recurso
const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=",
  "base64"
);

// placeholder local (coloque um JPG aqui: api/public/placeholder.jpg)
const FALLBACK_PATH = path.join(process.cwd(), "public", "placeholder.jpg");

// Qualquer coisa abaixo disso é suspeita de 1×1
const MIN_BYTES = 1024;

// ---------- helpers ----------
function sendFallback(res: Response) {
  try {
    if (fs.existsSync(FALLBACK_PATH)) {
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=86400, immutable");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      return res.sendFile(FALLBACK_PATH);
    }
  } catch {}
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  return res.end(PNG_1x1);
}

function okContentType(ct?: string | null) {
  if (!ct) return "image/jpeg";
  // normaliza content-type de imagens comuns
  if (/image\/(avif|webp|jpeg|jpg|png|gif)/i.test(ct)) return ct;
  return "image/jpeg";
}

// ---------- route ----------
// GET /api/img?url=<https_url>
router.get("/", async (req: Request, res: Response) => {
  const raw = String(req.query.url || "");
  if (!/^https?:\/\//i.test(raw)) return sendFallback(res);

  // timeout simples
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const r = await fetch(raw, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.google.com/",
        Connection: "keep-alive",
      },
    });

    clearTimeout(timer);

    if (!r.ok || !r.body) return sendFallback(res);

    // Se o servidor já informou content-length e for muito pequeno, aborta para fallback
    const lenHeader = r.headers.get("content-length");
    if (lenHeader && Number(lenHeader) > 0 && Number(lenHeader) < MIN_BYTES) {
      return sendFallback(res);
    }

    const ct = okContentType(r.headers.get("content-type"));
    res.setHeader("Content-Type", ct);
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    // Para poder validar tamanho real quando não há content-length, bufferiza
    const buf = Buffer.from(await r.arrayBuffer());
    if (!buf || buf.length < MIN_BYTES) {
      return sendFallback(res);
    }
    return res.end(buf);
  } catch {
    clearTimeout(timer);
    return sendFallback(res);
  }
});

export default router;
