import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  TrendingDown,
  Info,
  Filter,
  X,
  ArrowUpDown,
  Box,
} from "lucide-react";
import { CATEGORIES, CATEGORY_ITEMS } from "../constants/brands";
import { CONDITIONS as SELL_CONDITIONS } from "./SellItemModal";

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

  const [hoveredCondition, setHoveredCondition] = useState(null);
  const [tooltipCoords, setTooltipCoords] = useState({ top: 0, left: 0 });

  const handleMouseEnterCondition = (e, condObj) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipWidth = 288; // 18rem
    const tooltipHeight = 220;

    let left = rect.right + 14;
    let top = rect.top;

    if (left + tooltipWidth > window.innerWidth - 16) {
      if (rect.left - tooltipWidth - 14 > 16) {
        left = rect.left - tooltipWidth - 14;
      } else {
        left = Math.max(
          16,
          Math.min(rect.left, window.innerWidth - tooltipWidth - 16),
        );
        top = rect.top - tooltipHeight - 10;
        if (top < 16) {
          top = rect.bottom + 10;
        }
      }
    }

    if (top + tooltipHeight > window.innerHeight - 16) {
      top = Math.max(16, window.innerHeight - tooltipHeight - 16);
    }

    setTooltipCoords({ top, left });
    setHoveredCondition(condObj);
  };

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
    <div className="divide-y divide-slate-100 text-slate-800">
      {/* 1. Sort Order (Prominently Placed at Top of Filters) */}
      <div className="pb-5">
        <button
          onClick={() => toggleSection("sort")}
          className="flex items-center justify-between w-full text-left py-2 group transition cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center transition">
              <ArrowUpDown size={14} />
            </div>
            <span className="font-extrabold text-xs text-slate-800 group-hover:text-indigo-600 tracking-tight">
              Sort Listings By
            </span>
          </div>
          {openSections.sort ? (
            <ChevronUp
              size={15}
              className="text-slate-400 group-hover:text-indigo-600 transition"
            />
          ) : (
            <ChevronDown
              size={15}
              className="text-slate-400 group-hover:text-indigo-600 transition"
            />
          )}
        </button>

        {openSections.sort && (
          <div className="pt-2 animate-fadeIn">
            <select
              value={filters.sort || "newest"}
              onChange={(e) => onChange({ ...filters, sort: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200/80 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer shadow-2xs"
            >
              <option value="newest">⚡ Newest Listings First</option>
              <option value="price_asc">💵 Price: Low to High</option>
              <option value="price_desc">💎 Price: High to Low</option>
            </select>
          </div>
        )}
      </div>

      {/* 7. Deals & Discounts Card */}
      <div className="py-5">
        <div
          onClick={() => onChange({ ...filters, dealsOnly: !filters.dealsOnly })}
          role="checkbox"
          aria-checked={filters.dealsOnly || false}
          className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 cursor-pointer select-none transition hover:border-emerald-300 shadow-2xs group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs group-hover:scale-105 transition-transform">
              <TrendingDown size={15} />
            </div>
            <div>
              <span className="font-extrabold text-xs text-emerald-950 block tracking-tight">
                Attractive Deals Only
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                Highlight verified price reductions
              </span>
            </div>
          </div>

          <div
            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
              filters.dealsOnly
                ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs"
                : "bg-white border-emerald-300 group-hover:border-emerald-400"
            }`}
          >
            {filters.dealsOnly && <Check size={12} strokeWidth={3} />}
          </div>
        </div>
      </div>

      {/* 2. Category Section */}
      <div className="py-5">
        <button
          onClick={() => toggleSection("category")}
          className="flex items-center justify-between w-full text-left pb-2 group transition cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center transition">
              <Layers size={14} />
            </div>
            <span className="font-extrabold text-xs text-slate-800 group-hover:text-indigo-600 tracking-tight">
              Category
            </span>
          </div>
          <div className="flex items-center gap-2">
            {filters.category !== "All" && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-extrabold text-[10px]">
                {filters.category}
              </span>
            )}
            {openSections.category ? (
              <ChevronUp
                size={15}
                className="text-slate-400 group-hover:text-indigo-600 transition"
              />
            ) : (
              <ChevronDown
                size={15}
                className="text-slate-400 group-hover:text-indigo-600 transition"
              />
            )}
          </div>
        </button>

        {openSections.category && (
          <div className="grid grid-cols-2 gap-2 pt-2 animate-fadeIn">
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
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 hover:border-indigo-300"
                  }`}
                >
                  <Icon
                    size={14}
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

      {/* 3. Price Range Section */}
      <div className="py-5">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full text-left pb-2 group transition cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center transition">
              <DollarSign size={14} />
            </div>
            <span className="font-extrabold text-xs text-slate-800 group-hover:text-indigo-600 tracking-tight">
              Price Range
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(filters.minPrice || filters.maxPrice) && (
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
            )}
            {openSections.price ? (
              <ChevronUp
                size={15}
                className="text-slate-400 group-hover:text-indigo-600 transition"
              />
            ) : (
              <ChevronDown
                size={15}
                className="text-slate-400 group-hover:text-indigo-600 transition"
              />
            )}
          </div>
        </button>

        {openSections.price && (
          <div className="space-y-3 pt-2 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Min Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={filters.minPrice || ""}
                    onChange={(e) =>
                      onChange({ ...filters, minPrice: e.target.value })
                    }
                    className="w-full pl-7 pr-3 py-2 bg-slate-50/80 rounded-xl border border-slate-200 text-xs text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Max Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Any"
                    value={filters.maxPrice || ""}
                    onChange={(e) =>
                      onChange({ ...filters, maxPrice: e.target.value })
                    }
                    className="w-full pl-7 pr-3 py-2 bg-slate-50/80 rounded-xl border border-slate-200 text-xs text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Quick Preset Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: "Under ₹5K", min: 0, max: 5000 },
                { label: "₹5K - ₹20K", min: 5000, max: 20000 },
                { label: "₹20K - ₹50K", min: 20000, max: 50000 },
                { label: "₹50K+", min: 50000, max: null },
              ].map((preset, idx) => {
                const isActive =
                  filters.minPrice ===
                    (preset.min !== null ? preset.min : "") &&
                  filters.maxPrice === (preset.max !== null ? preset.max : "");
                return (
                  <button
                    key={idx}
                    onClick={() => handlePricePreset(preset.min, preset.max)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                        : "bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border-slate-200/80 hover:border-indigo-200"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Brand Section */}
      <div className="py-5">
        <button
          onClick={() => toggleSection("brand")}
          className="flex items-center justify-between w-full text-left pb-2 group transition cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center transition">
              <Tag size={14} />
            </div>
            <span className="font-extrabold text-xs text-slate-800 group-hover:text-indigo-600 tracking-tight">
              Brand ({filters.category !== "All" ? filters.category : "All"})
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(filters.brands || []).length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px]">
                {(filters.brands || []).length}
              </span>
            )}
            {openSections.brand ? (
              <ChevronUp
                size={15}
                className="text-slate-400 group-hover:text-indigo-600 transition"
              />
            ) : (
              <ChevronDown
                size={15}
                className="text-slate-400 group-hover:text-indigo-600 transition"
              />
            )}
          </div>
        </button>

        {openSections.brand && (
          <div className="space-y-3 pt-2 animate-fadeIn">
            {availableBrands.length > 6 && (
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Filter brands..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50/80 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
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
                    <div
                      key={brandName}
                      onClick={() => handleBrandToggle(brandName)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer select-none border ${
                        isChecked
                          ? "bg-indigo-50 border-indigo-200 text-indigo-950 shadow-2xs"
                          : "bg-white hover:bg-slate-50 border-transparent text-slate-700 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border transition shrink-0 ${
                            isChecked
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "bg-white border-slate-300"
                          }`}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>
                        <span className="truncate">{brandName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredBrandsList.length > 6 && (
              <button
                onClick={() => setShowAllBrands(!showAllBrands)}
                className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 transition cursor-pointer block mt-1"
              >
                {showAllBrands
                  ? "← Show Less"
                  : `+ Show ${filteredBrandsList.length - 6} More Brands`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 5. Product Condition Section */}
      <div className="py-5">
        <button
          onClick={() => toggleSection("condition")}
          className="flex items-center justify-between w-full text-left pb-2 group transition cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center transition">
              <Box size={14} />
            </div>
            <span className="font-extrabold text-xs text-slate-800 group-hover:text-indigo-600 tracking-tight">
              Item Condition
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(filters.conditions || []).length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px]">
                {(filters.conditions || []).length}
              </span>
            )}
            {openSections.condition ? (
              <ChevronUp
                size={15}
                className="text-slate-400 group-hover:text-indigo-600 transition"
              />
            ) : (
              <ChevronDown
                size={15}
                className="text-slate-400 group-hover:text-indigo-600 transition"
              />
            )}
          </div>
        </button>

        {openSections.condition && (
          <div className="space-y-1.5 pt-2 animate-fadeIn">
            {SELL_CONDITIONS.map((condObj) => {
              const isChecked = (filters.conditions || []).includes(condObj.id);
              return (
                <div
                  key={condObj.id}
                  onMouseEnter={(e) => handleMouseEnterCondition(e, condObj)}
                  onMouseLeave={() => setHoveredCondition(null)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer select-none border group/cond relative ${
                    isChecked
                      ? "bg-indigo-50 border-indigo-200 text-indigo-950 shadow-2xs"
                      : "bg-white hover:bg-slate-50/80 border-transparent text-slate-700 hover:border-slate-200"
                  }`}
                  onClick={() => handleConditionToggle(condObj.id)}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border transition shrink-0 ${
                        isChecked
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-white border-slate-300 group-hover/cond:border-indigo-400"
                      }`}
                    >
                      {isChecked && <Check size={11} strokeWidth={3} />}
                    </div>
                    <span className="truncate flex items-center gap-1.5">
                      {condObj.title}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hoveredCondition?.id === condObj.id) {
                        setHoveredCondition(null);
                      } else {
                        handleMouseEnterCondition(e, condObj);
                      }
                    }}
                    className="p-1 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-indigo-600 transition shrink-0 ml-1"
                    title="View condition details & examples"
                  >
                    <Info size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Location Section */}
      <div className="py-5">
        <button
          onClick={() => toggleSection("location")}
          className="flex items-center justify-between w-full text-left pb-2 group transition cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center transition">
              <MapPin size={14} />
            </div>
            <span className="font-extrabold text-xs text-slate-800 group-hover:text-indigo-600 tracking-tight">
              Location
            </span>
          </div>
          <div className="flex items-center gap-2">
            {filters.location && (
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
            )}
            {openSections.location ? (
              <ChevronUp
                size={15}
                className="text-slate-400 group-hover:text-indigo-600 transition"
              />
            ) : (
              <ChevronDown
                size={15}
                className="text-slate-400 group-hover:text-indigo-600 transition"
              />
            )}
          </div>
        </button>

        {openSections.location && (
          <div className="space-y-3 pt-2 animate-fadeIn">
            <div className="relative">
              <MapPin
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Enter city or area..."
                value={filters.location || ""}
                onChange={(e) =>
                  onChange({ ...filters, location: e.target.value })
                }
                className="w-full pl-8 pr-3 py-2 bg-slate-50/80 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_CITIES.map((city) => {
                const isActive =
                  (filters.location || "").toLowerCase() === city.toLowerCase();
                return (
                  <button
                    key={city}
                    onClick={() => handleLocationPreset(city)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer border ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                        : "bg-white hover:bg-indigo-50 hover:text-indigo-600 border-slate-200/80 hover:border-indigo-200 text-slate-600"
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 8. Availability Segmented Control */}
      <div className="py-5">
        <button
          onClick={() => toggleSection("availability")}
          className="flex items-center justify-between w-full text-left pb-2 group transition cursor-pointer select-none"
        >
          <span className="font-extrabold text-xs text-slate-800 group-hover:text-indigo-600 tracking-tight">
            Item Availability
          </span>
          {openSections.availability ? (
            <ChevronUp
              size={15}
              className="text-slate-400 group-hover:text-indigo-600 transition"
            />
          ) : (
            <ChevronDown
              size={15}
              className="text-slate-400 group-hover:text-indigo-600 transition"
            />
          )}
        </button>

        {openSections.availability && (
          <div className="pt-2 animate-fadeIn">
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 border border-slate-200/60">
              {[
                { label: "Available Only", val: "available" },
                { label: "Sold Out Only", val: "sold" },
              ].map((opt) => {
                const isSelected = filters.availability === opt.val;
                return (
                  <button
                    key={opt.val}
                    onClick={() =>
                      onChange({ ...filters, availability: opt.val })
                    }
                    className={`flex-1 py-2 px-3 rounded-xl text-xs transition cursor-pointer text-center ${
                      isSelected
                        ? "bg-white text-indigo-700 shadow-xs font-extrabold"
                        : "text-slate-600 hover:text-slate-900 font-bold"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const conditionTooltipPortal =
    hoveredCondition &&
    createPortal(
      <div
        style={{
          top: `${tooltipCoords.top}px`,
          left: `${tooltipCoords.left}px`,
        }}
        className="fixed z-[999999] w-72 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 animate-fadeIn pointer-events-none"
      >
        <div className="flex items-center justify-between mb-2 border-b border-slate-700/60 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center scale-90 shrink-0">
              {hoveredCondition.icon}
            </span>
            <h4 className="font-extrabold text-sm text-white">
              {hoveredCondition.title}
            </h4>
          </div>
          <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Condition
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-medium mb-3">
          {hoveredCondition.desc}
        </p>
        <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 block mb-1.5">
            Products that fall in this condition:
          </span>
          <ul className="space-y-1 text-[11px] text-slate-300">
            {(hoveredCondition.examples || []).map((ex, idx) => (
              <li key={idx} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="truncate font-medium text-slate-200">
                  {ex}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>,
      document.body,
    );

  // If rendered inside mobile drawer, just return the content sections + portal
  if (isMobile) {
    return (
      <>
        {contentSections}
        {conditionTooltipPortal}
      </>
    );
  }

  // Render full desktop card wrapper with clean professional white/indigo theme + portal
  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-100 overflow-hidden flex flex-col w-full transition-all duration-300">
        {/* Desktop Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur-md shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-2xs">
              <SlidersHorizontal size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-slate-800 tracking-tight">
                  Filters & Sorting
                </h3>
                {activeCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black tracking-wide shadow-2xs animate-fadeIn">
                    {activeCount}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Refine listings by criteria
              </p>
            </div>
          </div>

          <button
            onClick={onReset}
            disabled={activeCount === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeCount > 0
                ? "bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 hover:border-rose-200 border border-transparent cursor-pointer shadow-2xs"
                : "bg-slate-50 text-slate-300 border border-transparent cursor-not-allowed opacity-60"
            }`}
            title="Reset all filters"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
          {contentSections}
        </div>
      </div>
      {conditionTooltipPortal}
    </>
  );
}
