import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Check,
  Tag,
} from "lucide-react";

function Hero() {
  const handleScrollToProducts = () => {
    const featuredSection = document.getElementById(
      "featured-products-section",
    );
    if (featuredSection) {
      featuredSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 mt-3">
      <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 shadow-xl shadow-indigo-950/15 px-6 sm:px-12 py-8 sm:py-10">
        {/* Decorative background glow circles */}
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 max-w-7xl mx-auto">
          {/* Left Text & Actions */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            {/* Sparkles pill tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-[11px] font-semibold tracking-wide uppercase mb-3.5">
              <Sparkles size={13} className="text-indigo-400" />
              <span>Kochi's Premier Marketplace</span>
            </div>

            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Discover your next{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
                favorite item
              </span>
            </h1>

            <p className="text-indigo-200/80 text-xs sm:text-sm mt-2.5 max-w-lg leading-relaxed font-normal mx-auto lg:mx-0">
              Browse quality listings from trusted local sellers. Buy, sell, and
              trade items in your neighborhood with zero hassle.
            </p>

            {/* Action Buttons */}
            <div className="flex sm:flex-row items-center justify-center lg:justify-start gap-3 mt-5 w-full sm:w-auto">
              <button
                onClick={handleScrollToProducts}
                className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm px-6 py-2.5 sm:py-3 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Explore Now</span>
                <ArrowRight
                  size={15}
                  className="text-slate-900 group-hover:translate-x-1 transition-transform duration-200"
                />
              </button>

              <button className="w-full sm:w-auto border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 sm:py-3 rounded-xl backdrop-blur-sm hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
                <span>How it Works</span>
              </button>
            </div>

            {/* Marketplace Trust Pillars */}
            <div className="hidden sm:flex items-center justify-center lg:justify-start gap-6 mt-6 pt-5 border-t border-white/10 text-[11px] text-indigo-200/90 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                <span>Verified Local Sellers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-amber-400 shrink-0" />
                <span>Instant Buy Now Flow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock size={14} className="text-indigo-400 shrink-0" />
                <span>Encrypted Razorpay Gateway</span>
              </div>
            </div>
          </div>

          {/* Right Floating Glass Product Showcase (Desktop Only) */}
          <div className="hidden lg:flex shrink-0 relative w-[380px] h-[210px] items-center justify-center">
            {/* Live Notification Floating Badge */}
            <div className="absolute -top-1 left-4 z-30 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full px-3 py-1 text-[11px] font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md">
              <Check size={12} className="text-emerald-400 shrink-0" />
              <span>Live: 24 items purchased today</span>
            </div>

            {/* Secondary Back Glass Card (Headphones) */}
            <div className="absolute left-2 bottom-3 z-10 bg-slate-900/75 border border-white/10 rounded-2xl p-3.5 w-56 shadow-xl backdrop-blur-md transform -rotate-3 hover:-rotate-1 transition-all duration-300">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Audio & Tech
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                  Like New
                </span>
              </div>
              <p className="text-white font-bold text-xs truncate">
                Sony WH-1000XM5 ANC Headphones
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                <span className="text-indigo-300 font-extrabold text-sm">
                  ₹21,999
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Tag size={10} /> Kochi
                </span>
              </div>
            </div>

            {/* Primary Front Glass Card (iPhone Sponsored) */}
            <div className="absolute right-2 top-4 z-20 bg-slate-900/90 border border-white/20 rounded-2xl p-4 w-64 shadow-2xl backdrop-blur-md transform rotate-1 hover:rotate-0 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  ⭐ Sponsored
                </span>
                <span className="text-[10px] font-semibold text-blue-300 bg-blue-400/20 border border-blue-400/30 px-2 py-0.5 rounded-full">
                  Brand New
                </span>
              </div>
              <p className="text-white font-black text-sm truncate">
                Apple iPhone 15 Pro (256GB)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                Natural Titanium • Sealed Box
              </p>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/15">
                <div>
                  <span className="text-[10px] text-slate-400 block leading-none">
                    Verified Price
                  </span>
                  <span className="text-emerald-400 font-black text-base mt-0.5 block">
                    ₹98,500
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-indigo-500/15 border border-indigo-500/30 px-2 py-1 rounded-lg text-[10px] font-bold text-indigo-300">
                  <ShieldCheck size={12} className="text-indigo-400" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
