import { Heart, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProductCard(props) {
  const navigate = useNavigate();

  const {
    id,
    title,
    price,
    image,
    location,
    listed,
    isWishlisted,
    toggleWishlist,
  } = props;

  return (
    <div
      //url cannot have spaces
      onClick={() => navigate(`/product/${id}/${title.replaceAll(" ", "-")}`)}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer hover:scale-105"
    >
      <div className="relative h-56 md:h-56 bg-white flex items-center justify-center">
        <img
          src={image}
          alt={title}
          className="max-w-full max-h-full object-cover"
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(id);
          }}
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md cursor-pointer hover:scale-105"
        >
          <Heart
            size={20}
            fill={isWishlisted ? "red" : "none"}
            className={isWishlisted ? "text-red-500" : "text-gray-600"}
          />
        </button>
      </div>

      <div className="p-4 flex justify-between">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>

          <div className="flex items-center gap-1 text-gray-500 mt-1">
            <MapPin size={17} />
            <p>{location}</p>
          </div>
        </div>

        <p className="text-blue-600 font-bold text-l">₹{price}</p>
      </div>

      <div className="pb-4 px-4">
        <p className="text-gray-500 text-sm">{listed}</p>
      </div>
    </div>
  );
}

export default ProductCard;
