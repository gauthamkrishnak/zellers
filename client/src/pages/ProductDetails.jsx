import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ShieldCheck,
  Heart,
  Phone,
  UserCheck,
  Tag,
  Megaphone,
  CreditCard,
  ShoppingBag,
  AlertCircle,
  TrendingDown,
} from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import SellerInfo from "../components/SellerInfo";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      alert("Please login to purchase items.");
      navigate("/login");
      return;
    }
    const isSoldOut = Boolean(product?.is_sold || product?.status === "sold");
    if (!product || isSoldOut) {
      return;
    }
    navigate(`/checkout/payment?mode=buynow&product_id=${product.id}`, {
      state: { buyNowProduct: product, buyNowMode: true },
    });
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

  const isSold = Boolean(product?.is_sold || product?.status === "sold");
  const isBrandNew = product.condition === "Brand New";

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

      {location.state?.buyNowError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 animate-fade-in shadow-sm">
          <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold text-sm">Buy Now Notice</p>
            <p className="text-xs mt-0.5">{location.state.buyNowError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div
            className={`relative rounded-3xl p-6 md:p-10 shadow-sm flex items-center justify-center min-h-[350px] md:min-h-[480px] overflow-hidden transition-all duration-300 ${
              product.is_active_boost
                ? "bg-white border-2 border-amber-300"
                : "bg-white border border-slate-200/50"
            }`}
          >
            {/* Top-Left Badges (Sponsored & Brand New) */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start">
              {!isSold && product.is_active_boost && (
                <span className="bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <Megaphone size={13} className="text-amber-600 shrink-0" />
                  <span>Sponsored</span>
                </span>
              )}
              {!isSold && isBrandNew && (
                <span className="bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-blue-600 shrink-0" />
                  <span>Brand New</span>
                </span>
              )}
            </div>
            {isSold && (
              <div className="absolute inset-0 z-20 bg-slate-950/50 flex items-center justify-center">
                <span className="bg-rose-600 text-white font-black text-sm uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-xl border border-rose-400/40">
                  SOLD OUT
                </span>
              </div>
            )}
            <img
              src={`http://127.0.0.1:8000/uploads/${product.image}`}
              alt={product.title}
              className={`max-h-[320px] md:max-h-[440px] w-auto object-contain ${
                isSold
                  ? "grayscale opacity-60"
                  : "hover:scale-[1.02] transition-transform duration-300"
              }`}
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                  {product.type}
                </span>
                {product.brand && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                    {product.brand}
                  </span>
                )}
                {product.is_active_boost && (
                  <span className="bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <Megaphone size={13} className="text-amber-600 shrink-0" />
                    <span>Sponsored Listing</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mt-4">
                {product.title}
              </h1>

              {product.is_active_boost && (
                <div className="mt-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
                  <Megaphone size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-xs font-bold text-amber-950">
                      Sponsored Listing
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Promoted by the seller
                    </p>
                  </div>
                </div>
              )}
            </div>

            {!isSold && product.is_price_drop ? (
              <div className="flex flex-col gap-2.5 my-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <TrendingDown size={14} className="text-emerald-600 shrink-0" />
                    <span>Price Drop</span>
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-indigo-600">
                    ₹{Number(product.current_price !== undefined ? product.current_price : product.price).toLocaleString("en-IN")}
                  </span>
                  <span className="text-lg font-semibold text-slate-400 line-through">
                    ₹{Number(product.highest_price).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-700">
                  <span>You Save ₹{Number(product.savings).toLocaleString("en-IN")}</span>
                  <span>•</span>
                  <span>{product.discount_percentage}% OFF</span>
                </div>
              </div>
            ) : (
              <span className="text-3xl font-black text-indigo-600">
                ₹{Number(product.current_price !== undefined ? product.current_price : product.price).toLocaleString("en-IN")}
              </span>
            )}

            <div className="flex flex-col gap-2 border-t border-b border-slate-100 py-4 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" />
                <span>{product.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                <span>Listed on {product.listed ? product.listed.replace(/^on\s+/i, "") : ""}</span>
              </div>
              {product.brand && (
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-slate-400" />
                  <span>Brand: <strong className="text-slate-700">{product.brand}</strong></span>
                </div>
              )}
            </div>

            {isSold && (
              <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 text-rose-800 text-sm font-semibold flex items-center gap-2">
                <span>This item has already been purchased.</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2">
              {isSold ? (
                <button
                  disabled
                  className="flex-1 bg-slate-200 text-slate-500 font-bold py-3.5 px-6 rounded-2xl cursor-not-allowed border border-slate-300 text-center text-sm"
                >
                  Sold Out
                </button>
              ) : cartItems.some((item) => item.id === product.id) ? (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <ShoppingBag size={18} />
                  <span>Go to Cart</span>
                </button>
              ) : (
                <button
                  onClick={() => addToCart(product)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <ShoppingBag size={18} />
                  <span>Add to Cart</span>
                </button>
              )}

              {isSold ? (
                <button
                  disabled
                  className="flex-1 bg-slate-200 text-slate-500 font-bold py-3.5 px-6 rounded-2xl cursor-not-allowed border border-slate-300 text-center text-sm"
                >
                  Sold Out
                </button>
              ) : (
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <CreditCard size={18} />
                  <span>Buy Now</span>
                </button>
              )}

              <button
                onClick={handleWishlist}
                className="border border-slate-200/80 p-3.5 rounded-2xl transition-all duration-200 bg-slate-50 hover:bg-slate-100 active:scale-90 cursor-pointer flex items-center justify-center shrink-0"
                title="Save to Wishlist"
              >
                <Heart
                  size={20}
                  fill={isWishlisted ? "currentColor" : "none"}
                  className={isWishlisted ? "text-rose-500" : "text-slate-600"}
                />
              </button>
            </div>
          </div>

          <SellerInfo product={product} />

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
