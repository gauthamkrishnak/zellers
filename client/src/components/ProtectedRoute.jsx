import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps protected routes. If the user has no JWT token, redirect to /login.
 */
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
