import { useEffect, useState } from "react";
import { Heart, MapPin, Megaphone, ShieldCheck, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

function ProductCard(props) {
  const navigate = useNavigate();
  const { refreshWishlist } = useWishlist();
  const { getAuthHeaders, isAuthenticated } = useAuth();

  const { id, title, price, image, location, listed, condition, brand } = props;
  const currentPrice = props.current_price !== undefined ? props.current_price : price;
  const isSold = Boolean(props.is_sold || props.status === "sold");

  const [isWishlisted, setIsWishlisted] = useState(props.is_wishlisted);

  useEffect(() => {
    setIsWishlisted(props.is_wishlisted);
  }, [props.is_wishlisted]);

  const handleCardClick = () => {
    if (isSold) return;
    const formattedTitle = title.replaceAll(" ", "-").toLowerCase();
    navigate(`/product/${id}/${formattedTitle}`);
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      alert("Please login to save items to your wishlist.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/products/${id}/wishlist`,
        {},
        {
          headers: getAuthHeaders(),
        },
      );

      setIsWishlisted(response.data.is_wishlisted);
      refreshWishlist();

      if (props.onWishlistToggle) {
        props.onWishlistToggle(id, response.data.is_wishlisted);
      }
    } catch (error) {
      console.error("Could not update wishlist:", error);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={
        isSold
          ? "bg-white rounded-2xl border shadow-md border-slate-200/70 overflow-hidden transition-all duration-300 cursor-not-allowed flex flex-col h-full"
          : props.is_active_boost
            ? "group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 cursor-pointer flex flex-col h-full hover:-translate-y-1"
            : "group bg-white rounded-2xl shadow-md border border-slate-200/50 overflow-hidden hover:shadow-xl hover:shadow-slate-100 hover:border-slate-300/40 transition-all duration-300 cursor-pointer flex flex-col h-full hover:-translate-y-1"
      }
    >
      <div className="relative h-60 bg-slate-50 flex items-center justify-center p-6 overflow-hidden">
        {/* Top Badges (Price Drop, Sponsored & Brand New) */}
        <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5 items-start">
          {!isSold && props.is_price_drop && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <TrendingDown size={13} className="text-emerald-600 shrink-0" />
              <span>Price Drop</span>
            </span>
          )}
          {!isSold && props.is_active_boost && (
            <span className="bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Megaphone size={13} className="text-amber-600 shrink-0" />
              <span>Sponsored</span>
            </span>
          )}
          {!isSold && condition === "Brand New" && (
            <span className="bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-blue-600 shrink-0" />
              <span>Brand New</span>
            </span>
          )}
        </div>

        {/* Sold Out Dark Overlay & Centered Badge */}
        {isSold && (
          <div className="absolute inset-0 z-20 bg-slate-950/60 flex items-center justify-center">
            <span className="bg-slate-900 text-white font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-xl border border-slate-700">
              SOLD OUT
            </span>
          </div>
        )}

        <img
          src={`http://127.0.0.1:8000/uploads/${image}`}
          alt={title}
          className={`max-w-full max-h-full object-contain ${
            isSold
              ? "grayscale opacity-60"
              : "group-hover:scale-105 transition-transform duration-500"
          }`}
        />

        <button
          onClick={handleWishlistClick}
          className="absolute top-4 right-4 bg-white/90 p-2.5 rounded-full shadow-md backdrop-blur-xs transition-all duration-200 z-30 hover:bg-white cursor-pointer active:scale-90"
        >
          <Heart
            size={18}
            fill={isWishlisted ? "currentColor" : "none"}
            className={
              isWishlisted
                ? "text-rose-500"
                : "text-slate-600 hover:text-rose-500"
            }
          />
        </button>
      </div>

      <div className="p-5 flex flex-col flex-grow justify-between gap-4">
        <div>
          {brand && (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60 mb-1.5">
              {brand}
            </span>
          )}
          <h3
            className={`font-bold text-base leading-snug line-clamp-2 ${
              isSold
                ? "text-slate-400 line-through"
                : "text-slate-800 group-hover:text-indigo-600 transition-colors duration-200"
            }`}
          >
            {title}
          </h3>

          <div className="flex items-center gap-1.5 text-slate-400 mt-2">
            <MapPin size={15} className="text-slate-400 shrink-0" />
            <p className="text-xs font-medium text-slate-500 truncate">
              {location}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {props.is_price_drop && props.highest_price > currentPrice && (
                <span className="text-xs text-slate-400 line-through font-semibold">
                  ₹{Number(props.highest_price).toLocaleString("en-IN")}
                </span>
              )}
              <p
                className={`font-extrabold text-lg leading-tight ${
                  isSold ? "text-slate-400" : "text-indigo-600"
                }`}
              >
                ₹{Number(currentPrice).toLocaleString("en-IN")}
              </p>
            </div>

            <span className="text-slate-400 text-[11px] font-medium bg-slate-100 px-2.5 py-1 rounded-full">
              {isSold ? "Sold" : listed}
            </span>
          </div>
          {!isSold && props.is_price_drop && props.savings > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
              <span>Save ₹{Number(props.savings).toLocaleString("en-IN")}</span>
              <span>•</span>
              <span>{props.discount_percentage}% OFF</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
