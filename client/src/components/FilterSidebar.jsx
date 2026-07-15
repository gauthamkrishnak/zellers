import { useState, useEffect } from "react";
import axios from "axios";
import {
  Filter,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Sparkles,
  MapPin,
  Tag,
  DollarSign,
  Layers,
  SlidersHorizontal,
} from "lucide-react";
import { CATEGORIES } from "../constants/brands";

export default function FilterSidebar({
  filters,
  onChange,
  onReset,
  isMobile = false,
  onCloseMobile,
}) {
  const [availableBrands, setAvailableBrands] = useState([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);

  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    price: true,
    location: true,
    condition: true,
    deals: true,
    availability: true,
    sort: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Fetch dynamic brands whenever category changes
  useEffect(() => {
    let isMounted = true;
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const res = await axios.get("http://127.0.0.1:8000/filters/brands", {
          params: { category: filters.category !== "All" ? filters.category : undefined },
        });
        if (isMounted) {
          setAvailableBrands(res.data || []);
        }
      } catch (err) {
        console.error("Error fetching filter brands:", err);
      } finally {
        if (isMounted) setLoadingBrands(false);
      }
    };

    fetchBrands();
    return () => {
      isMounted = false;
    };
  }, [filters.category]);

  const handleCategorySelect = (cat) => {
    onChange({
      ...filters,
      category: cat,
      brands: [], // reset brand selection when category changes
    });
  };

  const handleBrandToggle = (brandName) => {
    const currentBrands = filters.brands || [];
    const newBrands = currentBrands.includes(brandName)
      ? currentBrands.filter((b) => b !== brandName)
      : [...currentBrands, brandName];
    onChange({ ...filters, brands: newBrands });
  };

  const handleConditionToggle = (cond) => {
    const currentConditions = filters.conditions || [];
    const newConditions = currentConditions.includes(cond)
      ? currentConditions.filter((c) => c !== cond)
      : [...currentConditions, cond];
    onChange({ ...filters, conditions: newConditions });
  };

  const handlePricePreset = (min, max) => {
    onChange({
      ...filters,
      minPrice: min !== null ? min : "",
      maxPrice: max !== null ? max : "",
    });
  };

  const handleLocationPreset = (city) => {
    onChange({
      ...filters,
      location: filters.location === city ? "" : city,
    });
  };

  // Filter brands based on search text inside brand section
  const filteredBrandsList = availableBrands.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase())
  );
  const displayedBrands = showAllBrands
    ? filteredBrandsList
    : filteredBrandsList.slice(0, 6);

  const QUICK_CITIES = [
    "Kochi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Mumbai",
    "Pune",
  ];
  const CONDITIONS = ["Brand New", "Like New", "Good", "Fair", "Excellent"];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col w-full text-slate-800 transition-all duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-base tracking-tight">
              Filter Listings
            </h3>
            <p className="text-[11px] text-slate-300 font-medium">
              Refine products by exact criteria
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition active:scale-95 cursor-pointer"
          title="Reset all filters"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)] sm:max-h-[82vh] custom-scrollbar">
        {/* 1. Category Section */}
        <div className="border-b border-slate-100 pb-5">
          <button
            onClick={() => toggleSection("category")}
            className="flex items-center justify-between w-full text-left font-bold text-sm text-slate-800 mb-3 hover:text-indigo-600 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-indigo-600" />
              <span>Category</span>
            </div>
            {openSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.category && (
            <div className="flex flex-wrap gap-1.5 pt-1 animate-fadeIn">
              <button
                onClick={() => handleCategorySelect("All")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  filters.category === "All"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    filters.category === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Brand Section (Dynamic based on selected Category) */}
        <div className="border-b border-slate-100 pb-5">
          <button
            onClick={() => toggleSection("brand")}
            className="flex items-center justify-between w-full text-left font-bold text-sm text-slate-800 mb-3 hover:text-indigo-600 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-indigo-600" />
              <span>Brand ({filters.category !== "All" ? filters.category : "All"})</span>
            </div>
            {openSections.brand ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.brand && (
            <div className="space-y-3 pt-1 animate-fadeIn">
              {availableBrands.length > 6 && (
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search brands..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              )}

              {loadingBrands ? (
                <div className="py-4 text-center text-xs font-semibold text-slate-400 animate-pulse">
                  Loading brands...
                </div>
              ) : displayedBrands.length === 0 ? (
                <p className="text-xs text-slate-400 font-medium italic py-2">
                  No specific brands listed yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {displayedBrands.map((brandName) => {
                    const isChecked = (filters.brands || []).includes(brandName);
                    return (
                      <label
                        key={brandName}
                        onClick={() => handleBrandToggle(brandName)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer select-none border ${
                          isChecked
                            ? "bg-indigo-50/80 border-indigo-200 text-indigo-900"
                            : "bg-white hover:bg-slate-50 border-transparent text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div
                            className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                              isChecked
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "bg-white border-slate-300"
                            }`}
                          >
                            {isChecked && <Check size={11} strokeWidth={3} />}
                          </div>
                          <span className="truncate">{brandName}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {filteredBrandsList.length > 6 && (
                <button
                  onClick={() => setShowAllBrands(!showAllBrands)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer block mt-1"
                >
                  {showAllBrands
                    ? "Show Less"
                    : `+ Show ${filteredBrandsList.length - 6} More Brands`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. Price Range Section */}
        <div className="border-b border-slate-100 pb-5">
          <button
            onClick={() => toggleSection("price")}
            className="flex items-center justify-between w-full text-left font-bold text-sm text-slate-800 mb-3 hover:text-indigo-600 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-indigo-600" />
              <span>Price Range (₹)</span>
            </div>
            {openSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.price && (
            <div className="space-y-3 pt-1 animate-fadeIn">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="₹ Min"
                    value={filters.minPrice}
                    onChange={(e) =>
                      onChange({ ...filters, minPrice: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="₹ Max"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      onChange({ ...filters, maxPrice: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Quick Preset Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  onClick={() => handlePricePreset(0, 5000)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-[11px] font-bold transition cursor-pointer"
                >
                  Under ₹5K
                </button>
                <button
                  onClick={() => handlePricePreset(5000, 20000)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-[11px] font-bold transition cursor-pointer"
                >
                  ₹5K - ₹20K
                </button>
                <button
                  onClick={() => handlePricePreset(20000, 50000)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-[11px] font-bold transition cursor-pointer"
                >
                  ₹20K - ₹50K
                </button>
                <button
                  onClick={() => handlePricePreset(50000, null)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-[11px] font-bold transition cursor-pointer"
                >
                  ₹50K+
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. Location Section */}
        <div className="border-b border-slate-100 pb-5">
          <button
            onClick={() => toggleSection("location")}
            className="flex items-center justify-between w-full text-left font-bold text-sm text-slate-800 mb-3 hover:text-indigo-600 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-indigo-600" />
              <span>Location</span>
            </div>
            {openSections.location ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.location && (
            <div className="space-y-3 pt-1 animate-fadeIn">
              <div className="relative">
                <MapPin
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Enter city or area..."
                  value={filters.location || ""}
                  onChange={(e) =>
                    onChange({ ...filters, location: e.target.value })
                  }
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleLocationPreset(city)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      (filters.location || "").toLowerCase() === city.toLowerCase()
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. Product Condition Section */}
        <div className="border-b border-slate-100 pb-5">
          <button
            onClick={() => toggleSection("condition")}
            className="flex items-center justify-between w-full text-left font-bold text-sm text-slate-800 mb-3 hover:text-indigo-600 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Check size={16} className="text-indigo-600" />
              <span>Condition</span>
            </div>
            {openSections.condition ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.condition && (
            <div className="space-y-2 pt-1 animate-fadeIn">
              {CONDITIONS.map((cond) => {
                const isChecked = (filters.conditions || []).includes(cond);
                return (
                  <label
                    key={cond}
                    onClick={() => handleConditionToggle(cond)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer select-none border ${
                      isChecked
                        ? "bg-indigo-50/80 border-indigo-200 text-indigo-900"
                        : "bg-white hover:bg-slate-50 border-transparent text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                          isChecked
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-white border-slate-300"
                        }`}
                      >
                        {isChecked && <Check size={11} strokeWidth={3} />}
                      </div>
                      <span>{cond}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. Deals & Discounts */}
        <div className="border-b border-slate-100 pb-5">
          <label className="flex items-center justify-between px-3 py-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 cursor-pointer select-none transition hover:bg-amber-100/50">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500 text-white">
                <Sparkles size={15} />
              </div>
              <div>
                <span className="font-bold text-xs text-amber-950 block">
                  Attractive Deals
                </span>
                <span className="text-[10px] text-amber-800 font-medium">
                  Show best value items
                </span>
              </div>
            </div>

            <input
              type="checkbox"
              checked={filters.dealsOnly || false}
              onChange={(e) =>
                onChange({ ...filters, dealsOnly: e.target.checked })
              }
              className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
            />
          </label>
        </div>

        {/* 7. Availability */}
        <div className="border-b border-slate-100 pb-5">
          <button
            onClick={() => toggleSection("availability")}
            className="flex items-center justify-between w-full text-left font-bold text-sm text-slate-800 mb-3 hover:text-indigo-600 transition cursor-pointer"
          >
            <span>Availability</span>
            {openSections.availability ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.availability && (
            <div className="space-y-2 pt-1 animate-fadeIn">
              {[
                { label: "Available Only", val: "available" },
                { label: "Include Sold Items", val: "all" },
                { label: "Sold Out Only", val: "sold" },
              ].map((opt) => (
                <label
                  key={opt.val}
                  onClick={() => onChange({ ...filters, availability: opt.val })}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer select-none border ${
                    filters.availability === opt.val
                      ? "bg-indigo-50 border-indigo-200 text-indigo-900"
                      : "bg-white hover:bg-slate-50 border-transparent text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="availability"
                    checked={filters.availability === opt.val}
                    onChange={() => {}}
                    className="w-3.5 h-3.5 accent-indigo-600 cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 8. Sort Options */}
        <div className="pb-2">
          <label className="block font-bold text-sm text-slate-800 mb-2">
            Sort Order
          </label>
          <select
            value={filters.sort || "newest"}
            onChange={(e) => onChange({ ...filters, sort: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Mobile drawer footer */}
      {isMobile && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 mt-auto flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={onCloseMobile}
            className="flex-[2] py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20 active:scale-98 cursor-pointer"
          >
            Show Results
          </button>
        </div>
      )}
    </div>
  );
}
