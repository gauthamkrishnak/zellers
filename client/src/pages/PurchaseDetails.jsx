import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  ArrowLeft,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  MapPin,
  Tag,
  User,
  ShieldCheck,
  CreditCard,
  FileText,
  AlertCircle,
  PackageCheck,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";

export default function PurchaseDetails() {
  const { orderId, productId } = useParams();
  const [purchaseItem, setPurchaseItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthHeaders, isAuthenticated } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchPurchaseItem();
  }, [isAuthenticated, orderId, productId]);

  const fetchPurchaseItem = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/orders/my-purchases",
        { headers: getAuthHeaders() }
      );
      const found = response.data.find(
        (item) =>
          String(item.order_id) === String(orderId) &&
          String(item.product_id) === String(productId)
      );
      if (!found) {
        setError("Purchase record not found.");
      } else {
        setPurchaseItem(found);
      }
    } catch (err) {
      console.error("Error loading purchase details:", err);
      setError("Failed to load historical purchase snapshot.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyAgain = async () => {
    if (!purchaseItem || !purchaseItem.product_exists || purchaseItem.is_sold)
      return;
    await addToCart({
      id: purchaseItem.product_id,
      title: purchaseItem.snapshot_product_title || purchaseItem.product_title,
      price: purchaseItem.purchased_price,
      image:
        purchaseItem.snapshot_primary_image ||
        purchaseItem.current_product_image,
    });
    setIsCartOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "Delivered").toUpperCase();
    if (s === "PROCESSING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={14} className="text-amber-600 animate-pulse" />
          Processing
        </span>
      );
    }
    if (s === "DELIVERED" || s === "SUCCESS") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={14} className="text-emerald-600" />
          Delivered
        </span>
      );
    }
    if (s === "CANCELLED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle size={14} className="text-rose-600" />
          Cancelled
        </span>
      );
    }
    if (s === "REFUNDED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-200">
          <RotateCcw size={14} className="text-violet-600" />
          Refunded
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <CheckCircle2 size={14} />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-24 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-4" />
        <p className="text-slate-500 font-semibold text-sm">
          Loading immutable historical snapshot...
        </p>
      </div>
    );
  }

  if (error || !purchaseItem) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-20 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
          <AlertCircle size={36} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Snapshot Unavailable
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {error || "We could not find the purchase details you requested."}
          </p>
          <button
            onClick={() => navigate("/my-purchases")}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition cursor-pointer"
          >
            Back to My Purchases
          </button>
        </div>
      </div>
    );
  }

  const imgName =
    purchaseItem.snapshot_primary_image || purchaseItem.current_product_image;
  const imgSrc = imgName
    ? imgName.startsWith("http")
      ? imgName
      : `http://127.0.0.1:8000/uploads/${imgName}`
    : null;

  const displayTitle =
    purchaseItem.snapshot_product_title || purchaseItem.product_title;
  const displayBrand = purchaseItem.snapshot_brand || purchaseItem.brand;
  const displayCondition =
    purchaseItem.snapshot_condition || purchaseItem.condition;
  const displayLocation =
    purchaseItem.snapshot_location || purchaseItem.location;
  const displayDesc =
    purchaseItem.snapshot_description ||
    purchaseItem.desc ||
    "No historical description available for this snapshot.";
  const displayPrice = purchaseItem.purchased_price || 0;
  const rawSnapshotSeller = purchaseItem.snapshot_seller_name;
  const rawSeller = purchaseItem.seller_name;
  const sellerName =
    (rawSnapshotSeller && rawSnapshotSeller !== "Seller" && rawSnapshotSeller !== "Verified Seller")
      ? rawSnapshotSeller
      : (rawSeller && rawSeller !== "Seller" && rawSeller !== "Verified Seller")
      ? rawSeller
      : "admin";

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto animate-fadeIn">
        {/* Back navigation & Order header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate("/my-purchases")}
            className="group flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold text-sm bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs w-fit transition-all cursor-pointer"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span>Back to Purchases</span>
          </button>

          <div className="flex items-center gap-3">
            {getStatusBadge(purchaseItem.order_status)}
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-900 text-white">
              Order #{purchaseItem.order_id}
            </span>
          </div>
        </div>

        {/* Notice of Immutable Snapshot */}
        <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-2xs">
          <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-950 leading-relaxed">
            <span className="font-bold">Historical Purchase Snapshot:</span> This record shows the exact title, condition, description, and images of the product at the precise moment payment succeeded on{" "}
            <span className="font-semibold underline">
              {formatDate(purchaseItem.order_date)}
            </span>
            . Any subsequent changes made by the seller do not affect these historical details.
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Product Image & Historical Info (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs overflow-hidden">
              <div className="relative h-80 sm:h-96 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-6 overflow-hidden mb-6">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={displayTitle}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-slate-400 text-sm font-medium flex flex-col items-center gap-2">
                    <ShoppingBag size={36} className="text-slate-300" />
                    <span>No Historical Image Captured</span>
                  </div>
                )}
              </div>

              {/* Badges & Title */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {displayBrand && displayBrand !== "Generic" && (
                  <span className="px-3 py-1 rounded-lg text-xs font-black bg-indigo-50 text-indigo-600 uppercase tracking-wider border border-indigo-100">
                    {displayBrand}
                  </span>
                )}
                {displayCondition && (
                  <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Condition: {displayCondition}
                  </span>
                )}
                {purchaseItem.category && (
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    Category: {purchaseItem.category}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                {displayTitle}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 pb-6 border-b border-slate-100">
                {displayLocation && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-indigo-500" />
                    <span>Location: {displayLocation}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar size={15} className="text-indigo-500" />
                  <span>Purchased: {formatDate(purchaseItem.order_date)}</span>
                </div>
              </div>

              {/* Historical Description */}
              <div className="mt-6">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <FileText size={14} />
                  <span>Snapshot Description at Checkout</span>
                </h3>
                <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                  {displayDesc}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Receipt, Current Status & Actions (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Current Listing Status Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Tag size={14} />
                <span>Current Live Status</span>
              </h3>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-5">
                <span className="text-xs font-bold text-slate-600">
                  Marketplace Status:
                </span>
                {purchaseItem.product_exists ? (
                  purchaseItem.is_sold ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Sold
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Available
                    </span>
                  )
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-600">
                    No Longer Available
                  </span>
                )}
              </div>

              {/* Dynamic Buy Again button based on exact Product table check */}
              {purchaseItem.product_exists && !purchaseItem.is_sold ? (
                <button
                  onClick={handleBuyAgain}
                  className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  <ShoppingBag size={18} />
                  <span>Buy Again</span>
                </button>
              ) : purchaseItem.product_exists && purchaseItem.is_sold ? (
                <button
                  disabled
                  className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 text-slate-400 font-bold text-sm border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>Sold Out</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 text-slate-400 font-bold text-xs border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>Listing No Longer Available</span>
                </button>
              )}
            </div>

            {/* Order Summary & Receipt Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col gap-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CreditCard size={14} />
                <span>Payment & Order Summary</span>
              </h3>

              <div className="space-y-3.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Order ID</span>
                  <span className="font-mono font-bold text-slate-800">
                    #{purchaseItem.order_id}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Payment ID</span>
                  <span
                    className="font-mono text-xs font-bold text-slate-600 truncate max-w-[170px]"
                    title={purchaseItem.payment_id}
                  >
                    {purchaseItem.payment_id}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Method</span>
                  <span className="font-bold text-slate-800">
                    {purchaseItem.payment_method}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Payment Status</span>
                  <span className="text-emerald-600 font-black text-xs uppercase bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                    {purchaseItem.payment_status}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-700 font-bold text-base">
                  Amount Paid
                </span>
                <span className="text-2xl font-black text-indigo-600">
                  ₹{displayPrice.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Seller Details Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User size={14} />
                <span>Seller Details</span>
              </h3>

              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
                  {sellerName.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-slate-800 text-sm truncate">
                      {sellerName}
                    </p>
                    <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-slate-400 text-xs font-medium">
                    {sellerName.toLowerCase() === "admin" ? "Official Admin Store" : "Verified Seller Snapshot"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
