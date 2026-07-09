import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getAuthHeaders, isAuthenticated } = useAuth();

  // Fetch cart from the backend
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }
    try {
      const response = await axios.get("http://127.0.0.1:8000/cart/", {
        headers: getAuthHeaders(),
      });
      setCartItems(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  }, [getAuthHeaders, isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product) => {
    if (!isAuthenticated) {
      alert("Please login to add items to your cart.");
      return;
    }
    try {
      await axios.post(
        `http://127.0.0.1:8000/cart/${product.id}`,
        {},
        { headers: getAuthHeaders() },
      );
      setCartItems((prevItems) => {
        const exists = prevItems.find((item) => item.id === product.id);
        if (exists) return prevItems;
        return [...prevItems, product];
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
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

  const checkout = async () => {
    if (cartItems.length > 0) {
      alert("Checkout successful! Your order has been placed.");
      await clearCart();
      setIsCartOpen(false);
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
        checkout,
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
