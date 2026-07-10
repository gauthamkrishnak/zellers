import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Upload, ImageIcon, CheckCircle2, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  "Mobiles",
  "Electronics",
  "Vehicles",
  "Furniture",
  "Fashion",
  "Books",
  "Sports",
  "Home Appliances",
  "Others",
];

export default function SellItemModal({ isOpen, onClose, onSuccess }) {
  const { token } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    price: "",
    type: "",
    location: "",
    desc: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm({ title: "", price: "", type: "", location: "", desc: "" });
    setImage(null);
    setPreview(null);
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError("Please upload an image.");
      return;
    }
    if (!form.type) {
      setError("Please select a category.");
      return;
    }

    setError("");
    setLoading(true);

    const data = new FormData();
    data.append("title", form.title);
    data.append("price", form.price);
    data.append("type", form.type);
    data.append("location", form.location);
    data.append("desc", form.desc);
    data.append("image", image);

    try {
      await axios.post("http://127.0.0.1:8000/products/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to post item. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Post an Item</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Fill in the details to list your item
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Item Listed!</h3>
            <p className="text-slate-500 text-sm text-center">
              Your item has been posted to the marketplace successfully.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="px-6 py-5 flex flex-col gap-5"
          >
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            {/* Image Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl h-44 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-50 hover:bg-indigo-50/30 overflow-hidden"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <ImageIcon size={22} className="text-indigo-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">
                    Click or drag to upload image
                  </p>
                  <p className="text-xs text-slate-400">
                    JPG, PNG, WEBP — max 5MB
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            {preview && (
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                }}
                className="text-xs text-red-500 hover:text-red-700 font-medium -mt-3 self-start cursor-pointer"
              >
                Remove image
              </button>
            )}

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. iPhone 13 Pro, IKEA Table..."
                className="px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
              />
            </div>

            {/* Price + Category row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Price (₹) *
                </label>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  type="number"
                  min="0"
                  placeholder="0"
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Category *
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all bg-white appearance-none cursor-pointer"
                >
                  <option value="">Select...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Location *
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                placeholder="e.g. Kakkanad, Edapally, MG Road..."
                className="px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Description *
              </label>
              <textarea
                name="desc"
                value={form.desc}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Describe your item — condition, features, reason for selling..."
                className="px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader height={50} width={6} /> Posting...
                </>
              ) : (
                <>
                  <Upload size={18} /> Post Item
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
