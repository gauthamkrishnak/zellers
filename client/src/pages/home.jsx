// import { useState, useEffect } from "react";
// import Hero from "../components/hero";
// import Categories from "../components/categories";
// import Productcard from "../components/productcard";
// import { useSelector } from "react-redux";
// import { useOutletContext } from "react-router-dom";
// import { Search } from "lucide-react";
// import axios from "axios";

// function Home() {
//   const [selectedcategory, setselectedcategory] = useState("All");
//   const { searchTerm } = useOutletContext();
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await axios.get("http://127.0.0.1:8000/products/", {
//           params: {
//             category: selectedcategory,
//             search: searchTerm,
//           },
//         });

//         setProducts(response.data);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       }
//     };

//     fetchProducts();
//   }, [selectedcategory, searchTerm]);
//   // Filter products
//   // const filteredProducts = products.filter((product) => {
//   //   // Category filter
//   //   const matchesCategory =
//   //     selectedcategory === "All" || product.type === selectedcategory;

//   //   // Search filter
//   //   const search = searchTerm.toLowerCase();

//   //   const matchesSearch =
//   //     product.title.toLowerCase().includes(search) ||
//   //     product.type.toLowerCase().includes(search) ||
//   //     product.location.toLowerCase().includes(search);

//   //   return matchesCategory && matchesSearch;
//   // });

//   return (
//     <div className="flex flex-col gap-8 pb-16">
//       {/* Hero Banner */}
//       <Hero />

//       {/* Main Section */}
//       <div
//         id="featured-products-section"
//         className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 scroll-mt-24"
//       >
//         {/* Categories Sidebar */}
//         <aside className="w-full lg:w-64 shrink-0">
//           <Categories
//             selectedcategory={selectedcategory}
//             setselectedcategory={setselectedcategory}
//           />
//         </aside>

//         {/* Products Grid */}
//         <main className="flex-1">
//           <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 mb-6">
//             <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
//               {selectedcategory === "All"
//                 ? "Featured Products"
//                 : `${selectedcategory} Listings`}
//             </h2>
//             <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
//               {filteredProducts.length}{" "}
//               {filteredProducts.length === 1 ? "item" : "items"}
//             </span>
//           </div>

//           {/* If no products match */}
//           {filteredProducts.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/50 px-6 text-center">
//               <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-5 shadow-sm">
//                 <Search size={28} />
//               </div>

//               <h3 className="text-lg font-bold text-slate-800">
//                 No listings found
//               </h3>

//               <p className="text-slate-500 text-sm max-w-sm mt-2">
//                 We couldn't find any products matching your search criteria. Try
//                 using different keywords or resetting the category.
//               </p>

//               <button
//                 onClick={() => setselectedcategory("All")}
//                 className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md active:scale-95 cursor-pointer"
//               >
//                 Reset Filter
//               </button>
//             </div>
//           ) : (
//             /* Products Grid */
//             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
//               {filteredProducts.map((product) => (
//                 <Productcard key={product.id} {...product} />
//               ))}
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

// export default Home;
// ---------------------------------NEW VERSION---------------------------------
import { useState, useEffect, useRef } from "react";
import Hero from "../components/hero";
import Categories from "../components/categories";
import Productcard from "../components/productcard";
import Loader from "../components/Loader";
import { useOutletContext } from "react-router-dom";
import { Search } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Home() {
  const [selectedcategory, setselectedcategory] = useState("All");
  const { searchTerm } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // true while user is still typing (debounce window)
  const [isSearching, setIsSearching] = useState(false);
  const isFirstRender = useRef(true);
  const { getAuthHeaders } = useAuth();

  const fetchProducts = async () => {
    const minimumLoaderTime = 800;
    const startTime = Date.now();

    setIsLoading(true);

    try {
      const response = await axios.get("http://127.0.0.1:8000/products/", {
        params: {
          category: selectedcategory,
          search: debouncedSearch,
        },
        headers: getAuthHeaders(),
      });

      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumLoaderTime - elapsedTime);

      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    }
  };

  // Debounce: mark as "searching" immediately on type, commit after 500ms
  useEffect(() => {
    if (isFirstRender.current) return; // don't treat mount as a search
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
    fetchProducts();
  }, [selectedcategory, debouncedSearch]);

  const showLoader = isLoading;

  return (
    <div className="flex flex-col gap-8 pb-16">
      <Hero />

      <div
        id="featured-products-section"
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 scroll-mt-24"
      >
        <aside className="w-full lg:w-64 shrink-0">
          <Categories
            selectedcategory={selectedcategory}
            setselectedcategory={setselectedcategory}
          />
        </aside>

        <main className="flex-1">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 mb-6">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              {selectedcategory === "All"
                ? "Featured Products"
                : `${selectedcategory} Listings`}
            </h2>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                {products.length} {products.length === 1 ? "item" : "items"}
              </span>
            </div>
          </div>

          {showLoader ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader height={50} width={6} />
              <p className="text-slate-400 text-sm mt-3 font-medium">
                {isSearching ? "Searching..." : "Loading listings..."}
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/50 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-5 shadow-sm">
                <Search size={28} />
              </div>

              <h3 className="text-lg font-bold text-slate-800">
                No listings found
              </h3>

              <p className="text-slate-500 text-sm max-w-sm mt-2">
                We couldn't find any products matching your search criteria. Try
                using different keywords or resetting the category.
              </p>

              <button
                onClick={() => setselectedcategory("All")}
                className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md active:scale-95 cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <Productcard key={product.id} {...product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Home;
