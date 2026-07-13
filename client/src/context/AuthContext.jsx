import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const storedUser = () => {
  try {
    const raw = localStorage.getItem("user_info");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [user, setUser] = useState(storedUser);

  useEffect(() => {
    if (token) {
      axios
        .get("http://127.0.0.1:8000/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data);
          localStorage.setItem("user_info", JSON.stringify(response.data));
        })
        .catch((error) => {
          console.error("Could not load user profile:", error);
        });
    }
  }, [token]);

  const login = (newToken, userInfo) => {
    localStorage.setItem("access_token", newToken);
    if (userInfo) {
      localStorage.setItem("user_info", JSON.stringify(userInfo));
      setUser(userInfo);
    }
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    setToken(null);
    setUser(null);
  };

  // Helper to get auth headers for API calls
  const getAuthHeaders = () => {
    const activeToken = localStorage.getItem("access_token") || token;
    if (!activeToken) return {};
    return { Authorization: `Bearer ${activeToken}` };
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        login,
        logout,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
