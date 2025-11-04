import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/States/auth.store";

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 grid place-items-center text-white font-bold">
        M
      </div>
      <div className="leading-tight">
        <div className="font-extrabold -mb-0.5">Mobiliário</div>
        <div className="text-[11px] text-slate-500">Casa & Escritório</div>
      </div>
    </div>
  );
}

export default function AdminHeader() {
  const auth = useAdminAuth();
  const nav = useNavigate();

  const displayName = auth.user?.name ?? "Administrador";

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur flex items-center justify-between px-5 ring-1 ring-slate-200/60">
      <Brand />
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-sm text-slate-600">{displayName}</div>
        <button
          onClick={() => {
            auth.signOut?.();
            nav("/admin/login", { replace: true });
          }}
          className="inline-flex items-center gap-2 rounded-md ring-1 ring-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-sm"
          title="Terminar sessão"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </header>
  );
}
