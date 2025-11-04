// middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type JwtRole = "ADMIN" | "GERENTE" | "CLIENTE";
export type JwtUser = { id: number; email: string; role: JwtRole; iat?: number; exp?: number };

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

function tokenFrom(req: Request) {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const t = tokenFrom(req);
  if (!t) return res.status(401).json({ error: "unauthorized" });
  try {
    (req as any).user = jwt.verify(t, JWT_SECRET) as JwtUser;
    next();
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
}

export function tryAuth(req: Request, _res: Response, next: NextFunction) {
  const t = tokenFrom(req);
  if (t) {
    try {
      (req as any).user = jwt.verify(t, JWT_SECRET) as JwtUser;
    } catch {
      // token inválido é ignorado em rotas públicas
    }
  }
  next();
}

export function requireRole(role: "ADMIN" | "GERENTE") {
  return (req: Request, res: Response, next: NextFunction) => {
    const u = (req as any).user as JwtUser | undefined;
    if (!u) return res.status(401).json({ error: "unauthorized" });
    if (u.role === "ADMIN" || u.role === role) return next();
    return res.status(403).json({ error: "forbidden" });
  };
}
