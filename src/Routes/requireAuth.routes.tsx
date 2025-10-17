// src/Routes/requireAuth.routes.ts
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@state/auth.store";

export default function RequireAuth() {
  const user = useAuthStore().user;
  const loc = useLocation();
  if (!user) return <Navigate to={`/login?back=${encodeURIComponent(loc.pathname)}`} replace />;
  return <Outlet />;
}
