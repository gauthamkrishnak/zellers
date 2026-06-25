import { useState, useEffect } from "react";

import Hero from "../components/hero";
import Categories from "../components/categories";
import Productcard from "../components/productcard";
import Products from "../data/products";
import { useOutletContext } from "react-router-dom";

function Home() {
  const [selectedcategory, setselectedcategory] = useState("All");
  const { searchTerm } = useOutletContext();
  // Load wishlist from localStorage when component mounts
  const [wishlist, setWishlist] = useState(() => {
    const storedWishlist = localStorage.getItem("wishlist");
    return storedWishlist ? JSON.parse(storedWishlist) : [];
  });

  // Save wishlist whenever it changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Add/Remove product from wishlist
  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((item) => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  // Filter products
  const filteredProducts = Products.filter((product) => {
    // Category filter
    const matchesCategory =
      selectedcategory === "All" || product.type === selectedcategory;

    // Search filter
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      product.title.toLowerCase().includes(search) ||
      product.type.toLowerCase().includes(search) ||
      product.location.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <Hero />

      <div className="flex flex-col lg:flex-row justify-between px-4 md:px-8 lg:px-14 py-4 gap-6">
        <div className="w-full lg:w-auto lg:pl-14">
          <Categories
            selectedcategory={selectedcategory}
            setselectedcategory={setselectedcategory}
          />
        </div>

        <div className="w-full lg:w-[75%] lg:pr-14">
          <h2 className="text-2xl md:text-3xl font-bold pb-3">
            Featured Products
          </h2>

          {/* If no products match the search/category */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <h2 className="text-2xl font-semibold text-gray-600">
                No products found
              </h2>

              <p className="text-gray-500 mt-2">
                Try searching with different keywords or change the selected
                category.
              </p>
            </div>
          ) : (
            // Otherwise show the products
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((Product) => (
                <Productcard
                  // Always provide a unique key while mapping
                  id={Product.id}
                  title={Product.title}
                  price={Product.price}
                  image={Product.image}
                  location={Product.location}
                  listed={Product.listed}
                  isWishlisted={wishlist.includes(Product.id)}
                  toggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
