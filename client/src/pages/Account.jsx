import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  ShieldCheck,
  Key,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  Info,
  Package,
  Receipt,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileAndOrders = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const [response, ordersRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios
            .get("http://127.0.0.1:8000/orders/", {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => ({ data: [] })),
        ]);
        setProfile(response.data);
        setOrders(ordersRes.data || []);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          logout();
          navigate("/login");
        } else {
          setError("Failed to load profile details.");
        }

      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndOrders();
  }, [navigate, logout]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <h3 className="font-bold text-lg text-slate-800">
            Loading Account Details...
          </h3>
          <p className="text-xs text-slate-500">
            Verifying JWT token and securely fetching profile from PostgreSQL
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center">
          <p className="text-red-600 font-bold mb-4">{error || "User not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const initials = (profile.username || profile.name || "U")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Navigation & Title */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-4 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-md"
          >
            <ArrowLeft size={16} /> Back to Store
          </button>
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            Verified Account
          </span>
        </div>

        {/* Profile Card Header */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl border-4 border-white/10 shrink-0">
              {initials}
            </div>

            {/* Main Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  {profile.username || profile.name}
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 self-center sm:self-auto">
                  <CheckCircle2 size={13} /> Active
                </span>
              </div>

              <p className="text-slate-400 text-sm mb-6 flex items-center justify-center sm:justify-start gap-2">
                <Mail size={15} className="text-indigo-400" />
                {profile.email}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/70 border border-slate-700/60 rounded-xl p-3.5 flex items-center gap-3">
                  <User size={18} className="text-indigo-400 shrink-0" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      User Handle
                    </p>
                    <p className="text-sm font-semibold text-slate-100 truncate">
                      @{profile.username || profile.name}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/70 border border-slate-700/60 rounded-xl p-3.5 flex items-center gap-3">
                  <Key size={18} className="text-violet-400 shrink-0" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-slate-400">
                      Account ID
                    </p>
                    <p className="text-sm font-semibold text-slate-100">
                      #{profile.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & JWT Notice Box */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 mb-8 backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                Secure JWT & Profile Authentication
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your authentication token includes safe identifying claims (such as{" "}
                <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300">
                  sub
                </code>{" "}
                for email and{" "}
                <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300">
                  user_id
                </code>
                ). <strong className="text-white">Note on JWT Security:</strong>{" "}
                JWT payloads are base64-encoded for transmission but{" "}
                <em>not encrypted</em>. Therefore, safe non-sensitive profile fields
                can be included in the token payload, but passwords or confidential
                secrets are strictly excluded. Furthermore, this profile page
                dynamically verifies your token via our reusable{" "}
                <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300">
                  get_current_user
                </code>{" "}
                backend dependency and retrieves your latest live details directly
                from PostgreSQL.
              </p>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-3xl p-6 sm:p-8 mb-8 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
              <Receipt className="text-indigo-400" size={24} />
              Your Order History
            </h2>
            <span className="text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">
              {orders.length} {orders.length === 1 ? "Order" : "Orders"}
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-8 text-slate-400 border border-dashed border-slate-700 rounded-2xl">
              <ShoppingBag className="mx-auto mb-2 text-slate-500" size={32} />
              <p className="text-sm font-semibold">No past orders found.</p>
              <p className="text-xs text-slate-500 mt-1">
                Your completed Razorpay checkouts will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-extrabold text-white">
                        Order #{o.id}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        {o.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Razorpay ID: <code className="text-slate-300">{o.razorpay_order_id}</code>
                    </p>
                    <div className="mt-2 space-y-1">
                      {o.items?.map((it) => (
                        <div key={it.id} className="text-xs text-slate-300 flex items-center gap-2">
                          <Package size={13} className="text-indigo-400" />
                          <span>{it.title}</span>
                          <span className="text-slate-500">— ₹{it.price.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                    <span className="text-xs text-slate-400">Total Amount</span>
                    <span className="text-lg font-black text-indigo-400">
                      ₹{o.total_amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/my-listings")}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              <Package size={16} /> Manage My Listings
            </button>

            <button
              onClick={() => navigate("/my-purchases")}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-lg shadow-violet-600/20"
            >
              <ShoppingBag size={16} /> My Purchases
            </button>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="flex items-center gap-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer"
          >
            <LogOut size={16} /> Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
}
