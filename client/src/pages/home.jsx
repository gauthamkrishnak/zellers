import { useState, useEffect } from "react";

import Navbar from "../components/navbar";
import Hero from "../components/hero";
import Categories from "../components/categories";
import Productcard from "../components/productcard";
import Products from "../data/products";
import Footer from "../components/footer";

function Home() {
  const [selectedcategory, setselectedcategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [wishlist, setWishlist] = useState(() => {
    const storedWishlist = localStorage.getItem("wishlist");
    return storedWishlist ? JSON.parse(storedWishlist) : [];
  });

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);
  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((item) => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const filteredProducts = Products.filter((product) => {
    // Category filter
    const matchesCategory =
      selectedcategory === "All" || product.type === selectedcategory;
    // navigate("/mobiles");
    // Search filter
    const search = searchTerm.toLowerCase();
    //match search

    const matchesSearch =
      product.title.toLowerCase().includes(search) ||
      product.type.toLowerCase().includes(search) ||
      product.location.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((Product) => (
              <Productcard
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
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
