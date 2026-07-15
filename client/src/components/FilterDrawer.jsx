import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Filter } from "lucide-react";
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end lg:hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Slide-in Drawer Container */}
      <div className="relative z-10 w-full sm:w-96 bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft">
        {/* Top close bar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-base">
            <Filter size={18} />
            <span>Filters</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto">
          <FilterSidebar
            filters={filters}
            onChange={onChange}
            onReset={onReset}
            isMobile={true}
            onCloseMobile={onClose}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
