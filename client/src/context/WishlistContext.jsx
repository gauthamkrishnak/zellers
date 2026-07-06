import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlistCount, setWishlistCount] = useState(0);

  const refreshWishlist = useCallback(async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/wishlist/");
      setWishlistCount(response.data.length);
    } catch (error) {
      console.error("Error fetching wishlist count:", error);
    }
  }, []);

  // Fetch on initial mount
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
