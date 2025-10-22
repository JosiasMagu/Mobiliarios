import "dotenv/config";
import express from "express";
import cors from "cors";

// dependências opcionais (se não instaladas, são ignoradas)
function safeReq(name: string) {
  try { /* eslint-disable @typescript-eslint/no-var-requires */
    return require(name);
  } catch { return null; }
}
const helmet = safeReq("helmet");
const morgan = safeReq("morgan");
const rateLimit = safeReq("express-rate-limit");

import payments from "./routes/payments";
import shipping from "./routes/shipping";
import products from "./routes/products";
import orders from "./routes/orders";
import auth from "./routes/auth";
import admin from "./routes/admin";

const app = express();
const ORIGIN = process.env.FRONT_ORIGIN ?? "http://localhost:5173";

if (helmet) app.use(helmet());
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
if (morgan) app.use(morgan("dev"));
if (rateLimit) app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", auth);
app.use("/api/admin", admin);
app.use("/api/payments", payments);
app.use("/api/shipping", shipping);
app.use("/api/products", products);
app.use("/api/orders", orders);

app.use("/api", (_req, res) => res.status(404).json({ error: "not found" }));
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => console.log(`API on :${PORT}`));
