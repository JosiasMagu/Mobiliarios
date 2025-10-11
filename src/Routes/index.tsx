import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "@view/Loja/Home/homePage";
import CategoryPage from "@view/Loja/Category/CategoryPage";
import ProductPage from "@view/Loja/Product/ProductPage";
import CartPage from "@view/Loja/Cart/CartPage";
import CheckoutPage from "@view/Loja/Checkout/CheckoutPage";
import AccountPage from "@view/Loja/Account/AccountPage";

import AboutPage from "@view/Loja/Institucional/AboutPage";
import ContactPage from "@view/Loja/Institucional/ContactPage";
import FAQPage from "@view/Loja/Institucional/FAQPage";
import PoliciesPage from "@view/Loja/Institucional/PoliciesPage";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/c/:slug", element: <CategoryPage /> },
  { path: "/p/:id", element: <ProductPage /> },
  { path: "/cart", element: <CartPage /> },
  { path: "/checkout", element: <CheckoutPage /> },
  { path: "/conta", element: <AccountPage /> },

  // Institucionais
  { path: "/sobre", element: <AboutPage /> },
  { path: "/contato", element: <ContactPage /> },
  { path: "/faq", element: <FAQPage /> },
  { path: "/politicas", element: <PoliciesPage /> },

  { path: "*", element: <div style={{ padding: 24 }}>Página não encontrada</div> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
