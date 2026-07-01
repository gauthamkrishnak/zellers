import { useState } from "react";
import Products from "../data/products";
import ProductCard from "../components/productcard";
import { motion, AnimatePresence } from "framer-motion";

function Wishlist() {
  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  });

  const wishlistProducts = Products.filter((product) =>
    wishlist.includes(product.id),
  );

  const toggleWishlist = (id) => {
    let updatedWishlist;

    if (wishlist.includes(id)) {
      updatedWishlist = wishlist.filter((item) => item !== id);
    } else {
      updatedWishlist = [...wishlist, id];
    }

    setWishlist(updatedWishlist);

    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  if (wishlist.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold">Wishlist is Empty</h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {wishlistProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 35,
                mass: 1,
              }}
            >
              <ProductCard
                {...product}
                isWishlisted={true}
                toggleWishlist={toggleWishlist}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Wishlist;
