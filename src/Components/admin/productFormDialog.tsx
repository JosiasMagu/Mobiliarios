import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { X, ImagePlus, Loader2 } from "lucide-react";
import type { Product, ProductStatus } from "@/Model/product.model";
import { productService } from "@/Services/product.service";

type Props = {
  open: boolean;
  editing?: Product | null;
  onClose: () => void;
  onSubmitCreate: (payload: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  onSubmitUpdate: (id: number, payload: Partial<Product>) => void;
};

export const ProductFormDialog: FC<Props> = ({
  open,
  editing,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
}) => {
  if (!open) return null;
  const isEdit = !!editing;

  // Base
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? "");
  const [categoryName, setCategoryName] = useState(
    editing?.categoryName ?? editing?.categorySlug ?? ""
  );
  const [price, setPrice] = useState<number>(editing?.price ?? 0);
  const [stockQty, setStockQty] = useState<number>(
    editing?.stockQty ?? (editing?.inStock ? 10 : 0)
  );
  const [status, setStatus] = useState<ProductStatus>(
    editing?.status ?? (editing?.inStock ? "published" : "draft")
  );
  const [tagsInput, setTagsInput] = useState<string>((editing?.tags ?? []).join(", "));

  // Dimensões
  const [width, setWidth] = useState<number | undefined>(editing?.dimensions?.width);
  const [height, setHeight] = useState<number | undefined>(editing?.dimensions?.height);
  const [depth, setDepth] = useState<number | undefined>(editing?.dimensions?.depth);
  const [weight, setWeight] = useState<number | undefined>(editing?.dimensions?.weight);

  // Imagens
  const [images, setImages] = useState<string[]>(
    editing?.images?.length ? editing.images : editing?.gallery ?? []
  );
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? "");
    setDescription(editing?.description ?? "");
    setCategoryId(editing?.categoryId ?? "");
    setCategoryName(editing?.categoryName ?? editing?.categorySlug ?? "");
    setPrice(editing?.price ?? 0);
    setStockQty(editing?.stockQty ?? (editing?.inStock ? 10 : 0));
    setStatus(editing?.status ?? (editing?.inStock ? "published" : "draft"));
    setTagsInput((editing?.tags ?? []).join(", "));
    setWidth(editing?.dimensions?.width);
    setHeight(editing?.dimensions?.height);
    setDepth(editing?.dimensions?.depth);
    setWeight(editing?.dimensions?.weight);
    setImages(editing?.images?.length ? editing.images : editing?.gallery ?? []);
  }, [open, editing]);

  async function onUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await productService.uploadImages(Array.from(files));
      setImages((prev) => [...prev, ...urls]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit() {
    const payload: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
      name,
      price,
      inStock: stockQty > 0,
      image: images[0],
      images,
      gallery: images,
      description,
      categoryId,
      categoryName,
      categorySlug: categoryName ? categoryName.toLowerCase() : editing?.categorySlug,
      stockQty,
      status,
      dimensions: { width, height, depth, weight },
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      originalPrice: editing?.originalPrice,
      rating: editing?.rating,
      reviews: editing?.reviews,
      isNew: editing?.isNew,
      discount: editing?.discount,
      colors: editing?.colors,
    };

    if (isEdit && editing) onSubmitUpdate(editing.id, payload);
    else onSubmitCreate(payload);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="modal w-full max-w-3xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white/95 backdrop-blur">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Editar Produto" : "Adicionar Produto"}
          </h3>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            Fechar
          </button>
        </div>

        {/* Body rolável */}
        <div className="modal-body flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Básico */}
          <section className="space-y-3">
            <div className="text-sm font-semibold text-slate-700">Informações básicas</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="label">Nome</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="label">Largura (cm)</label>
                  <input
                    type="number"
                    className="input"
                    value={width ?? ""}
                    onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <label className="label">Altura (cm)</label>
                  <input
                    type="number"
                    className="input"
                    value={height ?? ""}
                    onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <label className="label">Profund. (cm)</label>
                  <input
                    type="number"
                    className="input"
                    value={depth ?? ""}
                    onChange={(e) => setDepth(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <label className="label">Peso (kg)</label>
                  <input
                    type="number"
                    className="input"
                    value={weight ?? ""}
                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="label">Descrição</label>
                <textarea
                  className="input min-h-[96px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Catálogo */}
          <section className="space-y-3">
            <div className="text-sm font-semibold text-slate-700">Catálogo e estoque</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="label">Categoria (ID)</label>
                <input className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} />
              </div>
              <div>
                <label className="label">Nome da Categoria</label>
                <input className="input" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)}>
                  <option value="published">Publicado</option>
                  <option value="draft">Rascunho</option>
                </select>
              </div>

              <div>
                <label className="label">Preço (MZN)</label>
                <input
                  type="number"
                  className="input"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="label">Estoque disponível</label>
                <input
                  type="number"
                  className="input"
                  value={stockQty}
                  onChange={(e) => setStockQty(parseInt(e.target.value || "0", 10))}
                />
              </div>
              <div>
                <label className="label">Tags (vírgula)</label>
                <input
                  className="input"
                  placeholder="ex: cadeira, ergonomia"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Imagens */}
          <section className="space-y-3">
            <div className="text-sm font-semibold text-slate-700">Imagens</div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label
                  htmlFor="file-input"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 cursor-pointer"
                >
                  <ImagePlus className="h-4 w-4" />
                  Adicionar imagens
                </label>
                <input
                  id="file-input"
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onUpload(e.target.files)}
                />
                {uploading && (
                  <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <Loader2 className="h-4 w-4 animate-spin" /> A enviar…
                  </span>
                )}
              </div>

              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {images.map((u, i) => (
                    <div key={i} className="group relative">
                      <img
                        src={u}
                        alt=""
                        className="h-24 w-full object-cover rounded-lg ring-1 ring-slate-200"
                      />
                      <button
                        className="absolute top-1 right-1 hidden group-hover:inline-flex rounded-md bg-white/90 px-2 py-1 text-xs shadow ring-1 ring-slate-200"
                        onClick={() => removeImage(i)}
                        type="button"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {images.length === 0 && (
                <p className="mt-2 text-xs text-slate-500">PNG, JPG ou GIF. Até 10MB por ficheiro.</p>
              )}
            </div>
          </section>
        </div>

        {/* Footer fixo */}
        <div className="sticky bottom-0 z-10 flex justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-white/95 backdrop-blur rounded-b-2xl">
          <button className="btn-secondary" onClick={onClose}>Fechar</button>
          <button className="btn-primary" onClick={handleSubmit}>
            {isEdit ? "Salvar alterações" : "Salvar produto"}
          </button>
        </div>
      </div>

      {/* estilos utilitários */}
      <style>{`
        .label{display:block;font-size:12px;color:#334155;margin-bottom:6px}
        .input{width:100%;border-radius:0.75rem;border:1px solid #eaeef3;background:white;padding:0.55rem 0.8rem;outline:none;box-shadow:0 1px 0 rgba(2,6,23,0.02)}
        .input:focus{border-color:#c7d2fe;box-shadow:0 0 0 4px rgba(59,130,246,.08)}
        .btn-primary{background:#2563eb;color:#fff;padding:.65rem 1rem;border-radius:.7rem;font-weight:600}
        .btn-primary:hover{background:#1d4ed8}
        .btn-secondary{background:white;border:1px solid #e5e7eb;padding:.6rem 1rem;border-radius:.7rem}
        .btn-secondary:hover{background:#f8fafc}
        .modal-body{scroll-behavior:smooth}
        .modal-body::-webkit-scrollbar{height:10px;width:10px}
        .modal-body::-webkit-scrollbar-track{background:transparent}
        .modal-body::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:9999px;border:3px solid transparent;background-clip:content-box}
        .modal-body:hover::-webkit-scrollbar-thumb{background:#d1d5db;border:3px solid transparent;background-clip:content-box}
      `}</style>
    </div>
  );
};
