import { Sparkles, ArrowRight, ArrowDown } from "lucide-react";

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
    <div className="relative mx-4 md:mx-8 lg:mx-10 mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 shadow-xl shadow-indigo-950/15">
      {/* Decorative background glow circles */}
      <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 lg:px-20 py-16 md:py-24 gap-12">
        <div className="flex-1 text-center lg:text-left">
          {/* Sparkles tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-6 animate-pulse">
            <Sparkles size={13} />
            <span>Kochi's Premier Marketplace</span>
          </div>

          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-2xl">
            Discover your next <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
              favorite item
            </span>
          </h1>

          <p className="text-indigo-200/80 text-base md:text-lg lg:text-xl mt-6 max-w-xl leading-relaxed">
            Browse millions of quality listings from trusted sellers. Buy, sell,
            and trade items locally with ease.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-8">
            <button
              onClick={handleScrollToProducts}
              className="w-full sm:w-auto bg-white hover:bg-slate-100 text-indigo-950 font-bold px-8 py-4 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Explore Now</span>
              <ArrowRight
                size={18}
                className="text-indigo-950 group-hover:translate-x-1 transition-transform duration-200"
              />
            </button>

            <button className="w-full sm:w-auto border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl backdrop-blur-sm hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
              <span>How it Works</span>
            </button>
          </div>
        </div>

        {/* Hero Decorative Sidepanel (Simulated Stats or Badge) */}
        <div className="hidden lg:flex flex-col gap-4 w-80 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <span className="text-white font-bold text-lg">Market Stats</span>
            <span className="text-emerald-400 text-xs font-semibold bg-emerald-400/10 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">
                Active Listings
              </p>
              <p className="text-white font-extrabold text-2xl">10K+</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">
                Trusted Sellers
              </p>
              <p className="text-white font-extrabold text-2xl">4.8k+</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">
                Verified Trades
              </p>
              <p className="text-white font-extrabold text-2xl">25K+</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
