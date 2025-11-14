import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type JwtRole = "ADMIN" | "GERENTE" | "CLIENTE";
export type JwtUser = { id: number; email: string; role: JwtRole; iat?: number; exp?: number };

declare global {
  namespace Express {
    interface Request { user?: JwtUser }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

function tokenFrom(req: Request) {
  const h = req.headers.authorization || "";
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? m[1] : null;
}

/** Extrai o ID do payload do JWT aceitando sub | id | userId e normaliza para número */
function extractUser(payload: any): JwtUser | null {
  if (!payload || typeof payload !== "object") return null;

  const rawId = payload.sub ?? payload.id ?? payload.userId;
  const idNum = typeof rawId === "string" ? Number(rawId) : rawId;

  if (!Number.isFinite(idNum)) return null;

  const email = typeof payload.email === "string" ? payload.email : "";
  const role = (payload.role as JwtRole) ?? "CLIENTE";

  return { id: idNum, email, role };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const t = tokenFrom(req);
  if (!t) return res.status(401).json({ error: "unauthorized" });
  try {
    const decoded = jwt.verify(t, JWT_SECRET);
    const u = extractUser(decoded);
    if (!u) return res.status(401).json({ error: "unauthorized" });
    req.user = u;
    next();
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
}

export function tryAuth(req: Request, _res: Response, next: NextFunction) {
  const t = tokenFrom(req);
  if (t) {
    try {
      const decoded = jwt.verify(t, JWT_SECRET);
      const u = extractUser(decoded);
      if (u) req.user = u;
    } catch { /* silencioso */ }
  }
  next();
}

export function requireRole(role: "ADMIN" | "GERENTE") {
  return (req: Request, res: Response, next: NextFunction) => {
    const u = req.user;
    if (!u) return res.status(401).json({ error: "unauthorized" });
    if (u.role === "ADMIN" || u.role === role) return next();
    return res.status(403).json({ error: "forbidden" });
  };
}
