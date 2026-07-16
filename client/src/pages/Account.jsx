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
  Package,
  Receipt,
  ShoppingBag,
  Heart,
  Plus,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Award,
  Calendar,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedOrderId, setCopiedOrderId] = useState(null);

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

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex items-center justify-center pt-20 px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <h3 className="font-bold text-lg text-slate-800">
            Loading Account Dashboard...
          </h3>
          <p className="text-xs text-slate-500">
            Securely retrieving your profile and recent Zellers transactions
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex items-center justify-center pt-20 px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center">
          <p className="text-rose-600 font-bold mb-4">{error || "User not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-600/20"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const displayName = profile.username || profile.name || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
        {/* Top Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold text-sm transition-colors cursor-pointer self-start"
          >
            <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs group-hover:border-indigo-200 transition-colors">
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span>Back to Store</span>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              Verified Member
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold shadow-2xs">
              <Award size={13} className="text-indigo-600 shrink-0" />
              Zellers Pro
            </span>
          </div>
        </div>

        {/* Hero Profile Banner Card */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-500/15 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-48 h-48 bg-purple-400/15 rounded-full blur-xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white text-indigo-700 flex items-center justify-center text-3xl sm:text-4xl font-black shadow-2xl border-4 border-white/20 shrink-0">
              {initials}
            </div>

            {/* Profile Info & Stats */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2.5 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      {displayName}
                    </h1>
                    <span className="p-1 rounded-full bg-white/20 text-white backdrop-blur-md" title="Verified Account">
                      <Sparkles size={16} />
                    </span>
                  </div>
                  <p className="text-indigo-100 text-sm font-medium flex items-center justify-center md:justify-start gap-2">
                    <Mail size={15} className="text-indigo-200" />
                    {profile.email}
                  </p>
                </div>

                {/* Quick Action Button right inside header */}
                <button
                  onClick={() => navigate("/my-listings")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition active:scale-95 cursor-pointer self-center md:self-auto"
                >
                  <Plus size={15} /> Post New Listing
                </button>
              </div>

              {/* Badges / Account Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-white/15">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 mb-0.5">
                    User Handle
                  </p>
                  <p className="text-sm font-extrabold text-white truncate">
                    @{displayName}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 mb-0.5">
                    Account ID
                  </p>
                  <p className="text-sm font-extrabold text-white">
                    #{profile.id}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 col-span-2 sm:col-span-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 mb-0.5">
                    Total Orders
                  </p>
                  <p className="text-sm font-extrabold text-white">
                    {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto">
          {[
            { id: "overview", label: "Dashboard Overview", icon: User },
            { id: "orders", label: `Order History (${orders.length})`, icon: Receipt },
            { id: "security", label: "Security & Privacy", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/70"
                }`}
              >
                <Icon size={15} className={isActive ? "text-white" : "text-indigo-600"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
              Quick Management & Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Card 1: My Listings */}
              <div
                onClick={() => navigate("/my-listings")}
                className="group bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Package size={24} />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-800 group-hover:text-indigo-600 transition-colors">
                    My Listings
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    View, edit, boost, or remove items you have posted for sale on Zellers.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mt-6 pt-4 border-t border-slate-100">
                  <span>Manage Listings</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2: My Purchases */}
              <div
                onClick={() => navigate("/my-purchases")}
                className="group bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-violet-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                    <ShoppingBag size={24} />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-800 group-hover:text-violet-600 transition-colors">
                    My Purchases
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Access receipts, track status, and view past Razorpay transactions.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-violet-600 mt-6 pt-4 border-t border-slate-100">
                  <span>View Orders</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 3: Saved Wishlist */}
              <div
                onClick={() => navigate("/wishlist")}
                className="group bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-pink-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                    <Heart size={24} />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-800 group-hover:text-pink-600 transition-colors">
                    My Wishlist
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Check out products you bookmarked for later or monitor attractive deals.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-pink-600 mt-6 pt-4 border-t border-slate-100">
                  <span>Open Wishlist</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Recent Orders Preview Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                  <Receipt size={18} className="text-indigo-600" />
                  Recent Order Snapshot
                </h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  View All Orders →
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-semibold text-slate-600">No completed transactions yet.</p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 2).map((o) => (
                    <div
                      key={o.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-800">Order #{o.id}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                            {o.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {o.items?.length || 0} {(o.items?.length || 0) === 1 ? "item" : "items"} • Razorpay ID: <code className="font-mono text-slate-700">{o.razorpay_order_id}</code>
                        </p>
                      </div>
                      <span className="font-black text-sm sm:text-base text-indigo-600">
                        ₹{o.total_amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content 2: Order History */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm animate-fadeIn">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <Receipt className="text-indigo-600" size={22} />
                  Your Zellers Order History
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Full summary of your completed Razorpay checkouts and item receipts
                </p>
              </div>
              <span className="px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 bg-slate-50/80 border border-dashed border-slate-200 rounded-3xl">
                <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-extrabold text-base text-slate-800">No Orders Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Your past completed transactions and item receipts will automatically appear here once you make a purchase.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Explore Zellers Store
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-2xs transition-all flex flex-col gap-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-black text-slate-800">
                          Order #{o.id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                          {o.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Razorpay ID:</span>
                        <code className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono text-slate-700">
                          {o.razorpay_order_id}
                        </code>
                        <button
                          onClick={() => handleCopy(o.razorpay_order_id, o.id)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                          title="Copy Razorpay Order ID"
                        >
                          {copiedOrderId === o.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Items Purchased:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {o.items?.map((it) => (
                          <div
                            key={it.id}
                            className="bg-white p-3 rounded-xl border border-slate-200/60 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Package size={14} className="text-indigo-600 shrink-0" />
                              <span className="font-semibold text-slate-800 truncate">{it.title}</span>
                            </div>
                            <span className="font-bold text-slate-600 shrink-0">
                              ₹{it.price.toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-xs font-bold text-slate-500">Total Order Amount</span>
                      <span className="text-lg font-black text-indigo-600">
                        ₹{o.total_amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: Security & Privacy */}
        {activeTab === "security" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="text-indigo-600" size={22} />
                Account Security & Protection
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                We use strict authentication procedures and encrypted sessions to safeguard your data.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 size={20} />
                </div>
                <h4 className="font-extrabold text-sm text-slate-800">Verified Email Status</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your email address ({profile.email}) is confirmed and bound to your Zellers token.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Lock size={20} />
                </div>
                <h4 className="font-extrabold text-sm text-slate-800">Token Authentication</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your active session is signed via JWT standards without storing sensitive secrets locally.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                  <Key size={20} />
                </div>
                <h4 className="font-extrabold text-sm text-slate-800">Live DB Sync</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Profile credentials are verified directly against our live PostgreSQL database on every request.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3.5">
              <ShieldCheck size={20} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-indigo-950">Privacy & Data Integrity</h4>
                <p className="text-xs text-indigo-900/80 mt-1 leading-relaxed">
                  Zellers never shares your personal contact credentials with third parties. Buyers and sellers communicate safely through our marketplace platform, and all Razorpay payments are processed via PCI-DSS compliant secure gateways.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-800">Signed in as {displayName}</p>
              <p className="text-xs text-slate-500">Need to switch accounts or end your session?</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100/80 text-rose-600 border border-rose-200 font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-2xs"
          >
            <LogOut size={16} /> Sign Out of Zellers
          </button>
        </div>
      </div>
    </div>
  );
}
