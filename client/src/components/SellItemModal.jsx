import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Upload,
  ImageIcon,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Trash2,
  ShieldCheck,
  ThumbsUp,
  Tag,
  Wrench,
  AlertTriangle,
  Megaphone,
  Sparkles,
  Trophy,
  Eye,
  Clock,
  Zap,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import { CATEGORIES, getBrandsForCategory } from "../constants/brands";
export { CATEGORIES } from "../constants/brands";

export const CONDITIONS = [
  {
    id: "Brand New",
    title: "Brand New",
    icon: <ShieldCheck size={20} className="text-blue-600" />,
    desc: "Unused product in original packaging.",
    examples: [
      "Sealed iPhone",
      "Unopened Headphones",
      "New Gaming Mouse",
      "Brand New Shoes",
    ],
  },
  {
    id: "Like New",
    title: "Like New",
    icon: <CheckCircle2 size={20} className="text-indigo-600" />,
    desc: "Used very little. Looks almost new. No visible scratches or damage.",
    examples: [
      "Laptop used for one week",
      "Camera used twice",
      "Tablet with no scratches",
      "Monitor in perfect condition",
    ],
  },
  {
    id: "Excellent",
    title: "Excellent",
    icon: <ThumbsUp size={20} className="text-emerald-600" />,
    desc: "Minor cosmetic wear. Works perfectly.",
    examples: [
      "Phone with tiny scratches",
      "Keyboard used for a few months",
      "Office Chair in excellent condition",
      "Graphics Card used for gaming",
    ],
  },
  {
    id: "Good",
    title: "Good",
    icon: <Tag size={20} className="text-amber-600" />,
    desc: "Visible signs of use. Fully functional.",
    examples: [
      "Bicycle with paint scratches",
      "Study Table with minor dents",
      "Sofa with slight wear",
      "Television used for several years",
    ],
  },
  {
    id: "Fair",
    title: "Fair",
    icon: <Wrench size={20} className="text-orange-600" />,
    desc: "Heavy cosmetic wear. Still usable.",
    examples: [
      "Laptop with cracked body",
      "Mobile with noticeable scratches",
      "Chair with faded fabric",
      "Washing Machine with cosmetic damage",
    ],
  },
  {
    id: "For Parts / Repair",
    title: "For Parts / Repair",
    icon: <AlertTriangle size={20} className="text-rose-600" />,
    desc: "Not fully functional. Needs repair.",
    examples: [
      "Phone with broken display",
      "Laptop that doesn't boot",
      "GPU requiring repair",
      "Printer with hardware issues",
    ],
  },
];

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  if (bytes < k) return `${bytes} B`;
  if (bytes < k * k) return `${(bytes / k).toFixed(1)} KB`;
  return `${(bytes / (k * k)).toFixed(2)} MB`;
};

