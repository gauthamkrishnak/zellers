import React from "react";
import { UserCheck, Star, Package, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function SellerInfo({ product }) {
  const { user: currentUser } = useAuth();

  // Determine display seller name
  const isOwnListing =
    currentUser &&
    product?.seller_id &&
    Number(currentUser.id) === Number(product.seller_id);

  const rawSellerName = product?.seller_name || "Admin";
  const displaySellerName = isOwnListing ? "You" : rawSellerName;

  // Future-ready structured props/defaults so new features can be added without redesigning
  const sellerRating = product?.seller_rating || "4.9";
  const isVerified = product?.is_verified_seller !== false;
  const memberSince = product?.member_since || "Oct 2023";
  const totalListings = product?.total_listings || "12";
  const responseRate = product?.response_rate || "98%";

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <span>Seller Information</span>
        </h3>
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
          Sold by {displaySellerName}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
          {displaySellerName === "You"
            ? "Y"
            : displaySellerName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-extrabold text-slate-800 text-base truncate flex items-center gap-1.5">
              <span>Sold by</span>
              <span className="inline-flex items-center gap-1 text-indigo-600">
                👤 {displaySellerName}
              </span>
            </p>
            {isVerified && (
              <UserCheck
                size={16}
                className="text-emerald-500 shrink-0"
                title="Verified Seller"
              />
            )}
          </div>

          <p className="text-slate-400 text-xs font-medium mt-1">
            Member since {memberSince}
          </p>
        </div>
      </div>

      {/* Structured Stats Grid ready for Seller Rating, Total Listings, and Response Rate */}
      <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
            <Star size={13} className="fill-amber-500" />
            <span>{sellerRating}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Rating
          </span>
        </div>

        <div className="flex flex-col items-center border-x border-slate-200/60 px-2">
          <div className="flex items-center gap-1 text-slate-700 font-bold text-xs">
            <Package size={13} className="text-indigo-500" />
            <span>{totalListings}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Listings
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
            <MessageSquare size={13} className="text-emerald-500" />
            <span>{responseRate}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Response
          </span>
        </div>
      </div>

      <button
        onClick={() => {
          // Future profile view action
        }}
        className="w-full border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 font-bold py-3 rounded-2xl text-xs transition-all duration-200 cursor-pointer bg-white shadow-2xs"
      >
        View Seller Profile
      </button>
    </div>
  );
}
