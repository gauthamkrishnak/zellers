import { Heart, Bell, Search, Plus, LogOut, X, ShoppingCart, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState, useRef, useEffect } from "react";

function Navbar({ searchTerm, setSearchTerm }) {
  const navigate = useNavigate();
  const { wishlistCount } = useWishlist();
  const { cartItems, setIsCartOpen } = useCart();
  const { logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const profileRefDesktop = useRef(null);
  const profileRefMobile = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRefDesktop.current && !profileRefDesktop.current.contains(event.target) &&
        profileRefMobile.current && !profileRefMobile.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] z-50 transition-all duration-300">
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

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-all duration-200"
              >
                <ShoppingCart size={20} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">
                    {cartItems.length}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setIsNotificationsOpen(true)}
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-all duration-200"
              >
                <Bell size={20} />
              </button>

              <div className="relative" ref={profileRefMobile}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 hover:border-indigo-500 transition-colors duration-200 cursor-pointer focus:outline-none"
                >
                  <img src="https://ui-avatars.com/api/?name=Alex+Doe&background=random&color=fff" alt="User Profile" className="w-full h-full object-cover" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100 mb-1">
                      <p className="text-sm font-bold text-slate-800">Alex Doe</p>
                      <p className="text-xs text-slate-500 truncate">alex@example.com</p>
                    </div>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Settings size={16} />
                      <span>Account Details</span>
                    </button>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-t border-slate-50 mt-1"
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
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
              className="pl-10 pr-4 py-2.5 w-full bg-slate-100/70 hover:bg-slate-100/90 border border-slate-200/60 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400/50 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-sm shadow-inner"
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

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all duration-200 cursor-pointer group"
            >
              <ShoppingCart size={22} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">
                  {cartItems.length}
                </span>
              )}
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap shadow-md pointer-events-none">
                Cart
              </span>
            </button>

            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all duration-200 cursor-pointer group"
            >
              <Bell size={22} />
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap shadow-md pointer-events-none">
                Notifications
              </span>
            </button>

            <div className="relative" ref={profileRefDesktop}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 hover:border-indigo-500 transition-colors duration-200 cursor-pointer focus:outline-none ml-2 group"
              >
                <img src="https://ui-avatars.com/api/?name=Alex+Doe&background=random&color=fff" alt="User Profile" className="w-full h-full object-cover" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 transform origin-top-right transition-all">
                  <div className="px-5 py-4 border-b border-slate-100 mb-1 bg-slate-50/50 rounded-t-xl -mt-2">
                    <p className="text-base font-bold text-slate-800">Alex Doe</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">alex@example.com</p>
                  </div>
                  
                  <div className="py-1">
                    <button
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <Settings size={18} />
                      <span>Account Details</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut size={18} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </nav>

      {/* Notifications Sidebar */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isNotificationsOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsNotificationsOpen(false)}
      />
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-white shadow-2xl z-[70] transform transition-transform duration-300 flex flex-col ${isNotificationsOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
          <button 
            onClick={() => setIsNotificationsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            
            <div className="flex items-center gap-2 text-indigo-600">
              <Bell size={16} className="fill-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider">Special Offer</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 relative z-10">Onam Deals are coming!</h3>
            <p className="text-xs text-slate-600 relative z-10">Get ready for the biggest festive sales. Up to 50% off on electronics, clothing, and home appliances. Stay tuned!</p>
            <span className="text-[10px] text-slate-400 mt-1">Just now</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
