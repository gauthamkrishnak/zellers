import { useState } from "react";
import { Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        await axios.post("http://127.0.0.1:8000/register", {
          email: form.email,
          password: form.password,
        });
      }

      const response = await axios.post("http://127.0.0.1:8000/login", {
        email: form.email,
        password: form.password,
      });

      login(response.data.access_token);
      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.detail || "Authentication failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: wire up Google OAuth here
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex-col items-center justify-center px-16">
        {/* Glow orbs */}
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-900/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-extrabold text-5xl tracking-tight bg-gradient-to-r from-indigo-300 via-violet-300 to-indigo-200 bg-clip-text text-transparent mb-2">
              Zellers
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-10">
              <Sparkles size={12} />
              <span>Kochi's Premier Marketplace</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <h2 className="text-white text-4xl font-extrabold leading-tight tracking-tight">
              Buy, sell &amp; trade{" "}
              <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
                locally
              </span>
              <br />
              with ease.
            </h2>
            <p className="text-indigo-200/70 mt-5 text-base leading-relaxed">
              Join thousands of trusted sellers and buyers in your community.
              Your next great deal is just a sign-in away.
            </p>
          </motion.div>

          {/* Stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 grid grid-cols-3 gap-4"
          >
            {[
              { label: "Active Listings", value: "10K+" },
              { label: "Trusted Sellers", value: "4.8K+" },
              { label: "Verified Trades", value: "25K+" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm"
              >
                <p className="text-white font-extrabold text-2xl">
                  {stat.value}
                </p>
                <p className="text-slate-400 text-xs uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="font-extrabold text-4xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Zellers
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Kochi's Premier Marketplace
            </p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isRegistering ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              {isRegistering ? "Sign up to get started" : "Sign in to your account to continue"}
            </p>
          </div>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer group"
          >
            {/* Google G logo SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
            <ArrowRight
              size={16}
              className="ml-auto text-slate-400 group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Username / Password Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-sm shadow-sm"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                {!isRegistering && (
                  <button
                    type="button"
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors cursor-pointer required"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 text-sm shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-[1.01] active:scale-95 transition-all duration-200 mt-2 cursor-pointer"
            >
              {loading
                ? isRegistering
                  ? "Creating account..."
                  : "Signing in..."
                : isRegistering
                ? "Sign Up"
                : "Sign In"}
            </button>
          </form>

          {/* Sign up prompt */}
          <p className="text-center text-sm text-slate-500 mt-6">
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors cursor-pointer"
            >
              {isRegistering ? "Sign in instead" : "Create one for free"}
            </button>
          </p>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2 mt-8 text-slate-400 text-xs">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Secured with end-to-end encryption</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
