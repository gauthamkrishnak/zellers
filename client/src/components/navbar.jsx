import { Heart } from "lucide-react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
function Navbar({ searchTerm, setSearchTerm }) {
  const navigate = useNavigate();
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  return (
    <>
      <div
        className="bg-white flex flex-col lg:flex-row px-4 md:px-8 py-4 items-center gap-3.5 shadow-2xl
      
      fixed top-0 left-0 w-full bg-white shadow-md z-50"
      >
        <h1 className="font-bold text-blue-600 text-3xl md:text-5xl">
          Zellers
        </h1>

        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-2 border-blue-500 py-2 px-4 rounded-md w-full md:w-80 lg:w-96"
        />

        <button className="px-5 py-2 border bg-blue-500 text-white rounded-md cursor-pointer hover:scale-105 transition w-full md:w-auto">
          Search
        </button>

        <div className="flex flex-wrap justify-center items-center gap-4 lg:ml-auto">
          <button
            onClick={() => navigate("/wishlist")}
            className="cursor-pointer hover:scale-105 transition"
          >
            <div className="relative group cursor-pointer">
              <Heart size={22} className="fill-red-500 text-red-500" />

              {/* Wishlist Count Badge */}
              {wishlist.length > 0 && (
                <span
                  className="absolute -top-2 -right-2
                   bg-red-600 text-white text-[10px]
                   w-5 h-5 rounded-full
                   flex items-center justify-center
                   font-semibold"
                >
                  {wishlist.length}
                </span>
              )}

              {/* Tooltip */}
              <span
                className="absolute -bottom-10 left-1/2 -translate-x-1/2
                 bg-gray-900 text-white text-xs px-2 py-1 rounded
                 opacity-0 group-hover:opacity-100
                 transition duration-200 whitespace-nowrap"
              >
                Wishlist
              </span>
            </div>
          </button>
          <button className="cursor-pointer hover:scale-105 transition">
            <div className="relative group cursor-pointer">
              <Bell size={22} />

              <span
                className="absolute -bottom-10 left-1/2 -translate-x-1/2
               bg-gray-900 text-white text-xs px-2 py-1 rounded
               opacity-0 group-hover:opacity-100
               transition duration-200 whitespace-nowrap"
              >
                Notifications
              </span>
            </div>
          </button>
        </div>

        <button className="bg-white rounded-full px-6 py-2 font-bold text-blue-700 shadow-md border border-blue-700 cursor-pointer hover:scale-105 transition w-full md:w-auto">
          + SELL
        </button>
      </div>
    </>
  );
}

export default Navbar;
