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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SellItemModal from "../components/SellItemModal";

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

  const fetchMyListings = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://127.0.0.1:8000/my-listings", {
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
        `http://127.0.0.1:8000/products/${deleteCandidate.id}`,
        {
          headers: getAuthHeaders(),
        }
      );
      setListings((prev) => prev.filter((p) => p.id !== deleteCandidate.id));
      setSuccessMessage("Listing deleted successfully!");
      setDeleteCandidate(null);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      alert(
        err.response?.data?.detail || "Failed to delete listing. Please try again."
      );
    } finally {
      setDeleting(false);
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
            Ready to turn your unused items into cash? Post your first product in seconds!
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
                      <span className="bg-emerald-600 text-white font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                        AVAILABLE
                      </span>
                    )}

                    {item.condition === "Brand New" ? (
                      <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <span>✨</span>
                        <span>Brand New</span>
                      </span>
                    ) : (
                      item.condition && (
                        <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                          {item.condition}
                        </span>
                      )
                    )}
                  </div>

                  {isSold && (
                    <div className="absolute inset-0 z-10 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-rose-600 text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg border border-rose-400/30">
                        SOLD OUT
                      </span>
                    </div>
                  )}

                  <img
                    src={`http://127.0.0.1:8000/uploads/${item.image}`}
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
                      <span className="text-xl font-black text-indigo-600">
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/edit-product/${item.id}`)}
                        disabled={isSold}
                        title={isSold ? "Sold items cannot be edited" : "Edit listing"}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                          isSold
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                            : "bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border-slate-200 hover:border-indigo-300 cursor-pointer"
                        }`}
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
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
              Are you sure you want to delete <span className="font-bold text-slate-700">"{deleteCandidate.title}"</span>? This action cannot be undone.
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
    </div>
  );
}
