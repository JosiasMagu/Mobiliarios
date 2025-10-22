import { Router } from "express";
import { db } from "../lib/db";

const r = Router();

r.get("/methods", async (_req, res) => {
  const methods = await db.paymentMethod.findMany({ where: { active: true } });
  res.json(methods);
});

export default r;
