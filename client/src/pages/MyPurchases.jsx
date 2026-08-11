import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { API_BASE_URL, getImageUrl } from "../config";
import {
  ShoppingBag,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ExternalLink,
  RotateCw,
  Tag,
  MapPin,
  User,
  AlertCircle,
  ArrowRight,
  Star,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MyPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthHeaders, isAuthenticated } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  // Rate Seller Modal State
  const [activeRateItem, setActiveRateItem] = useState(null);
  const [reviewingExisting, setReviewingExisting] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submittingRate, setSubmittingRate] = useState(false);
  const [rateError, setRateError] = useState(null);

  const openRateModal = (item, existingReview = null) => {
    setActiveRateItem(item);
    setRateError(null);
    if (existingReview) {
      setReviewingExisting(existingReview);
      setSelectedRating(existingReview.rating || 5);
    } else {
      setReviewingExisting(null);
      setSelectedRating(0);
    }
  };

  const closeRateModal = () => {
    setActiveRateItem(null);
    setReviewingExisting(null);
    setSelectedRating(0);
    setHoveredRating(0);
    setRateError(null);
  };

  const handleSubmitReview = async () => {
    if (selectedRating < 1 || selectedRating > 5) {
      setRateError("Please select a rating between 1 and 5 stars.");
      return;
    }
    setSubmittingRate(true);
    setRateError(null);
    try {
      if (reviewingExisting) {
        await axios.put(
          `${API_BASE_URL}/reviews/${reviewingExisting.id}`,
          {
            rating: selectedRating,
            review_text: null,
          },
          { headers: getAuthHeaders() }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/reviews`,
          {
            order_item_id: activeRateItem.order_item_id || activeRateItem.product_id,
            rating: selectedRating,
            review_text: null,
          },
          { headers: getAuthHeaders() }
        );
      }
      await fetchPurchases();
      closeRateModal();
    } catch (err) {
      setRateError(
        err.response?.data?.detail || "Failed to submit review. Please try again."
      );
    } finally {
      setSubmittingRate(false);
    }
  };


  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchPurchases();
  }, [isAuthenticated]);

  const fetchPurchases = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/orders/my-purchases`,
        { headers: getAuthHeaders() }
      );
      setPurchases(response.data);
    } catch (err) {
      console.error("Failed to fetch purchases:", err);
      setError("Unable to load your purchase history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyAgain = async (item) => {
    if (!item.product_exists || item.is_sold) return;
    await addToCart({
      id: item.product_id,
      title: item.snapshot_product_title || item.product_title,
      price: item.purchased_price,
      image: item.snapshot_primary_image || item.current_product_image,
    });
    setIsCartOpen(true);
  };

  const getStatusBadge = (status) => {
    const s = (status || "Delivered").toUpperCase();
    if (s === "PROCESSING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
          <Clock size={13} className="text-amber-600 animate-pulse" />
          Processing
        </span>
      );
    }
    if (s === "DELIVERED" || s === "SUCCESS") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          <CheckCircle2 size={13} className="text-emerald-600" />
          Delivered
        </span>
      );
    }
    if (s === "CANCELLED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
          <XCircle size={13} className="text-rose-600" />
          Cancelled
        </span>
      );
    }
    if (s === "REFUNDED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200 shadow-2xs">
          <RotateCcw size={13} className="text-violet-600" />
          Refunded
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
        <CheckCircle2 size={13} />
        {status}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <ShoppingBag size={26} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                My Purchases
              </h1>
              <p className="text-slate-500 text-sm mt-1 font-medium">
                Immutable historical snapshot of your Zellers orders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider border border-slate-200/60">
              {purchases.length} {purchases.length === 1 ? "Order" : "Orders"}
            </span>
            <button
              onClick={fetchPurchases}
              title="Refresh Purchases"
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer border border-slate-200/60"
            >
              <RotateCw size={18} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-4" />
            <p className="text-slate-500 font-semibold text-sm">
              Loading your purchase history...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl text-center flex flex-col items-center gap-3 max-w-md mx-auto my-12 shadow-sm">
            <AlertCircle size={32} className="text-rose-600" />
            <p className="text-rose-800 font-bold text-sm">{error}</p>
            <button
              onClick={fetchPurchases}
              className="mt-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && purchases.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center shadow-2xs my-8">
            <div className="w-20 h-20 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 shadow-inner">
              <ShoppingBag size={36} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              No purchases yet
            </h2>
            <p className="text-slate-500 text-sm max-w-sm mt-2 mb-8 leading-relaxed">
              When you buy products on Zellers, your historical snapshots and order receipts will safely appear right here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <span>Explore Marketplace</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Purchase Grid / List */}
        {!loading && !error && purchases.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {purchases.map((item, idx) => {
                const imgName =
                  item.snapshot_primary_image || item.current_product_image;
                const imgSrc = imgName ? getImageUrl(imgName) : null;

                const displayTitle =
                  item.snapshot_product_title || item.product_title;
                const displayBrand = item.snapshot_brand || item.brand;
                const displayCondition =
                  item.snapshot_condition || item.condition;
                const displayPrice = item.purchased_price || 0;
                const displayLocation =
                  item.snapshot_location || item.location;
                const rawSnapshotSeller = item.snapshot_seller_name;
                const rawSeller = item.seller_name;
                const sellerName =
                  (rawSnapshotSeller && rawSnapshotSeller !== "Seller" && rawSnapshotSeller !== "Verified Seller")
                    ? rawSnapshotSeller
                    : (rawSeller && rawSeller !== "Seller" && rawSeller !== "Verified Seller")
                    ? rawSeller
                    : "admin";

                // Determine dynamic Buy Again button state exactly per prompt specifications
                const productExists = item.product_exists;
                const isSold = item.is_sold;

                return (
                  <motion.div
                    key={`${item.order_id}-${item.product_id}-${idx}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row"
                  >
                    {/* Left: Product Image */}
                    <div className="relative md:w-64 h-56 md:h-auto bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 flex items-center justify-center p-6 shrink-0 overflow-hidden group">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={displayTitle}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-slate-400 text-xs font-medium flex flex-col items-center gap-1">
                          <ShoppingBag size={28} className="text-slate-300" />
                          <span>No Image</span>
                        </div>
                      )}
                      <div className="absolute top-3.5 left-3.5">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-900/80 backdrop-blur-xs text-white">
                          Order #{item.order_id}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Snapshot Details */}
                    <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {displayBrand && displayBrand !== "Generic" && (
                              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-600 uppercase tracking-wider border border-indigo-100">
                                {displayBrand}
                              </span>
                            )}
                            {displayCondition && (
                              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {displayCondition}
                              </span>
                            )}
                          </div>
                          <div>{getStatusBadge(item.order_status)}</div>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug">
                          {displayTitle}
                        </h3>

                        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-slate-400" />
                            <span>Purchased on {formatDate(item.order_date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User size={14} className="text-slate-400" />
                            <span>Seller: {sellerName}</span>
                          </div>
                          {displayLocation && (
                            <div className="flex items-center gap-1.5">
                              <MapPin size={14} className="text-slate-400" />
                              <span>{displayLocation}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <span className="text-xs text-slate-400 block font-medium">
                            Price Paid at Checkout
                          </span>
                          <span className="text-xl sm:text-2xl font-black text-indigo-600">
                            ₹{displayPrice.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={() =>
                              navigate(
                                `/my-purchases/${item.order_id}/${item.product_id}`
                              )
                            }
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 font-bold text-xs transition-all cursor-pointer bg-white shadow-2xs"
                          >
                            <span>View Details</span>
                            <ExternalLink size={14} />
                          </button>

                          {/* Rate Seller Button / Your Rating Badge */}
                          {["SUCCESS", "Delivered"].includes(item.order_status) && (
                            !item.user_review ? (
                              <button
                                onClick={() => openRateModal(item, null)}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-800 font-bold text-xs transition-all cursor-pointer shadow-2xs"
                              >
                                <Star size={14} className="fill-amber-500 text-amber-500" />
                                <span>Rate Seller</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => openRateModal(item, item.user_review)}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer shadow-2xs group/rate"
                              >
                                <div className="flex items-center gap-0.5">
                                  {[...Array(item.user_review.rating)].map((_, i) => (
                                    <Star key={i} size={13} className="fill-amber-500 text-amber-500" />
                                  ))}
                                </div>
                                <span className="ml-1 text-slate-600 group-hover/rate:text-indigo-600">(Edit Rating)</span>
                              </button>
                            )
                          )}

                          {/* Dynamic Buy Again button based on current listing status */}
                          {productExists && !isSold ? (
                            <button
                              onClick={() => handleBuyAgain(item)}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95"
                            >
                              <ShoppingBag size={14} />
                              <span>Buy Again</span>
                            </button>
                          ) : productExists && isSold ? (
                            <button
                              disabled
                              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs border border-slate-200 cursor-not-allowed"
                            >
                              Sold Out
                            </button>
                          ) : (
                            <button
                              disabled
                              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs border border-slate-200 cursor-not-allowed"
                            >
                              Listing No Longer Available
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Rate Seller Modal */}
        <AnimatePresence>
          {activeRateItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 max-w-lg w-full relative overflow-hidden"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Star className="fill-amber-500 text-amber-500" size={22} />
                      <span>{reviewingExisting ? "Edit Seller Rating" : "Rate Seller"}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      For seller <span className="font-bold text-slate-700">{activeRateItem.snapshot_seller_name && activeRateItem.snapshot_seller_name !== "Seller" && activeRateItem.snapshot_seller_name !== "Verified Seller" ? activeRateItem.snapshot_seller_name : (activeRateItem.seller_name && activeRateItem.seller_name !== "Seller" && activeRateItem.seller_name !== "Verified Seller" ? activeRateItem.seller_name : "admin")}</span> • Order #{activeRateItem.order_id}
                    </p>
                  </div>
                  <button
                    onClick={closeRateModal}
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {rateError && (
                  <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{rateError}</span>
                  </div>
                )}

                {/* Star Selector */}
                <div className="flex flex-col items-center justify-center py-4 my-2 bg-slate-50/80 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                    Select Your Rating
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isSelectedOrHovered = (hoveredRating || selectedRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSelectedRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="p-1.5 sm:p-2 rounded-xl transition-all duration-200 hover:scale-125 focus:outline-none cursor-pointer"
                        >
                          <Star
                            size={36}
                            className={`transition-colors ${
                              isSelectedOrHovered
                                ? "fill-amber-500 text-amber-500"
                                : "text-slate-300 hover:text-amber-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-sm font-extrabold text-slate-700 mt-3 h-5">
                    {(hoveredRating || selectedRating) === 5
                      ? "Excellent (5/5)"
                      : (hoveredRating || selectedRating) === 4
                      ? "Great (4/5)"
                      : (hoveredRating || selectedRating) === 3
                      ? "Average (3/5)"
                      : (hoveredRating || selectedRating) === 2
                      ? "Poor (2/5)"
                      : (hoveredRating || selectedRating) === 1
                      ? "Terrible (1/5)"
                      : "Tap stars to rate"}
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeRateModal}
                    disabled={submittingRate}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={submittingRate || selectedRating === 0}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
                  >
                    {submittingRate ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        <span>{reviewingExisting ? "Update Rating" : "Submit Rating"}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
