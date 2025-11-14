import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../lib/db";
import { getJwtSecret } from "../lib/jwt";

type JwtPayload = { id: number; email?: string; role?: string; iat?: number; exp?: number };

const JWT_SECRET = getJwtSecret();

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    let token = "";
    const auth = req.headers.authorization || "";
    if (/^Bearer /i.test(auth)) token = auth.replace(/^Bearer\s+/i, "").trim();
    if (!token && (req as any).cookies?.token) token = String((req as any).cookies.token);

    if (!token) return res.status(401).json({ error: "unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (!decoded?.id) return res.status(401).json({ error: "unauthorized" });

    const user = await db.user.findUnique({ where: { id: Number(decoded.id) } });
    const role = String(user?.role || "").toUpperCase();

    if (!user || !["ADMIN", "GERENTE"].includes(role)) {
      return res.status(403).json({ error: "forbidden" });
    }

    (req as any).user = { id: user.id, email: user.email, role };
    next();
  } catch (e: any) {
    const name = e?.name || "";
    if (name === "TokenExpiredError") return res.status(401).json({ error: "token_expired" });
    if (name === "JsonWebTokenError") return res.status(401).json({ error: "invalid_token" });
    return res.status(401).json({ error: "unauthorized" });
  }
}
