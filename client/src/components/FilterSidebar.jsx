import { useState, useEffect } from "react";
import axios from "axios";
import {
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
import { CATEGORIES, CATEGORY_ITEMS } from "../constants/brands";

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
          params: {
            category: filters.category !== "All" ? filters.category : undefined,
          },
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

  const filteredBrandsList = availableBrands.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase()),
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

  // Calculate active filters count for desktop header badge
  const activeCount = [
    filters.category !== "All",
    (filters.brands || []).length > 0,
    (filters.conditions || []).length > 0,
    filters.minPrice !== "" && filters.minPrice !== null,
    filters.maxPrice !== "" && filters.maxPrice !== null,
    filters.location !== "" && filters.location !== null,
    filters.dealsOnly === true,
    filters.availability !== "available",
    filters.sort !== "newest",
  ].filter(Boolean).length;

  const contentSections = (
    <div className="space-y-6 text-slate-800">
      {/* 1. Category Section */}
      <div className="border-b border-slate-100 pb-5">
        <button
          onClick={() => toggleSection("category")}
          className="flex items-center justify-between w-full text-left font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 hover:text-indigo-600 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-indigo-600" />
            <span>Category</span>
          </div>
          {openSections.category ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>

        {openSections.category && (
          <div className="grid grid-cols-2 gap-2 pt-1.5 animate-fadeIn">
            {CATEGORY_ITEMS.map((item) => {
              const Icon = item.icon;
              const isSelected = filters.category === item.name;
              const isAll = item.name === "All";

              return (
                <button
                  key={item.name}
                  onClick={() => handleCategorySelect(item.name)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border text-left ${
                    isAll ? "col-span-2 justify-center" : ""
                  } ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                      : "bg-slate-50 hover:bg-slate-100/80 text-slate-700 border-slate-200/80 hover:border-indigo-300"
                  }`}
                >
                  <Icon
                    size={15}
                    className={`shrink-0 ${
                      isSelected ? "text-white" : "text-indigo-600"
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Brand Section */}
      <div className="border-b border-slate-100 pb-5">
        <button
          onClick={() => toggleSection("brand")}
          className="flex items-center justify-between w-full text-left font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 hover:text-indigo-600 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Tag size={15} className="text-indigo-600" />
            <span>
              Brand ({filters.category !== "All" ? filters.category : "All"})
            </span>
          </div>
          {openSections.brand ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>

        {openSections.brand && (
          <div className="space-y-3 pt-1">
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
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
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
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {displayedBrands.map((brandName) => {
                  const isChecked = (filters.brands || []).includes(brandName);
                  return (
                    <label
                      key={brandName}
                      onClick={() => handleBrandToggle(brandName)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer select-none border ${
                        isChecked
                          ? "bg-indigo-50 border-indigo-200 text-indigo-950"
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
          className="flex items-center justify-between w-full text-left font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 hover:text-indigo-600 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <DollarSign size={15} className="text-indigo-600" />
            <span>Price Range (₹)</span>
          </div>
          {openSections.price ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>

        {openSections.price && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="₹ Min"
                  value={filters.minPrice || ""}
                  onChange={(e) =>
                    onChange({ ...filters, minPrice: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 transition"
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
                  value={filters.maxPrice || ""}
                  onChange={(e) =>
                    onChange({ ...filters, maxPrice: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 transition"
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
          className="flex items-center justify-between w-full text-left font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 hover:text-indigo-600 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-indigo-600" />
            <span>Location</span>
          </div>
          {openSections.location ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>

        {openSections.location && (
          <div className="space-y-3 pt-1">
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
                className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => handleLocationPreset(city)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    (filters.location || "").toLowerCase() ===
                    city.toLowerCase()
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
          className="flex items-center justify-between w-full text-left font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 hover:text-indigo-600 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Check size={15} className="text-indigo-600" />
            <span>Condition</span>
          </div>
          {openSections.condition ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>

        {openSections.condition && (
          <div className="space-y-1.5 pt-1">
            {CONDITIONS.map((cond) => {
              const isChecked = (filters.conditions || []).includes(cond);
              return (
                <label
                  key={cond}
                  onClick={() => handleConditionToggle(cond)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer select-none border ${
                    isChecked
                      ? "bg-indigo-50 border-indigo-200 text-indigo-950"
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
        <label className="flex items-center justify-between px-3.5 py-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 cursor-pointer select-none transition hover:bg-amber-100/50">
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
          className="flex items-center justify-between w-full text-left font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 hover:text-indigo-600 transition cursor-pointer"
        >
          <span>Availability</span>
          {openSections.availability ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>

        {openSections.availability && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { label: "Available Only", val: "available" },
              { label: "Sold Out Only", val: "sold" },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() =>
                  onChange({ ...filters, availability: opt.val })
                }
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer border text-center ${
                  filters.availability === opt.val
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 border-transparent text-slate-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 8. Sort Options */}
      <div className="pb-2">
        <label className="block font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
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
  );

  // If rendered inside mobile drawer, just return the content sections (no extra header/footer/card wrapper)
  if (isMobile) {
    return contentSections;
  }

  // Render full desktop card wrapper with proper max-height to avoid overflow clipping
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col w-full transition-all duration-300">
      {/* Desktop Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base tracking-tight">
                Filter Listings
              </h3>
              {activeCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                  {activeCount}
                </span>
              )}
            </div>
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

      <div className="p-5 overflow-y-auto max-h-[calc(100vh-180px)] custom-scrollbar">
        {contentSections}
      </div>
    </div>
  );
}
