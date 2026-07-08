import { X, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

function CartSidebar() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, clearCart, checkout, cartTotal } = useCart();

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
          <h2 className="text-xl font-extrabold text-slate-800">Your Cart</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
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
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-semibold">Total</span>
              <span className="text-xl font-extrabold text-indigo-600">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={clearCart}
                className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
              <button
                onClick={checkout}
                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CartSidebar;
