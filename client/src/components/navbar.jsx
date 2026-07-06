import { Heart, Bell, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";

function Navbar({ searchTerm, setSearchTerm }) {
  const navigate = useNavigate();
  const { wishlistCount } = useWishlist();

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/60 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4 md:h-20 md:py-0">
          <div className="flex items-center justify-between w-full md:w-auto">
            <h1
              onClick={() => navigate("/")}
              className="font-extrabold text-3xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent cursor-pointer select-none hover:opacity-90 active:scale-95 transition-all duration-150"
            >
              Zellers
            </h1>

            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => navigate("/wishlist")}
                className="relative p-2 text-slate-600 hover:text-rose-500 hover:bg-slate-100 rounded-full transition-all duration-200"
              >
                <Heart size={20} className={"fill-rose-500 text-rose-500"} />

                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-all duration-200">
                <Bell size={20} />
              </button>

              <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-md flex items-center justify-center transition-all duration-200 active:scale-95">
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="relative w-full md:max-w-md lg:max-w-lg flex items-center group">
            <Search
              className="absolute left-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200"
              size={18}
            />

            <input
              type="text"
              placeholder="Search local listings, electronics, furniture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full bg-slate-100/80 border border-transparent rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-sm shadow-inner"
            />
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate("/wishlist")}
              className="relative p-2.5 text-slate-600 hover:text-rose-500 hover:bg-slate-50 rounded-xl transition-all duration-200 cursor-pointer group"
            >
              <Heart
                size={22}
                className={
                  wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""
                }
              />

              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">
                  {wishlistCount}
                </span>
              )}

              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap shadow-md pointer-events-none fill-red-400">
                Wishlist
              </span>
            </button>

            <button className="relative p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all duration-200 cursor-pointer group">
              <Bell size={22} />
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap shadow-md pointer-events-none">
                Notifications
              </span>
            </button>

            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer">
              <Plus size={18} />
              <span>SELL ITEM</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
