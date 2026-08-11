import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Check,
  CreditCard,
  XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function PaymentGateway() {
  const navigate = useNavigate();
  const { getAuthHeaders, user } = useAuth();
  const { cartItems, fetchCart, setIsCartOpen } = useCart();

  const [loadingOrder, setLoadingOrder] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [unavailableModal, setUnavailableModal] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const mode = searchParams.get("mode");
  const productId = searchParams.get("product_id");

  useEffect(() => {
    const initOrder = async () => {
      setLoadingOrder(true);
      setErrorMessage(null);
      setUnavailableModal(false);
      try {
        const params = {};
        if (mode === "buynow" && productId) {
          params.mode = "buynow";
          params.product_id = parseInt(productId, 10);
        }
        const res = await axios.post(
          `${API_BASE_URL}/checkout/initiate`,
          params,
          { headers: getAuthHeaders(), params }
        );
        setOrderData(res.data);
      } catch (err) {
        const status = err.response?.status;
        const detail = err.response?.data?.detail;
        if (status === 400 && detail && (typeof detail === "object" || typeof detail === "string")) {
          const msg = typeof detail === "object" ? detail.message : detail;
          if (mode === "buynow" && productId) {
            navigate(`/products/${productId}`, {
              state: { buyNowError: msg || "This product is no longer available." },
            });
            return;
          } else {
            await fetchCart();
            setUnavailableModal(true);
            setErrorMessage(msg || "Some items in your cart are no longer available.");
          }
        } else {
          setErrorMessage(
            typeof detail === "string"
              ? detail
              : detail?.message || "Failed to initiate checkout order."
          );
        }
      } finally {
        setLoadingOrder(false);
      }
    };

    initOrder();
  }, [getAuthHeaders, mode, productId, navigate, fetchCart]);

  const handleVerifyPayment = async (paymentId, signature) => {
    setProcessing(true);
    setErrorMessage(null);
    try {
      const verifyRes = await axios.post(
        `${API_BASE_URL}/checkout/verify`,
        {
          razorpay_order_id: orderData.razorpay_order_id,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          mode: orderData?.mode || mode,
          product_id: orderData?.product_id || (productId ? parseInt(productId, 10) : null),
        },
        { headers: getAuthHeaders() }
      );

      if (verifyRes.data && verifyRes.data.success) {
        if (orderData?.mode !== "buynow") {
          await fetchCart();
        }
        navigate(`/order-success?order_id=${verifyRes.data.order_id}`);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail ||
          "Payment verification failed. Your items remain unchanged."
      );
      setProcessing(false);
    }
  };

  const openRazorpay = () => {
    if (!window.Razorpay) {
      setErrorMessage(
        "Razorpay SDK is not loaded. Please verify your internet connection or script loading."
      );
      return;
    }

    setErrorMessage(null);

    const options = {
      key: orderData.razorpay_key_id || orderData.key,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "Zellers Marketplace",
      description: orderData?.mode === "buynow" ? "Buy Now Instant Checkout" : "Order Checkout Gateway",
      order_id: orderData.razorpay_order_id,
      handler: async function (response) {
        await handleVerifyPayment(
          response.razorpay_payment_id,
          response.razorpay_signature
        );
      },
      modal: {
        ondismiss: async function () {
          try {
            await axios.post(
              `${API_BASE_URL}/checkout/failure`,
              {
                razorpay_order_id: orderData.razorpay_order_id,
                error_description: "Payment modal dismissed by user",
                mode: orderData?.mode || mode,
                product_id: orderData?.product_id || (productId ? parseInt(productId, 10) : null),
              },
              { headers: getAuthHeaders() }
            );
          } catch (e) {}
          setErrorMessage("Payment cancelled.");
        },
      },
      prefill: {
        name: user?.username || "Zellers User",
        email: user?.email || "",
      },
      theme: {
        color: "#4f46e5",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (loadingOrder) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <Loader2 size={40} className="animate-spin text-indigo-500 mx-auto" />
          <h2 className="text-xl font-bold">Initiating Secure Checkout...</h2>
          <p className="text-xs text-slate-400">
            Establishing secure Razorpay session & validating item availability from PostgreSQL
          </p>
        </div>
      </div>
    );
  }

  if (unavailableModal) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white animate-fadeIn">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
            <XCircle size={36} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              Some items in your cart are no longer available.
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Review your cart before proceeding.
            </p>
          </div>
          <button
            onClick={() => {
              navigate("/cart");
            }}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            Review Cart
          </button>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
            <AlertCircle size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Checkout Error</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {errorMessage || "Unable to initialize order session."}
            </p>
          </div>
          <button
            onClick={() => {
              if (mode === "buynow" && productId) {
                navigate(`/products/${productId}`);
              } else {
                navigate("/cart");
              }
            }}
            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const itemsToDisplay = orderData.items || cartItems;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <button
            onClick={() => {
              if (mode === "buynow" && productId) {
                navigate(`/products/${productId}`);
              } else {
                navigate("/cart");
              }
            }}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{mode === "buynow" ? "Back to Product" : "Back to Cart"}</span>
          </button>

          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400">
            <Lock size={14} />
            <span>256-Bit SSL Secured</span>
          </div>
        </div>

        {/* Error banner if payment retry needed */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-400">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-sm font-bold">Payment Notice</h4>
              <p className="text-xs text-rose-300 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Action Area */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">
                {mode === "buynow" ? "Instant Buy Now Checkout" : "Confirm & Pay"}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {mode === "buynow"
                  ? "Direct single-item checkout via Razorpay Gateway"
                  : "Review your marketplace order and complete secure payment via Razorpay Gateway"}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Amount Payable</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check size={14} /> Verified Price
                </span>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">
                ₹{orderData.amount_inr?.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-slate-500">
                Order Reference: <span className="font-mono text-slate-400">{orderData.razorpay_order_id}</span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <button
                onClick={openRazorpay}
                disabled={processing}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-indigo-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {processing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Verifying Cryptographic Signature...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    <span>Pay ₹{orderData.amount_inr?.toLocaleString("en-IN")} Now</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400 pt-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-indigo-400" />
                  <span>Razorpay Verified</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock size={14} className="text-emerald-400" />
                  <span>Encrypted Transaction</span>
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Order Summary */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl sticky top-24">
            <h2 className="text-base font-extrabold text-white mb-4 pb-3 border-b border-slate-800 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-mono text-indigo-400">
                #{orderData.razorpay_order_id}
              </span>
            </h2>

            {/* Item List */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
              {itemsToDisplay.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs py-2 border-b border-slate-800/60"
                >
                  <span className="text-slate-300 font-medium truncate max-w-[190px]">
                    {item.title}
                  </span>
                  <span className="text-white font-bold shrink-0">
                    ₹{item.price.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2.5 text-xs border-t border-slate-800 pt-4 mb-6">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>₹{orderData.amount_inr?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gateway Fee</span>
                <span className="text-emerald-400 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                <span>Total Due</span>
                <span className="text-indigo-400">
                  ₹{orderData.amount_inr?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Security Badge Info */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
                <span>Authoritative PostgreSQL Total</span>
              </div>
              <p className="leading-relaxed">
                Prices are fetched directly from PostgreSQL. Payment verification is cryptographically confirmed on FastAPI before any order is completed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