export default function SellItemModal({ isOpen, onClose, onSuccess }) {
  const { token } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    price: "",
    type: "",
    brand: "",
    customBrand: "",
    location: "",
    condition: "Excellent",
    desc: "",
  });

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setForm((prev) => ({
      ...prev,
      type: newCat,
      brand: "",
      customBrand: "",
    }));
  };
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [boostOnCreate, setBoostOnCreate] = useState(false);
  const [boosting, setBoosting] = useState(false);
  const [showBoostInfoModal, setShowBoostInfoModal] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validateAndSetImage = (file) => {
    if (!file) return;

    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const isValidExt = ALLOWED_EXTENSIONS.includes(ext);
    const isValidType = ALLOWED_TYPES.includes(file.type);

    if (!isValidExt && !isValidType) {
      setError(
        "Invalid image format. Only JPG, JPEG, PNG, and WEBP images are accepted."
      );
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("Image size exceeds maximum limit of 5 MB.");
      return;
    }

    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    validateAndSetImage(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!loading) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (loading) return;
    const file = e.dataTransfer.files[0];
    validateAndSetImage(file);
  };

  const resetForm = () => {
    setForm({
      title: "",
      price: "",
      type: "",
      brand: "",
      customBrand: "",
      location: "",
      condition: "Excellent",
      desc: "",
    });
    setImage(null);
    setPreview(null);
    setError("");
    setSuccess(false);
    setIsDragging(false);
    setBoostOnCreate(false);
    setBoosting(false);
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!image) {
      setError("Please upload an image.");
      return;
    }
    if (!form.type) {
      setError("Please select a category.");
      return;
    }
    if (!form.brand) {
      setError("Please select a brand.");
      return;
    }
    if (form.brand === "Other" && !form.customBrand?.trim()) {
      setError("Please enter a custom brand name.");
      return;
    }

    setError("");
    setLoading(true);

    const fullDesc = `[Condition: ${form.condition}]\n\n${form.desc}`;
    const data = new FormData();
    data.append("title", form.title);
    data.append("price", form.price);
    data.append("type", form.type);
    const finalBrand = form.brand === "Other" ? form.customBrand.trim() : form.brand;
    data.append("brand", finalBrand);
    data.append("location", form.location);
    data.append("desc", fullDesc);
    data.append("image", image);

    try {
      const response = await axios.post("http://127.0.0.1:8000/products/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT manually set Content-Type: multipart/form-data so the browser includes boundary
        },
      });

      if (boostOnCreate && response.data?.id) {
        setBoosting(true);
        try {
          const initRes = await axios.post(
            `http://127.0.0.1:8000/products/${response.data.id}/boost/initiate`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const options = {
            key: initRes.data.key,
            amount: initRes.data.amount,
            currency: initRes.data.currency,
            name: "Zellers Marketplace",
            description: `Boost Listing: ${form.title}`,
            order_id: initRes.data.razorpay_order_id,
            handler: async function (paymentResponse) {
              try {
                const verifyRes = await axios.post(
                  `http://127.0.0.1:8000/products/${response.data.id}/boost/verify`,
                  {
                    razorpay_order_id: paymentResponse.razorpay_order_id,
                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                    razorpay_signature: paymentResponse.razorpay_signature,
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccess(true);
                setTimeout(() => {
                  handleClose();
                  onSuccess?.(verifyRes.data.product || response.data);
                }, 1500);
              } catch (verErr) {
                setError(verErr.response?.data?.detail || "Boost verification failed, but item was listed.");
                setTimeout(() => {
                  handleClose();
                  onSuccess?.(response.data);
                }, 2500);
              }
            },
            modal: {
              ondismiss: function () {
                setError("Boost payment cancelled. Your item was listed without boost.");
                setTimeout(() => {
                  handleClose();
                  onSuccess?.(response.data);
                }, 2000);
              },
            },
            theme: { color: "#4F46E5" },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
          return;
        } catch (boostErr) {
          setError("Item listed, but failed to start boost: " + (boostErr.response?.data?.detail || boostErr.message));
          setTimeout(() => {
            handleClose();
            onSuccess?.(response.data);
          }, 2500);
          return;
        } finally {
          setBoosting(false);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onSuccess?.(response.data);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to post item. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden z-10 border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4.5 border-b border-slate-100 bg-white z-10 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Post an Item
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Fill in the details to list your item on Zellers
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 rounded-full transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1">
          {success ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-6 gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center animate-bounce">
                <CheckCircle2 size={36} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800">
                Item Listed Successfully!
              </h3>
              <p className="text-slate-500 text-sm text-center max-w-xs">
                Your item has been published to the Zellers marketplace.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="px-5 sm:px-6 py-5 flex flex-col gap-5"
            >
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200/80 text-red-600 text-sm font-medium rounded-xl">
                  {error}
                </div>
              )}

              {/* Drag & Drop Image Upload Area */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  Product Image *
                </label>
                <div
                  onClick={() => !loading && fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl h-52 flex flex-col items-center justify-center gap-2 transition-all overflow-hidden ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-50/70 scale-[0.99]"
                      : "border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/30"
                  } ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {preview ? (
                    <div className="absolute inset-0 w-full h-full flex flex-col justify-between p-3 bg-slate-900/10">
                      <img
                        src={preview}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-contain bg-slate-100"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent p-3 pt-8 flex items-center justify-between text-white">
                        <div className="truncate pr-2">
                          <p className="text-xs font-semibold truncate">
                            {image?.name}
                          </p>
                          <p className="text-[11px] text-slate-300">
                            {formatFileSize(image?.size)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <ImageIcon size={24} className="text-indigo-600" />
                      </div>
                      <div className="text-center px-4">
                        <p className="text-sm font-bold text-slate-700">
                          Click to upload or drag & drop
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          JPG, JPEG, PNG, WEBP (Max 5 MB)
                        </p>
                      </div>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={loading}
                    onChange={handleImageChange}
                  />
                </div>

                {/* Remove & Replace Controls */}
                {preview && !loading && (
                  <div className="flex items-center gap-4 mt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                    >
                      <RefreshCw size={13} /> Replace Image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setPreview(null);
                        setError("");
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition cursor-pointer"
                    >
                      <Trash2 size={13} /> Remove Image
                    </button>
                  </div>
                )}
              </div>

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
                  disabled={loading}
                  placeholder="e.g. iPhone 13 Pro, IKEA Dining Table..."
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all disabled:bg-slate-100"
                />
              </div>

              {/* Price + Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Price (₹) *
                  </label>
                  <input
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    type="number"
                    min="0"
                    placeholder="0"
                    className="px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all disabled:bg-slate-100"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Category *
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleCategoryChange}
                    required
                    disabled={loading}
                    className="px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-white cursor-pointer disabled:bg-slate-100"
                  >
                    <option value="">Select Category...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Brand Section (Appears immediately below Category) */}
              {form.type && (
                <div className="flex flex-col gap-1.5 animate-fadeIn">
                  <label className="text-sm font-semibold text-slate-700">
                    {form.type === "Books" ? "Publisher *" : "Brand *"}
                  </label>
                  <select
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-white cursor-pointer disabled:bg-slate-100"
                  >
                    <option value="">
                      {form.type === "Books" ? "Select Publisher..." : "Select Brand..."}
                    </option>
                    {getBrandsForCategory(form.type).map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    <option value="Other">Other (Custom {form.type === "Books" ? "Publisher" : "Brand"})</option>
                  </select>

                  {form.brand === "Other" && (
                    <input
                      name="customBrand"
                      value={form.customBrand}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder={form.type === "Books" ? "Enter custom publisher name..." : "Enter custom brand name..."}
                      className="mt-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all disabled:bg-slate-100"
                    />
                  )}
                </div>
              )}

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
                  disabled={loading}
                  placeholder="e.g. Kakkanad, Edapally, MG Road..."
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all disabled:bg-slate-100"
                />
              </div>

              {/* Product Condition Section */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">
                    Product Condition *
                  </label>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    Selected: {form.condition}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CONDITIONS.map((cond) => {
                    const isSelected = form.condition === cond.id;
                    return (
                      <div
                        key={cond.id}
                        onClick={() => {
                          if (!loading) {
                            setForm((prev) => ({ ...prev, condition: cond.id }));
                          }
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-500/20 scale-[1.02]"
                            : "border-slate-200 hover:border-slate-300 bg-white hover:-translate-y-0.5 hover:shadow-sm"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xl" role="img" aria-label={cond.title}>
                              {cond.icon}
                            </span>
                            {isSelected && (
                              <CheckCircle2
                                size={18}
                                className="text-indigo-600 shrink-0"
                              />
                            )}
                          </div>
                          <h4
                            className={`font-extrabold text-sm ${
                              isSelected ? "text-indigo-900" : "text-slate-800"
                            }`}
                          >
                            {cond.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {cond.desc}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100/80">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Examples:
                          </span>
                          <ul className="space-y-0.5">
                            {cond.examples.map((ex) => (
                              <li
                                key={ex}
                                className="text-[11px] text-slate-600 leading-tight"
                              >
                                • {ex}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-slate-500 mt-0.5">
                  Choose the condition that best matches your product. This helps buyers know what to expect and improves trust.
                </p>
              </div>

              {/* Description + Character Counter */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">
                    Description *
                  </label>
                  <span className="text-xs text-slate-400 font-medium">
                    {form.desc.length}/1000 characters
                  </span>
                </div>
                <textarea
                  name="desc"
                  value={form.desc}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  maxLength={1000}
                  rows={3}
                  placeholder="Describe your item — condition, features, reason for selling..."
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none disabled:bg-slate-100"
                />
              </div>

              {/* Boost Listing Optional Checkbox Section */}
              <div
                onClick={() => !loading && !boosting && setBoostOnCreate(!boostOnCreate)}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${
                  boostOnCreate
                    ? "border-amber-500 bg-amber-50/60 shadow-md ring-2 ring-amber-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-gradient-to-r from-amber-50/30 to-white hover:shadow-sm"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={boostOnCreate}
                    onChange={() => {}}
                    disabled={loading || boosting}
                    className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                      <Megaphone size={16} className="text-amber-600 shrink-0" />
                      <span>Boost Your Listing (Sponsored)</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowBoostInfoModal(true);
                        }}
                        className="text-xs font-extrabold text-amber-700 hover:text-amber-900 underline transition-colors cursor-pointer"
                      >
                        How it works
                      </button>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        ₹199 / 30 Days (1 Month)
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Get up to 5x more views! Your product will be highlighted with a gold badge and appear first at the top of search results and category pages.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || boosting}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed mt-1"
              >
                {boosting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Opening payment gateway for boost...</span>
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Publishing listing...</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    <span>{boostOnCreate ? "Post & Boost (₹199)" : "Post Item"}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Boost Info Modal inside SellItemModal */}
          {showBoostInfoModal && (
            <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col justify-between max-h-[90vh]"
              >
                {/* Header banner */}
                <div className="relative bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-500 p-6 text-slate-950 overflow-hidden shrink-0">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950/15 backdrop-blur-md flex items-center justify-center text-slate-950 shadow-inner">
                        <Megaphone size={24} className="animate-bounce" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-950 text-amber-400 px-2.5 py-0.5 rounded-full shadow-xs">
                          Sponsored Plan
                        </span>
                        <h3 className="text-xl font-black text-slate-950 mt-1 leading-tight">
                          How Boosting Works
                        </h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBoostInfoModal(false)}
                      className="w-8 h-8 rounded-full bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 overflow-y-auto">
                  {/* Price & Duration Highlight Box */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-center">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 block">
                        Total Price
                      </span>
                      <span className="text-2xl font-black text-slate-900 mt-1 block">
                        ₹199
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        One-time payment
                      </span>
                    </div>
                    <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 text-center">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 block">
                        Duration
                      </span>
                      <span className="text-2xl font-black text-slate-900 mt-1 block">
                        30 Days
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        1 Full Month
                      </span>
                    </div>
                  </div>

                  {/* Benefits breakdown */}
                  <div className="space-y-3 pt-1 border-t border-slate-100">
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      What You Get:
                    </h5>
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Trophy size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            #1 Top Priority Placement
                          </p>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            Appears first on homepage recommendations, category feeds, and relevant search results.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Gold Sponsored Badge
                          </p>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            Highlighted with a distinct verified Sponsored label that builds trust and captures attention.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Eye size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Up to 5x More Buyer Inquiries
                          </p>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            Boosted items receive 500% more views, helping your item sell significantly faster.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Clock size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Guaranteed 30-Day Coverage
                          </p>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            Remains active 24/7 for a whole month until{" "}
                            <span className="font-semibold text-slate-700">
                              {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>. No recurring charges.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowBoostInfoModal(false)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    Got It
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
