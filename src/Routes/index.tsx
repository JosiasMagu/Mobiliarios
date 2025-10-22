import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "@view/Loja/Home/homePage";
import CategoryPage from "@view/Loja/Category/CategoryPage";
import ProductPage from "@view/Loja/Product/ProductPage";
import CartPage from "@view/Loja/Cart/CartPage";
import CheckoutPage from "@view/Loja/Checkout/CheckoutPage";
import ConfirmationPage from "@view/Loja/Checkout/ConfirmationPage";
import AccountPage from "@view/Loja/Account/AccountPage";
import OrderDetailPage from "@view/Loja/Orders/OrderDetailPage";
import WishlistPage from "@view/Loja/Wishlist/WishlistPage";
import LoginPage from "@view/Loja/Auth/LoginPage";
import AboutPage from "@view/Loja/Institucional/AboutPage";
import ContactPage from "@view/Loja/Institucional/ContactPage";
import FAQPage from "@view/Loja/Institucional/FAQPage";
import NotFound from "@view/NotFound";
import RequireAuth from "@routes/requireAuth.routes";
import { AppErrorBoundary } from "@/AppErrorBoundary";
import { adminRoutes } from "@routes/admin.routes";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/c/:slug", element: <CategoryPage /> },
  { path: "/p/:id", element: <ProductPage /> },
  { path: "/cart", element: <CartPage /> },
  { path: "/checkout", element: <CheckoutPage /> },
  { path: "/confirm/:id", element: <ConfirmationPage /> },
  { path: "/wishlist", element: <WishlistPage /> },
  { path: "/login", element: <LoginPage /> },

  {
    path: "/account",
    element: <RequireAuth />,
    children: [{ index: true, element: <AccountPage /> }],
  },
  {
    path: "/orders/:id",
    element: <RequireAuth />,
    children: [{ index: true, element: <OrderDetailPage /> }],
  },

  { path: "/sobre", element: <AboutPage /> },
  { path: "/contato", element: <ContactPage /> },
  { path: "/faq", element: <FAQPage /> },

  ...adminRoutes,
  { path: "*", element: <NotFound /> },
]);

export default function AppRouter() {
  return (
    <AppErrorBoundary>
      <RouterProvider router={router} />
    </AppErrorBoundary>
  );
}
