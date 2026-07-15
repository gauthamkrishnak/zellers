import { useState, useEffect, useRef } from "react";
import Hero from "../components/hero";
import Productcard from "../components/productcard";
import FilterSidebar from "../components/FilterSidebar";
import FilterDrawer from "../components/FilterDrawer";
import Loader from "../components/Loader";
import { useOutletContext } from "react-router-dom";
import { Search, Filter, X, RotateCcw, SlidersHorizontal, Sparkles, TrendingDown } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { searchTerm } = useOutletContext();
  const { getAuthHeaders } = useAuth();

  const [filters, setFilters] = useState({
    category: "All",
    brands: [],
    location: "",
    conditions: [],
    minPrice: "",
    maxPrice: "",
    availability: "available",
    dealsOnly: false,
    sort: "newest",
  });

  const [products, setProducts] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isFirstRender = useRef(true);

  const fetchProducts = async () => {
    const minimumLoaderTime = 600;
    const startTime = Date.now();
    setIsLoading(true);

    try {
      const response = await axios.get("http://127.0.0.1:8000/products/", {
        params: {
          category: filters.category !== "All" ? filters.category : undefined,
          search: debouncedSearch || undefined,
          brand: filters.brands?.length ? filters.brands.join(",") : undefined,
          location: filters.location || undefined,
          condition: filters.conditions?.length ? filters.conditions.join(",") : undefined,
          min_price: filters.minPrice !== "" ? Number(filters.minPrice) : undefined,
          max_price: filters.maxPrice !== "" ? Number(filters.maxPrice) : undefined,
          availability: filters.availability !== "available" ? filters.availability : undefined,
          deals_only: filters.dealsOnly ? true : undefined,
          sort: filters.sort !== "newest" ? filters.sort : undefined,
        },
        headers: getAuthHeaders(),
      });

      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumLoaderTime - elapsedTime);

      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) return;
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
    fetchProducts();
  }, [filters, debouncedSearch]);

  const handleResetAll = () => {
    setFilters({
      category: "All",
      brands: [],
      location: "",
      conditions: [],
      minPrice: "",
      maxPrice: "",
      availability: "available",
      dealsOnly: false,
      sort: "newest",
    });
  };

  const removeBrand = (brandToRemove) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.filter((b) => b !== brandToRemove),
    }));
  };

  const removeCondition = (condToRemove) => {
    setFilters((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((c) => c !== condToRemove),
    }));
  };

  // Count active filter chips (excluding category All and sort newest)
  const activeFiltersCount = [
    filters.category !== "All" ? 1 : 0,
    (filters.brands || []).length,
    filters.location ? 1 : 0,
    (filters.conditions || []).length,
    filters.minPrice || filters.maxPrice ? 1 : 0,
    filters.availability !== "available" ? 1 : 0,
    filters.dealsOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-8 pb-16">
      <Hero />

      <div
        id="featured-products-section"
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 scroll-mt-24"
      >
        {/* Desktop Permanent Left Sidebar */}
        <aside className="hidden lg:block w-80 shrink-0 sticky top-24 self-start">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={handleResetAll}
          />
        </aside>

        {/* Tablet & Mobile Slide-In Filter Drawer */}
        <FilterDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          filters={filters}
          onChange={setFilters}
          onReset={handleResetAll}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header & Mobile/Tablet Filter Toggle Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/70 pb-4 mb-5 gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
                <span>
                  {filters.category === "All"
                    ? "Explore Products"
                    : `${filters.category} Listings`}
                </span>
                {filters.dealsOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <TrendingDown size={13} className="text-emerald-600 shrink-0" /> Deals
                  </span>
                )}
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Showing {products.length} {products.length === 1 ? "item" : "items"} available right now
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Mobile/Tablet Filter Toggle Button */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition cursor-pointer"
              >
                <SlidersHorizontal size={15} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-white text-indigo-700 font-extrabold text-[11px] flex items-center justify-center shadow-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active Filter Chips Section */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60 animate-fadeIn">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1.5">
                <Filter size={13} className="text-indigo-600" /> Active:
              </span>

              {filters.category !== "All" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-100 text-indigo-900 font-bold text-xs shadow-2xs">
                  Category: {filters.category}
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, category: "All", brands: [] }))}
                    className="hover:bg-indigo-200/80 rounded-full p-0.5 transition cursor-pointer"
                    title="Remove category"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}

              {(filters.brands || []).map((brandName) => (
                <span
                  key={brandName}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-800 font-bold text-xs shadow-2xs"
                >
                  Brand: {brandName}
                  <button
                    onClick={() => removeBrand(brandName)}
                    className="hover:bg-indigo-200/80 rounded-full p-0.5 transition cursor-pointer"
                    title="Remove brand"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}

              {filters.location && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs shadow-2xs">
                  Location: {filters.location}
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, location: "" }))}
                    className="hover:bg-emerald-200/80 rounded-full p-0.5 transition cursor-pointer"
                    title="Remove location"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}

              {(filters.conditions || []).map((cond) => (
                <span
                  key={cond}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 font-bold text-xs shadow-2xs"
                >
                  {cond}
                  <button
                    onClick={() => removeCondition(cond)}
                    className="hover:bg-purple-200/80 rounded-full p-0.5 transition cursor-pointer"
                    title="Remove condition"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}

              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs shadow-2xs">
                  Price: {filters.minPrice ? `₹${filters.minPrice}` : "₹0"} - {filters.maxPrice ? `₹${filters.maxPrice}` : "Max"}
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, minPrice: "", maxPrice: "" }))}
                    className="hover:bg-amber-200/80 rounded-full p-0.5 transition cursor-pointer"
                    title="Remove price range"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}

              {filters.dealsOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold text-xs">
                  <TrendingDown size={13} className="text-emerald-600 shrink-0" />
                  <span>Attractive Deals</span>
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, dealsOnly: false }))}
                    className="hover:bg-emerald-100 rounded-full p-0.5 transition cursor-pointer text-emerald-600 ml-1"
                    title="Remove deals filter"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}

              {filters.availability !== "available" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs shadow-2xs capitalize">
                  {filters.availability === "all" ? "Include Sold" : "Sold Only"}
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, availability: "available" }))}
                    className="hover:bg-slate-300 rounded-full p-0.5 transition cursor-pointer"
                    title="Reset availability"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetAll}
                className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Clear All</span>
              </button>
            </div>
          )}

          {/* Loader or Empty State or Products Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200/50">
              <Loader height={50} width={6} />
              <p className="text-slate-400 text-sm mt-3 font-medium">
                {isSearching ? "Searching listings..." : "Applying filters..."}
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/50 px-6 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-5 shadow-sm">
                <Search size={28} />
              </div>

              <h3 className="text-lg font-bold text-slate-800">
                No listings found
              </h3>

              <p className="text-slate-500 text-sm max-w-sm mt-2">
                We couldn't find any products matching your exact filter combination. Try clearing some chips or resetting your search.
              </p>

              <button
                onClick={handleResetAll}
                className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <RotateCcw size={15} />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-fadeIn">
              {products.map((product) => (
                <Productcard key={product.id} {...product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Home;
