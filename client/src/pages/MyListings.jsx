import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Package,
  Edit3,
  Trash2,
  Plus,
  ArrowLeft,
  Calendar,
  Tag,
  CheckCircle2,
  AlertTriangle,
  X,
  Megaphone,
  ShieldCheck,
  History,
  Clock,
  Loader2,
  TrendingDown,
  Sparkles,
  Zap,
  Trophy,
  Eye,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SellItemModal from "../components/SellItemModal";
import { API_BASE_URL, getImageUrl } from "../config";

export default function MyListings() {
  const navigate = useNavigate();
  const { getAuthHeaders, isAuthenticated } = useAuth();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Modal states
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [boostingItem, setBoostingItem] = useState(null);
  const [boostConfirmModalItem, setBoostConfirmModalItem] = useState(null);
  const [historyModalItem, setHistoryModalItem] = useState(null);
  const [boostHistory, setBoostHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchMyListings = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/my-listings`, {
        headers: getAuthHeaders(),
      });
      setListings(response.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Could not load your listings. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [isAuthenticated]);

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setDeleting(true);
    try {
      await axios.delete(
        `${API_BASE_URL}/products/${deleteCandidate.id}`,
        {
          headers: getAuthHeaders(),
        },
      );
      setListings((prev) => prev.filter((p) => p.id !== deleteCandidate.id));
      setSuccessMessage("Listing deleted successfully!");
      setDeleteCandidate(null);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      alert(
        err.response?.data?.detail ||
          "Failed to delete listing. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleBoostListing = async (item) => {
    if (item.is_sold || item.status === "sold" || boostingItem) return;
    setBoostingItem(item.id);
    try {
      const initRes = await axios.post(
        `${API_BASE_URL}/products/${item.id}/boost/initiate`,
        {},
        { headers: getAuthHeaders() },
      );

      const options = {
        key: initRes.data.key,
        amount: initRes.data.amount,
        currency: initRes.data.currency,
        name: "Zellers Marketplace",
        description: `Boost Listing: ${item.title}`,
        order_id: initRes.data.razorpay_order_id,
        handler: async function (paymentResponse) {
          try {
            await axios.post(
              `${API_BASE_URL}/products/${item.id}/boost/verify`,
              {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              },
              { headers: getAuthHeaders() },
            );
            fetchMyListings();
            setSuccessMessage(
              "Listing boosted successfully! Your item now appears first with a Sponsored badge.",
            );
            setTimeout(() => setSuccessMessage(""), 5000);
          } catch (verErr) {
            alert(
              verErr.response?.data?.detail ||
                "Boost verification failed. Please check payment status.",
            );
          }
        },
        modal: {
          ondismiss: function () {},
        },
        theme: { color: "#4F46E5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.detail || "Could not initiate boost checkout.");
    } finally {
      setBoostingItem(null);
    }
  };

  const handleViewHistory = async (item) => {
    setHistoryModalItem(item);
    setHistoryLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/products/${item.id}/boost-history`,
        { headers: getAuthHeaders() },
      );
      setBoostHistory(res.data || []);
    } catch (err) {
      alert("Failed to load boost history.");
      setBoostHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Success Notification Banner */}
      {successMessage && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/70 pb-6 mb-8 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="group p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all duration-200 border-none bg-transparent cursor-pointer"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-0.5 transition-transform duration-200"
            />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              My Listings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage, edit, or delete the items you have posted for sale
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSellModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={18} />
          <span>Post New Item</span>
        </button>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl border border-slate-200/60 p-5 animate-pulse flex flex-col gap-4"
            >
              <div className="h-48 bg-slate-100 rounded-2xl w-full" />
              <div className="h-5 bg-slate-100 rounded-md w-3/4" />
              <div className="h-4 bg-slate-100 rounded-md w-1/2" />
              <div className="h-10 bg-slate-100 rounded-xl w-full mt-4" />
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-3xl text-center">
          <p className="font-semibold text-sm">{error}</p>
          <button
            onClick={fetchMyListings}
            className="mt-4 px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && listings.length === 0 && (
        <div className="max-w-md mx-auto py-20 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
            <Package size={34} />
          </div>

          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            You haven't listed anything yet.
          </h2>

          <p className="text-slate-500 text-sm mt-2 mb-8 leading-relaxed">
            Ready to turn your unused items into cash? Post your first product
            in seconds!
          </p>

          <button
            onClick={() => setIsSellModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-3.5 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={18} />
            <span>Start Selling</span>
          </button>
        </div>
      )}

      {/* Listings Grid */}
      {!loading && !error && listings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => {
            const isSold = Boolean(item.is_sold || item.status === "sold");
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/70 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Image Section */}
                <div className="relative h-56 bg-slate-50 flex items-center justify-center p-4 overflow-hidden border-b border-slate-100">
                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
                    {isSold ? (
                      <span className="bg-rose-600 text-white font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                        SOLD
                      </span>
                    ) : (
                      <span />
                      // <span className="bg-emerald-600 text-white font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                      //   AVAILABLE
                      // </span>
                    )}

                    {item.condition === "Brand New" ? (
                      <span className="bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <ShieldCheck
                          size={13}
                          className="text-blue-600 shrink-0"
                        />
                        <span>Brand New</span>
                      </span>
                    ) : (
                      item.condition && (
                        <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                          {item.condition}
                        </span>
                      )
                    )}

                    {!isSold && item.is_price_drop && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <TrendingDown size={13} className="text-emerald-600 shrink-0" />
                        <span>Price Drop Active</span>
                      </span>
                    )}

                    {item.is_active_boost ? (
                      <span className="bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <Megaphone
                          size={13}
                          className="text-amber-600 shrink-0"
                        />
                        <span>Sponsored</span>
                      </span>
                    ) : item.boost_status === "expired" ? (
                      <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-600">
                        Boost Expired
                      </span>
                    ) : null}
                  </div>

                  {isSold && (
                    <div className="absolute inset-0 z-10 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-rose-600 text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg border border-rose-400/30">
                        SOLD OUT
                      </span>
                    </div>
                  )}

                  <img
                    src={getImageUrl(item.image)}
                    alt={item.title}
                    className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
                      isSold ? "grayscale opacity-60" : "group-hover:scale-105"
                    }`}
                  />
                </div>

                {/* Info Section */}
                <div className="p-5 flex flex-col flex-grow justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        {item.type || item.category}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={13} />
                        {item.listed || "Recent"}
                      </span>
                    </div>

                    {item.is_active_boost && item.boost_end_date && (
                      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                        <Clock size={13} className="text-amber-600" />
                        <span>
                          Active until:{" "}
                          {new Date(item.boost_end_date).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </span>
                      </div>
                    )}

                    <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1 truncate">
                      📍 {item.location}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Price
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-indigo-600">
                          ₹{Number(item.current_price !== undefined ? item.current_price : item.price).toLocaleString("en-IN")}
                        </span>
                        {!isSold && item.is_price_drop && item.highest_price > (item.current_price !== undefined ? item.current_price : item.price) && (
                          <span className="text-xs text-slate-400 line-through font-semibold">
                            ₹{Number(item.highest_price).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      {!isSold && item.is_price_drop && item.savings > 0 && (
                        <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">
                          Save ₹{Number(item.savings).toLocaleString("en-IN")} ({item.discount_percentage}% OFF)
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {!isSold && !item.is_active_boost && (
                        <button
                          onClick={() => setBoostConfirmModalItem(item)}
                          disabled={boostingItem === item.id}
                          title="Boost listing visibility for ₹199 (30 Days / 1 Month)"
                          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-70"
                        >
                          {boostingItem === item.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Megaphone
                              size={14}
                              className="text-slate-950 shrink-0"
                            />
                          )}
                          <span>
                            {item.boost_status === "expired"
                              ? "Boost Again (₹199)"
                              : "Boost (₹199)"}
                          </span>
                        </button>
                      )}

                      {item.is_active_boost && (
                        <span className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2
                            size={14}
                            className="text-emerald-600"
                          />
                          <span>Boost Active</span>
                        </span>
                      )}

                      <button
                        onClick={() => handleViewHistory(item)}
                        title="View boost transaction history"
                        className="p-2 rounded-xl text-xs font-bold border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer bg-white flex items-center gap-1"
                      >
                        <History size={15} />
                        <span className="hidden sm:inline">History</span>
                      </button>

                      <button
                        onClick={() => navigate(`/edit-product/${item.id}`)}
                        disabled={isSold}
                        title={
                          isSold
                            ? "Sold items cannot be edited"
                            : "Edit listing"
                        }
                        className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                          isSold
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            : "bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border-slate-200 hover:border-indigo-300 cursor-pointer"
                        }`}
                      >
                        <Edit3 size={14} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => setDeleteCandidate(item)}
                        title="Delete listing"
                        className="p-2 rounded-xl text-xs font-bold border border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer bg-white"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-lg font-black text-slate-800">
              Delete Listing?
            </h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-700">
                "{deleteCandidate.title}"
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteCandidate(null)}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 cursor-pointer transition-all"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/20 cursor-pointer transition-all flex items-center gap-2"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post New Item Modal */}
      <SellItemModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        onSuccess={() => {
          setIsSellModalOpen(false);
          fetchMyListings();
          setSuccessMessage("New product listed successfully!");
          setTimeout(() => setSuccessMessage(""), 4000);
        }}
      />

      {/* Boost Confirmation & Details Modal */}
      {boostConfirmModalItem && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col justify-between max-h-[90vh]">
            {/* Header banner */}
            <div className="relative bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-500 p-6 text-slate-950 overflow-hidden shrink-0">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950/15 backdrop-blur-md flex items-center justify-center text-slate-950 shadow-inner">
                    <Megaphone size={24} className="animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-slate-950 text-amber-400 px-2.5 py-0.5 rounded-full shadow-xs">
                      Sponsored Plan
                    </span>
                    <h3 className="text-xl font-black text-slate-950 mt-1 leading-tight">
                      Boost Listing Visibility
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setBoostConfirmModalItem(null)}
                  className="w-8 h-8 rounded-full bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Target Item summary */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3.5">
                {boostConfirmModalItem.image_url ? (
                  <img
                    src={boostConfirmModalItem.image_url}
                    alt={boostConfirmModalItem.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    <Package size={20} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-800 text-sm truncate">
                    {boostConfirmModalItem.title}
                  </h4>
                  <p className="text-xs font-black text-emerald-600 mt-0.5">
                    ₹{Number(boostConfirmModalItem.price).toLocaleString("en-IN")}
                  </p>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {boostConfirmModalItem.location || "Local Listing"}
                  </span>
                </div>
              </div>

              {/* Price & Duration Highlight Box */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-center">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 block">
                    Total Price
                  </span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    ₹199
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    One-time payment
                  </span>
                </div>
                <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 text-center">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 block">
                    Duration
                  </span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    30 Days
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    1 Full Month
                  </span>
                </div>
              </div>

              {/* Benefits breakdown */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  What You Get:
                </h5>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Trophy size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        #1 Top Priority Placement
                      </p>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Appears first on homepage recommendations, category feeds, and relevant search results.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Gold Sponsored Badge
                      </p>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Highlighted with a distinct verified Sponsored label that builds trust and captures attention.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Eye size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Up to 5x More Buyer Inquiries
                      </p>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Boosted items receive 500% more views, helping your item sell significantly faster.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Guaranteed 30-Day Coverage
                      </p>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Remains active 24/7 for a whole month until{" "}
                        <span className="font-semibold text-slate-700">
                          {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>. No recurring charges.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setBoostConfirmModalItem(null)}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = boostConfirmModalItem;
                  setBoostConfirmModalItem(null);
                  handleBoostListing(target);
                }}
                disabled={boostingItem === boostConfirmModalItem.id}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-70 active:scale-95"
              >
                {boostingItem === boostConfirmModalItem.id ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Opening Payment...</span>
                  </>
                ) : (
                  <>
                    <Zap size={15} className="fill-slate-950" />
                    <span>Proceed & Pay ₹199</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boost History Modal */}
      {historyModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-fadeIn max-h-[85vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold">
                    <Megaphone size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Sponsored Listing History
                    </h3>
                    <p className="text-xs text-slate-500 truncate max-w-sm">
                      {historyModalItem.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setHistoryModalItem(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="py-4 overflow-y-auto max-h-[55vh]">
                {historyLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <Loader2
                      size={28}
                      className="animate-spin text-indigo-600 mb-2"
                    />
                    <span className="text-xs font-semibold">
                      Loading boost history...
                    </span>
                  </div>
                ) : boostHistory.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold">
                      No boost purchases recorded for this item.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Boost this item to gain 5x more visibility across Zellers.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase font-extrabold tracking-wider text-[10px]">
                          <th className="py-3 px-2">Boost Date</th>
                          <th className="py-3 px-2">Plan / Expiry</th>
                          <th className="py-3 px-2">Amount Paid</th>
                          <th className="py-3 px-2">Payment ID</th>
                          <th className="py-3 px-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {boostHistory.map((bh) => (
                          <tr
                            key={bh.id}
                            className="hover:bg-slate-50/60 transition-colors"
                          >
                            <td className="py-3 px-2 font-bold text-slate-700">
                              {bh.created_at
                                ? new Date(bh.created_at).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )
                                : "N/A"}
                            </td>
                            <td className="py-3 px-2 text-slate-600">
                              <span className="font-bold uppercase tracking-wider text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded mr-1.5">
                                {bh.boost_plan}
                              </span>
                              <span className="text-slate-500">
                                Exp:{" "}
                                {bh.boost_end_date
                                  ? new Date(
                                      bh.boost_end_date,
                                    ).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                    })
                                  : "N/A"}
                              </span>
                            </td>
                            <td className="py-3 px-2 font-black text-emerald-600">
                              ₹{Number(bh.amount_paid).toLocaleString("en-IN")}
                            </td>
                            <td
                              className="py-3 px-2 font-mono text-slate-500 text-[11px] truncate max-w-[110px]"
                              title={bh.payment_id || "N/A"}
                            >
                              {bh.payment_id || "Payment recorded"}
                            </td>
                            <td className="py-3 px-2">
                              <span
                                className={`px-2 py-0.5 rounded-full font-extrabold uppercase text-[10px] ${
                                  bh.status === "active"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}
                              >
                                {bh.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setHistoryModalItem(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
