// api/src/routes/public.contact.ts
import { Router } from "express";
const r = Router();
r.post("/", async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: "bad_request" });
  // TODO: enviar email (provider) ou gravar em tabela ContactMessage
  res.status(204).end();
});
export default r;
