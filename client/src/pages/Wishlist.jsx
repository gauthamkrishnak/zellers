import { useState } from "react";
import Products from "../data/products";
import ProductCard from "../components/productcard";

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
        {wishlistProducts.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            isWishlisted={true}
            toggleWishlist={toggleWishlist}
          />
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
