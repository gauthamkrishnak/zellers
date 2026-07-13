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

  const handleRazorpayCheckout = async (navigate) => {
    if (!isAuthenticated) {
      alert("Please login to checkout.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
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
      // Failed payment simulation
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

  const cartTotal = cartItems.reduce((total, item) => total + item.price, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        checkout: handleRazorpayCheckout,
        handleRazorpayCheckout,
        isCheckingOut,
        checkoutError,
        setCheckoutError,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

