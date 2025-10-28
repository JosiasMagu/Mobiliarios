import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = Router();

// PNG 1x1 transparente
const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=",
  "base64"
);
const FALLBACK_PATH = path.resolve(__dirname, "../../public/placeholder.jpg");

function sendFallback(res: Response) {
  try {
    if (fs.existsSync(FALLBACK_PATH)) {
      res.setHeader("Content-Type", "image/jpeg");
      return res.sendFile(FALLBACK_PATH);
    }
  } catch {}
  res.setHeader("Content-Type", "image/png");
  return res.end(PNG_1x1);
}

// GET /api/img?url=<https_url>
router.get("/", async (req: Request, res: Response) => {
  const raw = String(req.query.url || "");
  if (!/^https?:\/\//i.test(raw)) return sendFallback(res);

  try {
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), 10000);

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
    clearTimeout(to);

    if (!r.ok || !r.body) return sendFallback(res);

    const ct = r.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", ct);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    const anyBody: any = r.body as any;
    if (typeof anyBody?.pipe === "function") {
      return anyBody.pipe(res);
    } else {
      const buf = Buffer.from(await r.arrayBuffer());
      return res.end(buf);
    }
  } catch {
    return sendFallback(res);
  }
});

export default router;
