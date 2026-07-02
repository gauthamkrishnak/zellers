import { Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import ProductDetails from "./pages/ProductDetails";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Wishlist from "./pages/Wishlist";
import ScrollToTop from "./components/scrolltotop";
import Layout from "./pages/Layout";
import Login from "./pages/Login";

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Public — no Navbar/Footer */}
        <Route path="/login" element={<Login />} />

        {/* Protected layout routes */}
        <Route element={<Layout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/product/:id/:title" element={<ProductDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
