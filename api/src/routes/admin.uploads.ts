import { Router, Request, Response } from "express";
import multer from "multer";
import * as path from "path";
import * as fs from "fs/promises";
import { requireAdmin } from "../middlewares/requireAdmin";
const a = Router();
a.use(requireAdmin);
// ... restante como enviado

const r = Router();
const UPDIR = path.join(process.cwd(), "public", "uploads");

// Tipos locais mínimos
type UploadCbDest = (error: Error | null, dest: string) => void;
type UploadCbName = (error: Error | null, filename: string) => void;
type UploadedFile = { filename: string; originalname?: string };

const storage = multer.diskStorage({
  destination: async (_req: Request, _file: any, cb: UploadCbDest) => {
    try {
      await fs.mkdir(UPDIR, { recursive: true });
      cb(null, UPDIR);
    } catch (e: any) {
      cb(e, UPDIR);
    }
  },
  filename: (_req: Request, file: any, cb: UploadCbName) => {
    const ext = (path.extname(String(file?.originalname || "")) || ".bin").toLowerCase();
    const base = path
      .basename(String(file?.originalname || "file"), ext)
      .replace(/\W+/g, "-")
      .toLowerCase();
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 12 }, // 10MB
});

// Normaliza req.files: pode ser array ou {campo: File[]}
function normalizeFiles(req: Request): UploadedFile[] {
  const anyReq = req as any;
  const f = anyReq.files;
  if (!f) return [];
  if (Array.isArray(f)) return f as UploadedFile[];
  if (typeof f === "object") {
    const all: UploadedFile[] = [];
    for (const k of Object.keys(f)) {
      const v = (f as Record<string, unknown>)[k];
      if (Array.isArray(v)) all.push(...(v as UploadedFile[]));
    }
    return all;
  }
  return [];
}

r.post("/", upload.array("files", 12), (req: Request, res: Response) => {
  const files = normalizeFiles(req);
  const urls = files.map((f) => `/uploads/${f.filename}`);
  res.json(urls);
});

export default r;
