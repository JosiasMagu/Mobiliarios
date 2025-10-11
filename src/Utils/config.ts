export const USE_MOCKS =
  (import.meta.env.VITE_FEATURE_USE_MOCKS ?? "true") === "true";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
export const STORAGE_KEYS = {
  CART: "cart_v1",
  ORDERS: "orders_v1",
  USERS: "users_v1",
  AUTH: "auth_token_v1",
};
