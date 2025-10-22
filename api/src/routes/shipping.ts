import { Router } from "express";
import { db } from "../lib/db";

const r = Router();

r.get("/rules", async (_req, res) => {
  const rules = await db.shippingRule.findMany();
  res.json(rules);
});

export default r;
