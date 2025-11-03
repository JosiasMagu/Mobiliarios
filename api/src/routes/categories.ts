import { Router } from "express";
import { db } from "../lib/db";

const r = Router();

// públicas
r.get("/", async (_req, res) => {
  const items = await db.category.findMany({
    orderBy: [{ position: "asc" }, { id: "asc" }],
  });
  res.json(items);
});

// admin - criar
r.post("/admin", async (req, res) => {
  const { name, slug, position } = req.body ?? {};
  const item = await db.category.create({
    data: {
      name,
      slug,
      position: typeof position === "number" ? position : 0,
    },
  });
  res.json(item);
});

// admin - atualizar
r.patch("/admin/:id(\\d+)", async (req, res) => {
  const id = Number(req.params.id);
  const { name, slug, position } = req.body ?? {};
  const item = await db.category.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(position !== undefined ? { position: Number(position) } : {}),
    },
  });
  res.json(item);
});

// admin - apagar
r.delete("/admin/:id(\\d+)", async (req, res) => {
  const id = Number(req.params.id);
  await db.category.delete({ where: { id } });
  res.status(204).end();
});

// admin - reordenar
r.put("/admin/reorder", async (req, res) => {
  const ids: number[] = Array.isArray(req.body?.ids) ? req.body.ids : [];
  for (let i = 0; i < ids.length; i++) {
    await db.category.update({ where: { id: ids[i] }, data: { position: i } });
  }
  res.status(204).end();
});

export default r;
