import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ShieldCheck,
  Heart,
  Phone,
  UserCheck,
} from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshWishlist } = useWishlist();
  const { cartItems, addToCart, setIsCartOpen } = useCart();
  const { getAuthHeaders, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/products/${id}`,
          { headers: getAuthHeaders() },
        );

        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      alert("Please login to save items to your wishlist.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/products/${id}/wishlist`,
        {},
        { headers: getAuthHeaders() },
      );

      setProduct(response.data);
      refreshWishlist();
    } catch (error) {
      console.error("Could not update wishlist:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader height={55} width={6} />
        <p className="mt-4 text-sm font-medium text-slate-400">
          Loading product...
        </p>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Product Not Found</h1>

        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition"
        >
          Return Home
        </button>
      </div>
    );
  }

  const isWishlisted = product.is_wishlisted;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <button
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-semibold mb-6 transition-colors duration-200 cursor-pointer border-none bg-transparent"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform duration-200"
        />
        <span>Back to listings</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/50 p-6 md:p-10 shadow-sm flex items-center justify-center min-h-[350px] md:min-h-[480px]">
            <img
              src={`http://127.0.0.1:8000/uploads/${product.image}`}
              alt={product.title}
              className="max-h-[320px] md:max-h-[440px] w-auto object-contain hover:scale-[1.02] transition-transform duration-300"
            />
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/50 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Description
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base whitespace-pre-line">
              {product.desc}
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/50 p-6 md:p-8 shadow-sm flex flex-col gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
                {product.type}
              </span>

              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mt-4">
                {product.title}
              </h1>
            </div>

            <span className="text-3xl font-black text-indigo-600">
              ₹{product.price.toLocaleString("en-IN")}
            </span>

            <div className="flex flex-col gap-2 border-t border-b border-slate-100 py-4 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" />
                <span>{product.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                <span>Listed {product.listed}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              {cartItems.some((item) => item.id === product.id) ? (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Go to Cart
                </button>
              ) : (
                <button
                  onClick={() => addToCart(product)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Add to Cart
                </button>
              )}

              <button
                onClick={handleWishlist}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200/80 p-3.5 rounded-2xl transition-all duration-200 active:scale-90 cursor-pointer"
              >
                <Heart
                  size={20}
                  fill={isWishlisted ? "currentColor" : "none"}
                  className={isWishlisted ? "text-rose-500" : "text-slate-600"}
                />
              </button>
            </div>

            <div className="flex gap-3 text-sm font-semibold">
              <button className="flex-1 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer bg-white">
                <Phone size={16} />
                <span>Contact</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/50 p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-slate-800 text-base">
              Seller Information
            </h3>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {product.title.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-slate-800 text-sm">
                    Verified Seller
                  </p>
                  <UserCheck size={14} className="text-emerald-500" />
                </div>

                <p className="text-slate-400 text-xs font-medium">
                  Member since Oct 2023
                </p>
              </div>
            </div>

            <button className="w-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer bg-white">
              View Profile
            </button>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 flex flex-col gap-3">
            <h3 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-600" />
              <span>Safety Tips</span>
            </h3>

            <ul className="text-xs text-indigo-950/80 space-y-2.5 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5">•</span>
                <span>Always meet the seller in public, well-lit places.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5">•</span>
                <span>
                  Thoroughly inspect the item before finalizing payment.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5">•</span>
                <span>
                  Avoid making advance deposits or wiring money online.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5">•</span>
                <span>
                  Do not share credit card details or OTP with anyone.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
