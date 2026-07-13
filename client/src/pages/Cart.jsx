import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    cartTotal,
    handleRazorpayCheckout,
    isCheckingOut,
    checkoutError,
  } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-semibold text-sm mb-2 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Marketplace
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <ShoppingBag className="text-indigo-600" size={32} />
              Shopping Cart
              <span className="text-sm font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </span>
            </h1>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all cursor-pointer self-start sm:self-center"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Payment Error Alert */}
        {checkoutError && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 shadow-sm animate-fade-in">
            <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-bold text-rose-900">Payment Unsuccessful</h3>
              <p className="text-xs text-rose-700 mt-1">{checkoutError}</p>
              <p className="text-xs font-semibold text-rose-800 mt-1">
                Your cart remains unchanged. You can try checking out again.
              </p>
            </div>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={36} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
              Your cart is empty
            </h2>
            <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
              Looks like you haven't added anything to your cart yet. Browse our marketplace to discover amazing deals.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
            >
              Explore Marketplace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-full sm:w-28 h-28 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-slate-100">
                    <img
                      src={`http://127.0.0.1:8000/uploads/${item.image}`}
                      alt={item.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full mb-1">
                      {item.type}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {item.desc}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Location: {item.location}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 gap-2">
                    <span className="text-xl font-extrabold text-indigo-600">
                      ₹{item.price.toLocaleString("en-IN")}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-28">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6 border-b border-slate-100 pb-4">
                Order Summary
              </h2>

              <div className="space-y-4 text-sm mb-6">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-bold text-slate-900">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Buyer Protection Fee</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>

                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <span className="text-base font-extrabold text-slate-900">
                    Total Amount
                  </span>
                  <span className="text-2xl font-black text-indigo-600">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleRazorpayCheckout(navigate)}
                disabled={isCheckingOut}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-indigo-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCheckingOut ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Initiating Checkout...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    <span>Checkout with Razorpay</span>
                  </>
                )}
              </button>

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-500">
                  <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                  <span>
                    Secured by official Razorpay SDK with PostgreSQL price validation
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-500">
                  <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
                  <span>
                    Signature verified on FastAPI before order confirmation
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
