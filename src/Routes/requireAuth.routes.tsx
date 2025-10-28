// router/RequireAuth.routes.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/States/auth.store";

export default function RequireAuth() {
  const { user, token } = useAuthStore();
  const loc = useLocation();

  if (!user || !token) {
    const back = encodeURIComponent(loc.pathname + loc.search + loc.hash);
    return <Navigate to={`/login?back=${back}`} replace />;
  }
  return <Outlet />;
}
