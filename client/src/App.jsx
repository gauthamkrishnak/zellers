import { Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import ProductDetails from "./pages/ProductDetails";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetails />} />
    </Routes>
  );
}

export default App;
