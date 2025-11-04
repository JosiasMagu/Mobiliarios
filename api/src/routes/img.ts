import { Router, Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import dns from "node:dns/promises";
import net from "node:net";

const router = Router();

// Pixel PNG 1×1 como último recurso
const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=",
  "base64"
);

// placeholder local (coloque um JPG aqui: api/public/placeholder.jpg)
const PUBLIC_DIR = path.join(process.cwd(), "public");
const FALLBACK_PATH = path.join(PUBLIC_DIR, "placeholder.jpg");

// mínimos e limites
const MIN_BYTES = 1024;            // abaixo disso, consideramos inválido
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// ---------- utils ----------
function isPrivateIp(ip: string): boolean {
  if (!net.isIP(ip)) return true; // se não reconhece, bloqueia
  // IPv4
  if (ip.startsWith("10.") || ip.startsWith("127.") || ip.startsWith("0.")
    || ip.startsWith("169.254.") || ip.startsWith("172.16.") || ip.startsWith("172.17.")
    || ip.startsWith("172.18.") || ip.startsWith("172.19.") || ip.startsWith("172.2")
    || ip.startsWith("172.30.") || ip.startsWith("172.31.") || ip.startsWith("192.168.")) return true;
  // IPv6 locais
  if (ip === "::1" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) return true;
  return false;
}

async function hostIsPublic(hostname: string): Promise<boolean> {
  try {
    const records = await dns.lookup(hostname, { all: true });
    return records.every(r => !isPrivateIp(r.address));
  } catch {
    return false;
  }
}

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
  if (/image\/(avif|webp|jpeg|jpg|png|gif)/i.test(ct)) return ct;
  return "image/jpeg";
}

// ---------- route ----------
// GET /api/img?url=<https_url>
router.get("/", async (req: Request, res: Response) => {
  const raw = String(req.query.url || "").trim();
  if (!/^https?:\/\//i.test(raw)) return sendFallback(res);

  let u: URL;
  try { u = new URL(raw); } catch { return sendFallback(res); }
  if (!["http:", "https:"].includes(u.protocol)) return sendFallback(res);

  // SSRF hardening: só resolve hosts públicos
  if (!(await hostIsPublic(u.hostname))) return sendFallback(res);

  // timeout simples
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const r = await fetch(u.toString(), {
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

    // Content-Length declarado
    const lenHeader = r.headers.get("content-length");
    if (lenHeader) {
      const n = Number(lenHeader);
      if (n > 0 && n < MIN_BYTES) return sendFallback(res);
      if (n > MAX_BYTES) return sendFallback(res);
    }

    const ct = okContentType(r.headers.get("content-type"));
    res.setHeader("Content-Type", ct);
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    // Bufferiza para validar tamanho efetivo quando não há content-length
    const ab = await r.arrayBuffer();
    const buf = Buffer.from(ab);
    if (!buf || buf.length < MIN_BYTES || buf.length > MAX_BYTES) return sendFallback(res);

    // ETag simples por tamanho+md5-like (aqui só tamanho e 1 xor rápido para ser barato)
    const tag = `"w-${buf.length}-${(buf[0] ^ buf[Math.max(0, buf.length - 1)])}"`;
    res.setHeader("ETag", tag);
    if (req.headers["if-none-match"] === tag) {
      res.statusCode = 304;
      return res.end();
    }

    return res.end(buf);
  } catch {
    clearTimeout(timer);
    return sendFallback(res);
  }
});

export default router;
