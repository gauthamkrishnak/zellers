import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Upload,
  ImageIcon,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Save,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES, CONDITIONS } from "../components/SellItemModal";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthHeaders, isAuthenticated, user } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    price: "",
    type: "",
    location: "",
    condition: "Excellent",
    desc: "",
  });

  const [existingImage, setExistingImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [permissionError, setPermissionError] = useState(false);
  const [isSold, setIsSold] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchProduct();
  }, [id, isAuthenticated]);

  const fetchProduct = async () => {
    setLoadingInitial(true);
    setError("");
    setPermissionError(false);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/products/${id}`, {
        headers: getAuthHeaders(),
      });
      const prod = res.data;

      // Ownership check
      if (
        prod.user_id &&
        user?.id &&
        Number(prod.user_id) !== Number(user.id)
      ) {
        setPermissionError(true);
        setLoadingInitial(false);
        return;
      }

      setIsSold(Boolean(prod.is_sold || prod.status === "sold"));
      setForm({
        title: prod.title || "",
        price: prod.price || "",
        type: prod.type || prod.category || "Others",
        location: prod.location || "",
        condition: prod.condition || "Excellent",
        desc: prod.desc || "",
      });
      setExistingImage(prod.image || "");
    } catch (err) {
      if (err.response?.status === 403) {
        setPermissionError(true);
      } else {
        setError("Could not load listing details. It may have been removed.");
      }
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validateAndSetImage = (file) => {
    if (!file) return;
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid image format. Only JPG, JPEG, PNG, or WEBP accepted.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("Image size exceeds maximum limit of 5 MB.");
      return;
    }
    setError("");
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    validateAndSetImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || isSold || permissionError) return;

    if (!form.title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (Number(form.price) < 0) {
      setError("Price cannot be negative.");
      return;
    }

    setSaving(true);
    setError("");

    const fullDesc = `[Condition: ${form.condition}]\n\n${form.desc}`;
    const data = new FormData();
    data.append("title", form.title);
    data.append("price", form.price);
    data.append("type", form.type);
    data.append("location", form.location);
    data.append("condition", form.condition);
    data.append("desc", fullDesc);

    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      await axios.put(`http://127.0.0.1:8000/products/${id}`, data, {
        headers: getAuthHeaders(),
      });
      navigate("/my-listings");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to update listing. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <Loader2 size={36} className="animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-semibold text-sm">
          Loading listing details...
        </p>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-6">
          <ShieldAlert size={36} />
        </div>
        <h1 className="text-2xl font-black text-slate-800">
          Access Denied
        </h1>
        <p className="text-slate-500 text-sm mt-2 mb-8">
          You do not have permission to edit this listing because it belongs to another seller.
        </p>
        <button
          onClick={() => navigate("/my-listings")}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg cursor-pointer"
        >
          Back to My Listings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/70 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/my-listings")}
            className="group p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all duration-200 border-none bg-transparent cursor-pointer"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-0.5 transition-transform duration-200"
            />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Edit Listing
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Update details, price, condition, or photos for your product
            </p>
          </div>
        </div>
      </div>

      {isSold && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-center gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0" />
          <span className="text-sm font-semibold">
            This item is already SOLD OUT and cannot be modified.
          </span>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-4">
            1. Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                disabled={isSold || saving}
                required
                placeholder="e.g. Sony PlayStation 5 Disc Edition (850GB)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                disabled={isSold || saving}
                required
                min="0"
                placeholder="e.g. 35000"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                disabled={isSold || saving}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm font-medium text-slate-800 outline-none transition disabled:bg-slate-50 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                disabled={isSold || saving}
                required
                placeholder="e.g. Indiranagar, Bangalore"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Condition Section */}
        <div className="bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-4">
            2. Product Condition
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {CONDITIONS.map((c) => {
              const isSelected = form.condition === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={isSold || saving}
                  onClick={() => setForm((prev) => ({ ...prev, condition: c.id }))}
                  className={`relative p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-600/20"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl">{c.icon}</span>
                      {isSelected && (
                        <CheckCircle2 size={16} className="text-indigo-600" />
                      )}
                    </div>
                    <p
                      className={`font-bold text-sm ${
                        isSelected ? "text-indigo-900" : "text-slate-800"
                      }`}
                    >
                      {c.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-4">
            3. Detailed Description
          </h2>

          <textarea
            name="desc"
            rows={5}
            value={form.desc}
            onChange={handleChange}
            disabled={isSold || saving}
            required
            placeholder="Describe features, accessories included, age of item, reason for selling..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition disabled:bg-slate-50"
          />
        </div>

        {/* Image Section */}
        <div className="bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-4">
            4. Product Photo
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Current/Preview Image */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200 h-64">
              {preview ? (
                <img
                  src={preview}
                  alt="New preview"
                  className="max-h-full max-w-full object-contain rounded-xl"
                />
              ) : existingImage ? (
                <img
                  src={`http://127.0.0.1:8000/uploads/${existingImage}`}
                  alt="Current image"
                  className="max-h-full max-w-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-slate-400 text-center">
                  <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No image uploaded</p>
                </div>
              )}
            </div>

            {/* Upload New Image */}
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Replace Photo (Optional)
              </p>
              <div
                onClick={() => !isSold && !saving && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${
                  isSold
                    ? "border-slate-200 bg-slate-50 cursor-not-allowed"
                    : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30"
                }`}
              >
                <Upload size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-700">
                  Click to choose a new image
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  JPG, JPEG, PNG, WEBP up to 5MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/*"
                  onChange={handleImageChange}
                  disabled={isSold || saving}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate("/my-listings")}
            className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 cursor-pointer transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSold || saving}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition ${
              isSold
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 active:scale-95 cursor-pointer"
            }`}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
