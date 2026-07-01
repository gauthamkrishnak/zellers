import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ProductCard from "../components/productcard";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";

function Wishlist() {
  const navigate = useNavigate();
  const wishlist = useSelector((state) => state.wishlist.items);
  const products = useSelector((state) => state.products.products);

  const wishlistProducts = products.filter((product) =>
    wishlist.includes(product.id)
  );

  if (wishlistProducts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-6 shadow-sm">
          <Heart size={32} className="fill-rose-100" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Your Wishlist is Empty</h1>
        <p className="text-slate-500 text-sm max-w-sm mt-2 mb-8 leading-relaxed">
          Looks like you haven't saved any items yet. Explore our featured products and add them to your wishlist!
        </p>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Explore Products</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="group p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all duration-200 border-none bg-transparent cursor-pointer"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
          </button>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            My Wishlist
          </h1>
        </div>
        
        <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-full">
          {wishlistProducts.length} {wishlistProducts.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Grid with Framer Motion transitions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {wishlistProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Wishlist;
