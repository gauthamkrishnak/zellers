import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  Home,
  ShieldCheck,
  Receipt,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
          headers: getAuthHeaders(),
        });
        setOrder(res.data);
      } catch (err) {
        setError("Could not load full order details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, getAuthHeaders]);

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-10 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm animate-bounce">
            <CheckCircle2 size={44} className="stroke-[2.5]" />
          </div>
          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider rounded-full mb-2">
            Payment Verified & Confirmed
          </span>
          <h1 className="text-3xl font-black text-slate-900">
            Order Placed Successfully!
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            Your Razorpay payment signature was verified by FastAPI and your order has been recorded in PostgreSQL.
          </p>
        </div>

        {orderId && (
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-5 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200/70 text-sm">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-indigo-600" />
                <span className="font-bold text-slate-700">Order ID:</span>
                <span className="font-mono text-indigo-600 font-bold">#{orderId}</span>
              </div>
              {order?.razorpay_order_id && (
                <span className="text-xs font-mono text-slate-500">
                  Razorpay: {order.razorpay_order_id}
                </span>
              )}
            </div>

            {loading ? (
              <div className="py-6 flex items-center justify-center gap-2 text-slate-400 text-sm">
                <Loader2 size={18} className="animate-spin text-indigo-600" />
                <span>Loading purchased items...</span>
              </div>
            ) : order && order.items ? (
              <div className="pt-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Purchased Items ({order.items.length})
                </p>
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-xl shadow-xs text-sm"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Package size={16} className="text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">
                        {item.title}
                      </span>
                    </div>
                    <span className="font-extrabold text-indigo-600 shrink-0 ml-4">
                      ₹{item.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 font-extrabold text-base text-slate-900">
                  <span>Total Paid</span>
                  <span className="text-emerald-600">
                    ₹{order.total_amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex-1 py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home size={18} />
            <span>Continue Shopping</span>
          </button>
          <button
            onClick={() => navigate("/account")}
            className="flex-1 py-3.5 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View Account</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
