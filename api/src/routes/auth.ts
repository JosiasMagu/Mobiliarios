// api/auth.ts
import { Router } from "express";
import { db } from "../lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const r = Router();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

r.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "missing" });

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "invalid" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "invalid" });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

r.get("/me", async (req, res) => {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : "";
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await db.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ error: "invalid" });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch {
    res.status(401).json({ error: "invalid" });
  }
});

export default r;
