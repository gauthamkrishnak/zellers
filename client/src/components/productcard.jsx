import { useEffect, useState } from "react";
import { Heart, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

function ProductCard(props) {
  const navigate = useNavigate();
  const { refreshWishlist } = useWishlist(props);
  const { getAuthHeaders, isAuthenticated } = useAuth();

  const { id, title, price, image, location, listed } = props;

  const [isWishlisted, setIsWishlisted] = useState(props.is_wishlisted);

  useEffect(() => {
    setIsWishlisted(props.is_wishlisted);
  }, [props.is_wishlisted]);

  const handleCardClick = () => {
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
        { headers: getAuthHeaders() },
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
      className="group bg-white rounded-2xl border border-slate-200/50 overflow-hidden hover:shadow-xl hover:shadow-slate-100 hover:border-slate-300/40 transition-all duration-300 cursor-pointer flex flex-col h-full hover:-translate-y-1"
    >
      <div className="relative h-60 bg-slate-50 flex items-center justify-center p-6 overflow-hidden">
        <img
          src={`http://127.0.0.1:8000/uploads/${image}`}
          alt={title}
          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />

        <button
          onClick={handleWishlistClick}
          className="absolute top-4.5 right-4.5 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-md backdrop-blur-xs cursor-pointer active:scale-90 transition-all duration-200"
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
          <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
            {title}
          </h3>

          <div className="flex items-center gap-1.5 text-slate-400 mt-2">
            <MapPin size={15} className="text-slate-400 shrink-0" />
            <p className="text-xs font-medium text-slate-500 truncate">
              {location}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
          <p className="text-indigo-600 font-extrabold text-lg">
            ₹{price.toLocaleString("en-IN")}
          </p>

          <span className="text-slate-400 text-[11px] font-medium bg-slate-100 px-2.5 py-1 rounded-full">
            {listed}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
