// server.ts
import "dotenv/config";
try { require("source-map-support/register"); } catch {}

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { db } from "./lib/db";

import payments from "./routes/payments";
import shipping from "./routes/shipping";
import products from "./routes/products";
import orders from "./routes/orders";
import auth from "./routes/auth";
import admin from "./routes/admin";
import imgProxy from "./routes/img";
import categories from "./routes/categories";
import { account } from "./routes/account";
import publicContact from "./routes/public.contact";
// admin específicos
import adminProducts from "./routes/admin.products";
import adminUploads from "./routes/admin.uploads";

// NOVO: marketing admin e cupom público
import marketingAdmin from "./routes/marketing";
import couponsPublic from "./routes/coupons.public";

const app = express();

/* -------- Infra -------- */
app.set("trust proxy", 1);

const ORIGINS =
  (process.env.FRONT_ORIGINS ??
    process.env.CORS_ORIGINS ??
    process.env.CORS_ORIGIN ??
    process.env.FRONT_ORIGIN ??
    "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || ORIGINS.includes(origin)),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    exposedHeaders: ["Content-Disposition"],
  })
);
app.options("*", cors());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "blob:", "https:"],
        "style-src": ["'self'", "https:", "'unsafe-inline'"],
        "font-src": ["'self'", "https:", "data:"],
        "connect-src": ["'self'", ...ORIGINS, "https:", "ws:", "wss:"],
        "script-src-attr": ["'none'"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
        "upgrade-insecure-requests": [],
      },
    },
  })
);
app.use(morgan("combined"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use("/api/public/contact", publicContact);
/* -------- Estáticos -------- */
const PUBLIC_DIR = path.resolve(__dirname, "../public");

app.use(
  express.static(PUBLIC_DIR, {
    setHeaders(res, p) {
      if (/\.(jpe?g|png|webp|gif|avif|svg)$/i.test(p)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      }
    },
  })
);

app.use(
  "/assets",
  express.static(path.join(PUBLIC_DIR, "assets"), {
    fallthrough: true,
    setHeaders(res) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use(
  "/uploads",
  express.static(path.join(PUBLIC_DIR, "uploads"), {
    fallthrough: true,
    setHeaders(res) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

/* -------- Health/Debug -------- */
app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

app.get("/__env", (_req, res) => {
  const dev = process.env.NODE_ENV !== "production";
  res.json({
    env: dev ? "development" : "production",
    debugErrors: process.env.DEBUG_ERRORS === "1",
    api: { port: Number(process.env.PORT || 8080) },
    origins: ORIGINS,
    db: (process.env.DATABASE_URL || "").slice(0, 42) + (process.env.DATABASE_URL ? "…" : ""),
  });
});

app.get("/__dbping", async (_req, res) => {
  try {
    const ok = await db.$queryRawUnsafe("select 1 as ok");
    res.json({ ok: true, result: ok });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

/* -------- Utilidades -------- */
app.use("/api/img", imgProxy);

/* -------- Rotas públicas -------- */
app.use("/api/auth", auth);
app.use("/api/categories", categories);
app.use("/api/payments", payments);
app.use("/api/shipping", shipping);
app.use("/api/products", products);
app.use("/api/orders", orders);
app.use("/api/account", account);
app.use("/api/coupons", couponsPublic); // NOVO endpoint público de validação

/* -------- Rotas admin específicas -------- */
app.use("/api/admin/products", adminProducts);
app.use("/api/admin/uploads", adminUploads);
app.use("/api/admin/marketing", marketingAdmin); // NOVO

/* -------- Outras rotas admin -------- */
app.use("/api/admin", admin);

/* -------- 404 da API -------- */
app.use("/api", (_req, res) => res.status(404).json({ error: "not_found" }));

/* -------- Handler de erro -------- */
function parseTopFrame(stack?: string) {
  try {
    const line1 = String(stack || "").split("\n")[1] || "";
    const m = /\((.*):(\d+):(\d+)\)/.exec(line1) || /at (.*):(\d+):(\d+)/.exec(line1);
    if (!m) return null;
    return { file: m[1], line: Number(m[2]), col: Number(m[3]) };
  } catch { return null; }
}

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const dev = process.env.NODE_ENV !== "production" || process.env.DEBUG_ERRORS === "1";
  const top = parseTopFrame(err?.stack);
  const payload: any = { error: "internal_error" };
  if (dev) {
    payload.message = err?.message;
    if (top) { payload.file = top.file; payload.line = top.line; payload.col = top.col; }
    payload.stack = err?.stack;
  }
  console.error(err);
  res.status(500).json(payload);
});

/* -------- Start -------- */
const PORT = Number(process.env.PORT || 8080);
const server = app.listen(PORT, () => console.log(`API on :${PORT}`));

/* -------- Shutdown -------- */
const shutdown = (signal: NodeJS.Signals) => {
  console.log(`\n${signal} recebido. Encerrando...`);
  server.close(async () => {
    try { await db.$disconnect(); } finally { process.exit(0); }
  });
  setTimeout(async () => {
    try { await db.$disconnect(); } finally { process.exit(1); }
  }, 10_000).unref();
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("unhandledRejection", (r) => console.error("unhandledRejection:", r));
process.on("uncaughtException", (e) => { console.error("uncaughtException:", e); shutdown("SIGTERM"); });

export default app;
