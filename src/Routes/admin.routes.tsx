// src/Routes/admin.routes.ts
import type { RouteObject } from "react-router-dom";
import AdminLoginPage from "@view/admin/Login/AdminLoginPage";
import AdminDashboardPage from "@view/admin/Dashboard/DashboardPage";

export const adminRoutes: RouteObject[] = [
  { path: "/admin/login", element: <AdminLoginPage /> },
  { path: "/admin/*", element: <AdminDashboardPage /> },
];
