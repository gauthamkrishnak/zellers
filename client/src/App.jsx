import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Home from "./pages/home";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import Cart from "./pages/Cart";
import OrderSuccess from "./pages/OrderSuccess";
import PaymentGateway from "./pages/PaymentGateway";
import MyListings from "./pages/MyListings";
import EditProduct from "./pages/EditProduct";
import ScrollToTop from "./components/scrolltotop";
import Layout from "./pages/Layout";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import MyPurchases from "./pages/MyPurchases";
import PurchaseDetails from "./pages/PurchaseDetails";

function App() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = "Zellers";

    if (path === "/") {
      title = "Zellers | Premier Local Marketplace";
    } else if (path === "/login") {
      title = "Login | Zellers";
    } else if (path === "/account") {
      title = "My Account | Zellers";
    } else if (path === "/wishlist") {
      title = "Wishlist | Zellers";
    } else if (path === "/cart") {
      title = "Cart | Zellers";
    } else if (path === "/my-listings") {
      title = "My Listings | Zellers";
    } else if (path === "/my-purchases") {
      title = "My Purchases | Zellers";
    } else if (path === "/checkout/payment") {
      title = "Checkout | Zellers";
    } else if (path === "/order-success") {
      title = "Order Successful | Zellers";
    }

    document.title = title;
  }, [location]);

  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Public — no Navbar/Footer */}
        <Route path="/login" element={<Login />} />

        {/* Protected layout routes — redirect to /login if not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<Account />} />
          <Route path="/checkout/payment" element={<PaymentGateway />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/product/:id/:title" element={<ProductDetails />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/products/:id/:title" element={<ProductDetails />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/my-purchases" element={<MyPurchases />} />
            <Route
              path="/my-purchases/:orderId/:productId"
              element={<PurchaseDetails />}
            />
            <Route path="/edit-product/:id" element={<EditProduct />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-success" element={<OrderSuccess />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
