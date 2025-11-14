import type { FC } from "react";
import type { Category } from "@model/category.model";
import { useEffect, useMemo, useRef, useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";

type Id = string | number;

type SubmitPayload =
  Omit<Category, "createdAt" | "updatedAt" | "slug"> & {
    id?: Id;
    slug?: string;
  };

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SubmitPayload) => void;
  parents: Category[];
  value?: Category | null;
};

const CategoryFormDialog: FC<Props> = ({ open, onClose, onSubmit, parents, value }) => {
  const [name, setName] = useState<string>(value?.name || "");
  const [parentId, setParentId] = useState<string | null>(
    value?.parentId != null ? String(value.parentId as any) : null
  );
  const [icon, setIcon] = useState<string | undefined>(value?.icon as any);
  const [image, setImage] = useState<string | undefined>(value?.image as any);
  const [position, setPosition] = useState<number>(Number((value as any)?.position ?? 1));
  const [isActive, setIsActive] = useState<boolean>((value as any)?.isActive ?? true);
  const inputFile = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName(value?.name || "");
    setParentId(value?.parentId != null ? String(value.parentId as any) : null);
    setIcon(value?.icon as any);
    setImage(value?.image as any);
    setPosition(Number((value as any)?.position ?? 1));
    setIsActive((value as any)?.isActive ?? true);
  }, [open, value]);

  const title = value ? "Editar Categoria" : "Adicionar Categoria";
  const valid = name.trim().length > 2;
  const slugPreview = useMemo(() => slugify(name), [name]);

  const selectableParents = useMemo(
    () => parents.filter(p => !value || String(p.id) !== String(value.id)),
    [parents, value]
  );

  function handlePickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(f);
  }

  function submit() {
    if (!valid) return;
    const payload: SubmitPayload = {
      id: value?.id as Id | undefined,
      name: name.trim(),
      parentId: (parentId as unknown) as any,
      icon,
      image,
      position: Number(position) || 1,
      isActive: Boolean(isActive),
      slug: slugPreview,
    } as any;
    onSubmit(payload);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-3">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-lg ring-1 ring-slate-200/60">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/60">
          <div className="font-bold">{title}</div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-slate-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 grid gap-4">
          <div>
            <label className="text-sm text-slate-600">Nome</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-slate-400"
              placeholder="ex: Escritório"
            />
            <div className="mt-1 text-[11px] text-slate-500">Slug pré-visualizado: <span className="font-mono">{slugPreview || "—"}</span></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-slate-600">Categoria Pai</label>
              <select
                value={parentId ?? ""}
                onChange={e => setParentId(e.target.value ? String(e.target.value) : null)}
                className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none bg-white"
              >
                <option value="">Nenhuma</option>
                {selectableParents.map(p => (
                  <option key={String(p.id)} value={String(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-600">Símbolo opcional</label>
              <input
                value={icon ?? ""}
                onChange={e => setIcon(e.target.value || undefined)}
                className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none"
                placeholder="Digite um emoji ou símbolo, ex: 🪑"
                maxLength={4}
              />
              <div className="mt-1 text-[11px] text-slate-500">Mostrado na loja ao lado do nome, se preenchido.</div>
            </div>

            <div>
              <label className="text-sm text-slate-600">Ordenação</label>
              <input
                type="number"
                value={position}
                onChange={e => setPosition(Number(e.target.value))}
                className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none"
                min={1}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-600">Imagem</label>
            <div className="mt-1 flex items-center gap-3">
              <div className="h-16 w-16 rounded-lg ring-1 ring-slate-200 bg-slate-50 grid place-items-center overflow-hidden">
                {image ? (
                  <img src={image} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => inputFile.current?.click()}
                  className="rounded-md ring-1 ring-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-sm"
                >
                  Escolher Imagem
                </button>
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage(undefined)}
                    className="rounded-md ring-1 ring-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 text-sm"
                  >
                    Remover
                  </button>
                )}
                <input
                  ref={inputFile}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePickImage}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600">Ativa</label>
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
          </div>
        </div>

        <div className="px-5 py-4 flex justify-end gap-2 border-t border-slate-200/60">
          <button
            onClick={onClose}
            className="rounded-md ring-1 ring-slate-200 px-3 py-2 text-sm bg-white hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            disabled={!valid}
            onClick={submit}
            className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm disabled:opacity-60"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryFormDialog;

// util local para pré-visualização, mantendo igual ao repo:
function slugify(s: string): string {
  return (s || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
