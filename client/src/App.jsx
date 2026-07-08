import { Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import ScrollToTop from "./components/scrolltotop";
import Layout from "./pages/Layout";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Public — no Navbar/Footer */}
        <Route path="/login" element={<Login />} />

        {/* Protected layout routes — redirect to /login if not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id/:title" element={<ProductDetails />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
