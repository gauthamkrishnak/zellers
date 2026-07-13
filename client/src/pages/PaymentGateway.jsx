import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Check,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function PaymentGateway() {
  const navigate = useNavigate();
  const { getAuthHeaders, user } = useAuth();
  const { cartItems, fetchCart } = useCart();

  const [loadingOrder, setLoadingOrder] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const initOrder = async () => {
      setLoadingOrder(true);
      setErrorMessage(null);
      try {
        const res = await axios.post(
          "http://127.0.0.1:8000/checkout/initiate",
          {},
          { headers: getAuthHeaders() }
        );
        setOrderData(res.data);
      } catch (err) {
        setErrorMessage(
          err.response?.data?.detail || "Failed to initiate checkout order."
        );
      } finally {
        setLoadingOrder(false);
      }
    };

    initOrder();
  }, [getAuthHeaders]);

  const handleVerifyPayment = async (paymentId, signature) => {
    setProcessing(true);
    setErrorMessage(null);
    try {
      const verifyRes = await axios.post(
        "http://127.0.0.1:8000/checkout/verify",
        {
          razorpay_order_id: orderData.razorpay_order_id,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        },
        { headers: getAuthHeaders() }
      );

      if (verifyRes.data && verifyRes.data.success) {
        await fetchCart();
        navigate(`/order-success?order_id=${verifyRes.data.order_id}`);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail ||
          "Payment verification failed. Your cart remains unchanged."
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
      description: "Order Checkout Gateway",
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
              "http://127.0.0.1:8000/checkout/failure",
              {
                razorpay_order_id: orderData.razorpay_order_id,
                error_description: "Payment modal dismissed by user",
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
            Establishing secure Razorpay session & fetching authoritative order summary from PostgreSQL
          </p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <AlertCircle size={40} className="text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Checkout Initialization Failed</h2>
          <p className="text-sm text-slate-400">{errorMessage}</p>
          <button
            onClick={() => navigate("/cart")}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-sm cursor-pointer transition-colors"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  const supportedMethods = [
    "UPI",
    "QR",
    "Credit Cards",
    "Debit Cards",
    "Wallets",
    "Netbanking",
    "EMI",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Cart
          </button>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-400">
            <Lock size={13} /> 256-Bit TLS Encrypted Gateway
          </div>
        </div>

        {/* Alert / Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-300 animate-fade-in">
            <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-sm">Payment Status</p>
              <p className="text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column - Secure Checkout Card */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-violet-900/40 p-6 sm:p-8 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">
                    Secure Checkout
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Payments securely processed by Razorpay
                  </p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Total Payable Box */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Payable Amount
                  </span>
                  <p className="text-2xl sm:text-3xl font-black text-white mt-1">
                    ₹{orderData.amount_inr?.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CreditCard size={20} />
                </div>
              </div>

              {/* Supported Methods List */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Supported Payment Methods
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {supportedMethods.map((method) => (
                    <div
                      key={method}
                      className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-xs font-bold text-slate-200"
                    >
                      <Check
                        size={14}
                        className="text-emerald-400 shrink-0"
                      />
                      <span>{method}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* One Large Proceed Button */}
              <button
                onClick={openRazorpay}
                disabled={processing}
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-indigo-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {processing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Verifying Payment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    <span>Proceed to Secure Payment</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                Clicking the button above opens the official Razorpay Checkout window where you can choose your preferred payment method.
              </p>
            </div>
          </div>

          {/* Right Column - Order Summary Card */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl sticky top-24">
            <h2 className="text-base font-extrabold text-white mb-4 pb-3 border-b border-slate-800 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-mono text-indigo-400">
                #{orderData.razorpay_order_id}
              </span>
            </h2>

            {/* Item List */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
              {cartItems.map((item) => (
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
