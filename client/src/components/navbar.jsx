import {
  Heart,
  Bell,
  Search,
  Plus,
  LogOut,
  X,
  ShoppingCart,
  Settings,
  Package,
  ShoppingBag,
  Sparkles,
  Zap,
  Tag,
  Gift,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SellItemModal from "./SellItemModal";

const initialNotificationsData = [
  {
    id: 1,
    title: "Onam Deals are coming!",
    category: "Special Offer",
    desc: "Get ready for the biggest festive sales. Up to 50% off on electronics, clothing, and home appliances. Stay tuned!",
    time: "Just now",
    badge: "Up to 50% OFF",
    theme: "indigo",
    icon: Sparkles,
    unread: true,
  },
  {
    id: 2,
    title: "Midnight Tech & Gaming Drop! ⚡",
    category: "Flash Deal",
    desc: "Exclusive 30% price slash on top-rated gaming laptops, PS5 consoles, and wireless peripherals starting this Friday at midnight.",
    time: "2 hours ago",
    badge: "30% OFF",
    theme: "rose",
    icon: Zap,
    unread: true,
  },
  {
    id: 3,
    title: "Mega Mobile & Gadget Fest 📱",
    category: "Upcoming Sale",
    desc: "Early bird access unlocks tomorrow! Grab extra ₹3,000 exchange bonus on iPhones, Samsung S-series, and OnePlus smartphones.",
    time: "5 hours ago",
    badge: "₹3,000 Bonus",
    theme: "amber",
    icon: Flame,
    unread: true,
  },
  {
    id: 4,
    title: "Refresh Your Living Space 🛋️",
    category: "Season Offer",
    desc: "Flat 40% off on ergonomic office chairs, wooden dining tables, and luxury sofa sets. Free doorstep delivery on orders above ₹10,000!",
    time: "1 day ago",
    badge: "Flat 40% OFF",
    theme: "emerald",
    icon: Tag,
    unread: true,
  },
  {
    id: 5,
    title: "Zero Commission Weekend! 🎁",
    category: "Seller Reward",
    desc: "List any item this weekend and keep 100% of your earnings. No marketplace fees across all categories!",
    time: "2 days ago",
    badge: "0% Fee",
    theme: "violet",
    icon: Gift,
    unread: false,
  },
  {
    id: 6,
    title: "Your ₹500 Voucher is Waiting! 🎟️",
    category: "Personal Offer",
    desc: "Use code ZELLERS500 on your next purchase over ₹2,500 to get an instant ₹500 flat discount at checkout.",
    time: "3 days ago",
    badge: "ZELLERS500",
    theme: "cyan",
    icon: Tag,
    unread: false,
  },
];

function Navbar({ searchTerm, setSearchTerm }) {
  const navigate = useNavigate();
  const { wishlistCount } = useWishlist();
  const { cartItems, setIsCartOpen } = useCart();
  const { logout, isAuthenticated, user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotificationsData);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const displayName = user?.username || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";
  const initials = displayName.slice(0, 2).toUpperCase();

  const renderProfileDropdown = () => (
    <div className="absolute right-0 mt-2.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 transform origin-top-right transition-all">
      <div className="px-5 py-3.5 border-b border-slate-100 mb-1 bg-slate-50/50 rounded-t-xl -mt-2">
        <p className="text-sm md:text-base font-bold text-slate-800 truncate">
          {displayName}
        </p>
        <p className="text-xs text-slate-500 truncate mt-0.5">{displayEmail}</p>
      </div>

      <div className="py-1">
        <button
          onClick={() => {
            setIsProfileOpen(false);
            navigate("/account");
          }}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <Settings size={17} />
          <span>Account Details</span>
        </button>

        <button
          onClick={() => {
            setIsProfileOpen(false);
            navigate("/my-listings");
          }}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <Package size={17} />
          <span>My Listings</span>
        </button>

        <button
          onClick={() => {
            setIsProfileOpen(false);
            navigate("/my-purchases");
          }}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ShoppingBag size={17} />
          <span>My Purchases</span>
        </button>

        <button
          onClick={() => {
            setIsProfileOpen(false);
            navigate("/wishlist");
          }}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <Heart size={17} />
          <span>Wishlist</span>
        </button>
      </div>

      <div className="border-t border-slate-100 mt-1 pt-1">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut size={17} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  const profileRefDesktop = useRef(null);
  const profileRefMobile = useRef(null);
  const searchInputRef = useRef(null);

  const handleClearSearch = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && searchTerm) {
      e.preventDefault();
      handleClearSearch();
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRefDesktop.current &&
        !profileRefDesktop.current.contains(event.target) &&
        profileRefMobile.current &&
        !profileRefMobile.current.contains(event.target)
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
                  onClick={() => {
                    if (!isAuthenticated) {
                      alert("Please log in to sell items.");
                      navigate("/login");
                    } else {
                      setIsSellModalOpen(true);
                    }
                  }}
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Plus size={13} /> Sell
                </button>

                <button
                  onClick={() => navigate("/wishlist")}
                  className="relative p-2 text-slate-600 hover:text-rose-500 hover:bg-slate-100 rounded-full transition-all duration-200"
                >
                  <Heart
                    size={20}
                    className={"fill-rose-500 text-rose-500 cursor-pointer"}
                  />

                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-all duration-200 cursor-pointer"
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
                  className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-all duration-200 cursor-pointer"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <div className="relative" ref={profileRefMobile}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 hover:border-indigo-500 transition-colors duration-200 cursor-pointer focus:outline-none"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
                      {initials}
                    </div>
                  </button>

                  {isProfileOpen && renderProfileDropdown()}
                </div>
              </div>
            </div>

            <div className="relative w-full md:max-w-md lg:max-w-lg flex items-center group">
              <Search
                className="absolute left-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200 pointer-events-none z-10"
                size={18}
              />

              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search local listings, electronics, furniture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`pl-10 ${
                  searchTerm ? "pr-10" : "pr-4"
                } py-2.5 w-full bg-slate-100/70 hover:bg-slate-100/90 border border-slate-200/60 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-400/50 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-sm shadow-inner`}
              />

              <AnimatePresence>
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    type="button"
                    onClick={handleClearSearch}
                    title="Clear search"
                    aria-label="Clear search"
                    className="absolute right-2.5 w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-full transition-colors duration-200 cursor-pointer z-10 active:scale-90"
                  >
                    <X size={15} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    alert("Please log in to sell items.");
                    navigate("/login");
                  } else {
                    setIsSellModalOpen(true);
                  }
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <Plus size={18} /> Sell
              </button>

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
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md ">
                    {cartItems.length}
                  </span>
                )}
                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap shadow-md pointer-events-none ">
                  Cart
                </span>
              </button>

              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="relative p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all duration-200 cursor-pointer group"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">
                    {unreadCount}
                  </span>
                )}
                <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap shadow-md pointer-events-none">
                  Notifications
                </span>
              </button>

              <div className="relative" ref={profileRefDesktop}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 hover:border-indigo-500 transition-colors duration-200 cursor-pointer focus:outline-none ml-2"
                >
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                    {initials}
                  </div>
                </button>

                {isProfileOpen && renderProfileDropdown()}
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
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-[70] transform transition-transform duration-300 flex flex-col ${isNotificationsOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-rose-100 text-rose-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {unreadCount} New
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                title="Mark all as read"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>Mark read</span>
              </button>
            )}
            <button
              onClick={() => setIsNotificationsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-transparent">
          {notifications.map((notif) => {
            const IconComponent = notif.icon;
            const themeStyles = {
              indigo: {
                bg: notif.unread
                  ? "bg-indigo-50/90 border-indigo-200"
                  : "bg-white border-slate-100",
                iconBg: "bg-indigo-100 text-indigo-600",
                badgeBg: "bg-indigo-600 text-white",
                categoryText: "text-indigo-600",
                glow: "bg-indigo-500/10",
              },
              rose: {
                bg: notif.unread
                  ? "bg-rose-50/90 border-rose-200"
                  : "bg-white border-slate-100",
                iconBg: "bg-rose-100 text-rose-600",
                badgeBg: "bg-rose-600 text-white",
                categoryText: "text-rose-600",
                glow: "bg-rose-500/10",
              },
              amber: {
                bg: notif.unread
                  ? "bg-amber-50/90 border-amber-200"
                  : "bg-white border-slate-100",
                iconBg: "bg-amber-100 text-amber-600",
                badgeBg: "bg-amber-600 text-white",
                categoryText: "text-amber-600",
                glow: "bg-amber-500/10",
              },
              emerald: {
                bg: notif.unread
                  ? "bg-emerald-50/90 border-emerald-200"
                  : "bg-white border-slate-100",
                iconBg: "bg-emerald-100 text-emerald-600",
                badgeBg: "bg-emerald-600 text-white",
                categoryText: "text-emerald-600",
                glow: "bg-emerald-500/10",
              },
              violet: {
                bg: notif.unread
                  ? "bg-violet-50/90 border-violet-200"
                  : "bg-white border-slate-100",
                iconBg: "bg-violet-100 text-violet-600",
                badgeBg: "bg-violet-600 text-white",
                categoryText: "text-violet-600",
                glow: "bg-violet-500/10",
              },
              cyan: {
                bg: notif.unread
                  ? "bg-cyan-50/90 border-cyan-200"
                  : "bg-white border-slate-100",
                iconBg: "bg-cyan-100 text-cyan-600",
                badgeBg: "bg-cyan-600 text-white",
                categoryText: "text-cyan-600",
                glow: "bg-cyan-500/10",
              },
            }[notif.theme || "indigo"];

            return (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden group cursor-pointer hover:shadow-md ${themeStyles.bg}`}
              >
                <div
                  className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none ${themeStyles.glow}`}
                />

                <div className="flex items-start gap-3.5 relative z-10">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${themeStyles.iconBg}`}
                  >
                    <IconComponent size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`text-[11px] font-extrabold uppercase tracking-wider ${themeStyles.categoryText}`}
                      >
                        {notif.category}
                      </span>
                      {notif.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shadow-sm ${themeStyles.badgeBg}`}
                        >
                          {notif.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-800 leading-snug">
                        {notif.title}
                      </h3>
                      {notif.unread && (
                        <span
                          className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse"
                          title="Unread"
                        />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.desc}
                    </p>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/50 text-[11px] text-slate-400 font-medium">
                      <span>{notif.time}</span>
                      {notif.unread ? (
                        <span className="text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to mark read
                        </span>
                      ) : (
                        <span className="text-slate-400 opacity-60">Read</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SellItemModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        onSuccess={() => {
          if (window.location.pathname === "/") {
            window.location.reload();
          } else {
            navigate("/");
          }
        }}
      />
    </>
  );
}

export default Navbar;
