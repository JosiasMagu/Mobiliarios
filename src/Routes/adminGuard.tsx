// router/adminGuard.tsx
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/States/auth.store";

type Props = { children: ReactNode };

export default function AdminRoute({ children }: Props) {
  const { isAdmin } = useAdminAuth();
  const loc = useLocation();

  const atAdminLogin = /^\/admin\/login(?:\/)?$/i.test(loc.pathname);

  if (!isAdmin()) {
    if (atAdminLogin) return <>{children}</>;
    const back = encodeURIComponent(loc.pathname + loc.search + loc.hash);
    return <Navigate to={`/admin/login?back=${back}`} replace />;
  }
  return <>{children}</>;
}
