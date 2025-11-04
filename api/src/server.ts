import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { db } from "./lib/db";

function safeReq<T = any>(name: string): T | null { try { return require(name); } catch { return null; } }
const helmet = safeReq("helmet");
const morgan = safeReq("morgan");
const rateLimit = safeReq("express-rate-limit");

import payments from "./routes/payments";
import shipping from "./routes/shipping";
import products from "./routes/products";
import orders from "./routes/orders";
import auth from "./routes/auth";
import admin from "./routes/admin";
import imgProxy from "./routes/img";
import categories from "./routes/categories";

const app = express();
const ORIGIN = process.env.CORS_ORIGIN ?? process.env.FRONT_ORIGIN ?? "http://localhost:5173";

// Helmet com CSP ajustada para imagens e placeholders
if (helmet) {
  app.use((helmet as any)({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "blob:", "https:"],
        "style-src": ["'self'", "https:", "'unsafe-inline'"],
        "font-src": ["'self'", "https:", "data:"],
        "connect-src": ["'self'", ORIGIN, "https:"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));
}

// CORS
app.use(cors({ origin: ORIGIN, credentials: true }));

// JSON
app.use(express.json({ limit: "1mb" }));

// Logs e rate-limit
if (morgan) app.use(morgan("dev"));
if (rateLimit) app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// estáticos para placeholder e eventuais assets do backend
const PUBLIC_DIR = path.resolve(__dirname, "../public");
app.use(express.static(PUBLIC_DIR, {
  setHeaders(res, p) {
    if (p.endsWith(".jpg") || p.endsWith(".jpeg") || p.endsWith(".png") || p.endsWith(".webp") || p.endsWith(".gif") || p.endsWith(".avif")) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    }
  }
}));
// opcional: expor /assets se você decidir colocar imagens no backend (não obrigatório se o front serve)
app.use("/assets", express.static(path.join(PUBLIC_DIR, "assets"), {
  fallthrough: true,
  setHeaders(res) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  }
}));

app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

// proxy de imagem com fallback
app.use("/api/img", imgProxy);

// Rotas de API
app.use("/api/auth", auth);
app.use("/api/admin", admin);
app.use("/api/categories", categories);
app.use("/api/payments", payments);
app.use("/api/shipping", shipping);
app.use("/api/products", products);
app.use("/api/orders", orders);

// 404 de API
app.use("/api", (_req: Request, res: Response) => res.status(404).json({ error: "not_found" }));

// Handler de erro
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});

const PORT = Number(process.env.PORT || 8080);
const server = app.listen(PORT, () => console.log(`API on :${PORT}`));

// Shutdown gracioso
const shutdown = (signal: NodeJS.Signals) => {
  console.log(`\n${signal} recebido. Encerrando...`);
  server.close(async () => { try { await db.$disconnect(); } finally { process.exit(0); } });
  setTimeout(async () => { try { await db.$disconnect(); } finally { process.exit(1); } }, 10_000).unref();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("unhandledRejection", (r) => console.error("unhandledRejection:", r));
process.on("uncaughtException", (e) => { console.error("uncaughtException:", e); shutdown("SIGTERM"); });

export default app;
