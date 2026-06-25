import { Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import ProductDetails from "./pages/ProductDetails";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Wishlist from "./pages/Wishlist";
import ScrollToTop from "./components/scrolltotop";
import Layout from "./pages/Layout";
function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id/:title" element={<ProductDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
