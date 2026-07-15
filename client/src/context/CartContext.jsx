import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { CreditCard, CheckCircle2, XCircle, ShieldCheck, X } from "lucide-react";

const CartContext = createContext(null);

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [simulatedModalData, setSimulatedModalData] = useState(null);
  const [unavailableModalOpen, setUnavailableModalOpen] = useState(false);
  const { getAuthHeaders, isAuthenticated, user } = useAuth();

  // Fetch cart from the backend
  const fetchCart = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!isAuthenticated || !headers.Authorization) {
      setCartItems([]);
      return;
    }
    try {
      const response = await axios.get("http://127.0.0.1:8000/cart/", {
        headers,
      });
      setCartItems(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setCartItems([]);
      } else {
        console.error("Error fetching cart:", error);
      }
    }
  }, [getAuthHeaders, isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product) => {
    const activeHeaders = getAuthHeaders();
    if (!isAuthenticated || !activeHeaders.Authorization) {
      alert("Please login to add items to your cart.");
      window.location.href = "/login";
      return;
    }
    try {
      await axios.post(
        `http://127.0.0.1:8000/cart/${product.id}`,
        {},
        { headers: activeHeaders },
      );
      setCartItems((prevItems) => {
        const exists = prevItems.find((item) => item.id === product.id);
        if (exists) return prevItems;
        return [...prevItems, product];
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Your session has expired. Please login again.");
        window.location.href = "/login";
      } else {
        console.error("Error adding to cart:", error);
      }
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/cart/${productId}`,
        { headers: getAuthHeaders() },
      );
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const removeSoldItems = async () => {
    try {
      await axios.delete("http://127.0.0.1:8000/cart/remove-sold", {
        headers: getAuthHeaders(),
      });
      setCartItems((prevItems) =>
        prevItems.filter((item) => !(item.is_sold || item.status === "sold"))
      );
      await fetchCart();
    } catch (error) {
      console.error("Error removing sold items from cart:", error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete("http://127.0.0.1:8000/cart/", {
        headers: getAuthHeaders(),
      });
      setCartItems([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const hasSoldItems = cartItems.some(
    (item) => Boolean(item.is_sold || item.status === "sold")
  );

  const availableCount = cartItems.filter(
    (item) => !item.is_sold && item.status !== "sold"
  ).length;

  const soldCount = cartItems.filter(
    (item) => Boolean(item.is_sold || item.status === "sold")
  ).length;

  const handleRazorpayCheckout = async (navigate) => {
    if (!isAuthenticated) {
      alert("Please login to checkout.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    if (hasSoldItems) {
      setUnavailableModalOpen(true);
      return;
    }

    setIsCartOpen(false);
    if (navigate && typeof navigate === "function") {
      navigate("/checkout/payment");
    } else {
      window.location.href = "/checkout/payment";
    }
  };

  const completeSimulatedPayment = async (success) => {
    if (!simulatedModalData) return;
    const { data, navigate } = simulatedModalData;
    setSimulatedModalData(null);

    if (success) {
      try {
        setIsCheckingOut(true);
        const verifyRes = await axios.post(
          "http://127.0.0.1:8000/checkout/verify",
          {
            razorpay_order_id: data.razorpay_order_id,
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            razorpay_signature: `sig_sim_${Date.now()}`,
          },
          { headers: getAuthHeaders() }
        );
        if (verifyRes.data && verifyRes.data.success) {
          await fetchCart();
          setIsCartOpen(false);
          setIsCheckingOut(false);
          if (navigate && typeof navigate === "function") {
            navigate(`/order-success?order_id=${verifyRes.data.order_id}`);
          } else {
            window.location.href = `/order-success?order_id=${verifyRes.data.order_id}`;
          }
        }
      } catch (err) {
        setCheckoutError(
          err.response?.data?.detail || "Payment verification failed."
        );
        setIsCheckingOut(false);
      }
    } else {
      try {
        await axios.post(
          "http://127.0.0.1:8000/checkout/failure",
          {
            razorpay_order_id: data.razorpay_order_id,
            error_description: "User simulated payment failure",
          },
          { headers: getAuthHeaders() }
        );
      } catch (e) {}
      setCheckoutError(
        "Payment Failed. Your cart items remain unchanged and safe in your cart."
      );
      setIsCheckingOut(false);
    }
  };

  const cartTotal = cartItems.reduce((total, item) => {
    const isSold = Boolean(item.is_sold || item.status === "sold");
    return isSold ? total : total + (item.price || 0);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        removeSoldItems,
        clearCart,
        checkout: handleRazorpayCheckout,
        handleRazorpayCheckout,
        isCheckingOut,
        checkoutError,
        setCheckoutError,
        cartTotal,
        availableCount,
        soldCount,
        hasSoldItems,
        isCartOpen,
        setIsCartOpen,
        fetchCart,
        unavailableModalOpen,
        setUnavailableModalOpen,
      }}
    >
      {children}

      {/* Global Unavailable Items Modal */}
      {unavailableModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
              <XCircle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">
                Some items in your cart are no longer available.
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Review your cart before proceeding.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setUnavailableModalOpen(false);
                  setIsCartOpen(true);
                  if (window.location.pathname.includes("/checkout")) {
                    window.location.href = "/cart";
                  }
                }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              >
                Review Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

