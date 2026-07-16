import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, SlidersHorizontal, RotateCcw } from "lucide-react";
import FilterSidebar from "./FilterSidebar";

export default function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onChange,
  onReset,
}) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate active filters count
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end lg:hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Slide-in Drawer Container */}
      <div className="relative z-10 w-full sm:w-[400px] bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft">
        {/* Top Header Bar */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-800 tracking-tight">
                  Filters & Sort
                </h3>
                {activeCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                    {activeCount} active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Refine listings to match your needs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition cursor-pointer"
            title="Close Drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Body (No nested scrollbars) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
          <FilterSidebar
            filters={filters}
            onChange={onChange}
            onReset={onReset}
            isMobile={true}
            onCloseMobile={onClose}
          />
        </div>

        {/* Sticky Bottom Footer */}
        <div className="p-4 border-t border-slate-100 bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.03)] shrink-0 flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <RotateCcw size={14} />
            <span>Reset All</span>
          </button>
          <button
            onClick={onClose}
            className="flex-[2] py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/25 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Show Results</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
