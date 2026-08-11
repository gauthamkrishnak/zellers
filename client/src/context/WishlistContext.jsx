import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { API_BASE_URL } from "../config";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlistCount, setWishlistCount] = useState(0);
  const { getAuthHeaders, isAuthenticated } = useAuth();

  const refreshWishlist = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!isAuthenticated || !headers.Authorization) {
      setWishlistCount(0);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/wishlist/`, {
        headers,
      });
      setWishlistCount(response.data.length);
    } catch (error) {
      console.error("Error fetching wishlist count:", error);
      setWishlistCount(0);
    }
  }, [getAuthHeaders, isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  return (
    <WishlistContext.Provider value={{ wishlistCount, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
