// router/RequireAuth.routes.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthService } from "@/Services/auth.service";

export default function RequireAuth() {
  const loc = useLocation();
  const token = AuthService.token();

  if (!token) {
    const back = encodeURIComponent(loc.pathname + loc.search + loc.hash);
    return <Navigate to={`/login?back=${back}`} replace />;
  }
  return <Outlet />;
}
