import { Link } from "react-router-dom";
import { Heart, Package, ShoppingBag, Settings, Store } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800/80 mt-16 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand & Description */}
          <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between">
            <div>
              <Link to="/" className="inline-block group">
                <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                  Zellers
                </h2>
              </Link>
              <p className="mt-3.5 text-sm sm:text-base text-slate-400 max-w-sm leading-relaxed">
                Your premier local marketplace to buy and sell electronics,
                furniture, vehicles, and lifestyle goods with ease and confidence.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 lg:col-span-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Store size={16} className="text-indigo-400" />
              <span>Explore</span>
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link
                  to="/"
                  className="hover:text-indigo-400 transition-colors duration-150 block"
                >
                  Marketplace Home
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="hover:text-indigo-400 transition-colors duration-150 flex items-center gap-2"
                >
                  <Heart size={15} />
                  <span>My Wishlist</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/my-purchases"
                  className="hover:text-indigo-400 transition-colors duration-150 flex items-center gap-2"
                >
                  <ShoppingBag size={15} />
                  <span>My Purchases</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Seller & Account */}
          <div className="md:col-span-3 lg:col-span-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Settings size={16} className="text-indigo-400" />
              <span>Account & Selling</span>
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <Link
                  to="/my-listings"
                  className="hover:text-indigo-400 transition-colors duration-150 flex items-center gap-2"
                >
                  <Package size={15} />
                  <span>My Listings</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/account"
                  className="hover:text-indigo-400 transition-colors duration-150 flex items-center gap-2"
                >
                  <Settings size={15} />
                  <span>Account Details</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Zellers. All rights reserved.</p>
          <p className="text-slate-500">Built for seamless local trading.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
