import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { requireAuth } from "../middlewares/auth";

const r = Router();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

function signToken(u: { id: number; email: string; role: string }) {
  // mantém sub, email e role como já usado no projeto
  return jwt.sign({ sub: u.id, email: u.email, role: u.role }, JWT_SECRET, { expiresIn: "7d" });
}

/** POST /api/auth/register */
r.post("/register", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: "missing" });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "email_in_use" });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "CLIENTE" },
    select: { id: true, name: true, email: true, role: true },
  });

  const token = signToken(user);
  return res.json({ token, user });
});

/** POST /api/auth/login */
r.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "missing" });

  const u = await prisma.user.findUnique({ where: { email } });
  if (!u) return res.status(401).json({ error: "invalid" });

  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid" });

  const user = { id: u.id, name: u.name, email: u.email, role: u.role };
  const token = signToken(user);
  return res.json({ token, user });
});

/** GET /api/auth/me */
r.get("/me", requireAuth, async (req, res) => {
  const me = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!me) return res.status(404).json({ error: "not_found" });
  return res.json(me);
});

export default r;
