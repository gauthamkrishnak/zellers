import { X, Trash2, ShoppingBag, CreditCard, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartSidebar() {
  const navigate = useNavigate();
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    clearCart,
    checkout,
    cartTotal,
    isCheckingOut,
    checkoutError,
  } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[80] transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsCartOpen(false)}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-[90] transform transition-transform duration-300 flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <ShoppingBag size={20} className="text-indigo-600" />
            Your Cart
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {checkoutError && (
          <div className="mx-4 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs">
            <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="font-bold text-rose-900">Payment Unsuccessful</p>
              <p className="text-rose-700 mt-0.5">{checkoutError}</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
              <ShoppingBag size={36} className="text-slate-300" />
              <span className="text-sm font-medium">Your cart is empty.</span>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={`http://127.0.0.1:8000/uploads/${item.image}`}
                    alt={item.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-2">{item.title}</h3>
                  <p className="text-indigo-600 font-extrabold text-sm">₹{item.price.toLocaleString("en-IN")}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-semibold">Total</span>
              <span className="text-xl font-extrabold text-indigo-600">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <button
              onClick={() => checkout(navigate)}
              disabled={isCheckingOut}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard size={18} />
              <span>{isCheckingOut ? "Initiating..." : "Checkout"}</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate("/cart");
                }}
                className="flex-1 px-3 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-center"
              >
                View Full Cart Page
              </button>
              <button
                onClick={clearCart}
                className="px-3 py-2.5 bg-white border border-rose-200 text-rose-600 font-semibold text-xs rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


export default CartSidebar;
