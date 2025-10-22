// routes/admin.routes.ts
import type { RouteObject } from "react-router-dom";
import AdminLoginPage from "@/View/admin/Login/AdminLoginPage";
import AdminDashboardPage from "@/View/admin/Dashboard/DashboardPage";
import AdminRoute from "@/Routes/adminGuard";

export const adminRoutes: RouteObject[] = [
  { path: "/admin/login", element: <AdminLoginPage /> },
  {
    path: "/admin/*",
    element: (
      <AdminRoute>
        <AdminDashboardPage />
      </AdminRoute>
    ),
  },
];
